# Diagnostic Report — /book Calendar & /admin Dashboard Hänger
**Projekt:** urbanstrength — Personal Training by Martin
**Datum:** 2026-03-25
**Status:** Analyse-only, keine Code-Änderungen

---

## Executive Summary

Beide Probleme haben **denselben Ursprung**: SQL-Migrationsskripte wurden noch nicht in Supabase ausgeführt. Die RLS-Policies blockieren anonyme Zugriffe (→ leerer Kalender) und verursachen eine potenzielle Endlosrekursion auf der `profiles`-Tabelle (→ hängender Admin-Bereich). Zusätzlich gibt es Code-seitige Schwachstellen, die das Debugging verschleiern.

---

## Problem 1 — `/book` Kalender leer / endlos-loading

### Symptom
Alle drei Service-Seiten (`/book/probe-training`, `/book/kraft-ausdauer`, `/book/mobility-flexibility`) zeigen entweder einen Spinner der nie endet, oder "Derzeit keine Termine verfügbar." — obwohl Termine in der DB eingetragen sein sollten.

### Root Cause #1 (Hauptursache): RLS-Policy nicht angewendet

**Datei:** `supabase/fix_public_booking.sql` — wurde erstellt und gepusht, aber **noch nicht im Supabase SQL Editor ausgeführt**.

Was in Supabase fehlt:

```sql
-- Fehlt in Produktion:
CREATE POLICY "Anyone can view availability"
  ON availability FOR SELECT USING (true);

CREATE POLICY "Anyone can view services"
  ON services FOR SELECT USING (true);
```

**Was passiert ohne diese Policies:**
Supabase gibt bei blockierter RLS keinen 403-Fehler zurück — es gibt einen **stillen leeren Array** zurück mit HTTP-Status 200. Das bedeutet:

1. `AvailabilityCalendar.tsx` macht den Query `from('availability').select('*').eq('is_available', true)`
2. Supabase filtert alle Zeilen heraus (anonymer User, kein `USING`-Match)
3. Rückgabe: `data = []`, `error = null`
4. Kalender-Component interpretiert das als "keine Termine in der DB"

**Beweis-Pfad im Code:**

```
components/booking/AvailabilityCalendar.tsx : 63-66
  → query: from('availability').select('*').eq('is_available', true)
  → bei RLS-Block: data=[], error=null (kein sichtbarer Fehler)

components/booking/AvailabilityCalendar.tsx : 111
  const noDataInDB = !isLoading && !fetchError && specific.length === 0 && recurring.length === 0
  → noDataInDB = true → zeigt "Derzeit keine Termine verfügbar."
```

### Root Cause #2: Kein Fehler-Logging für leeres Ergebnis

```
components/booking/AvailabilityCalendar.tsx : 57-95
```

Das Component unterscheidet nicht zwischen:
- "Datenbank hat keine Einträge" (echtes Problem)
- "RLS hat alle Einträge gefiltert" (Policy-Problem)
- "Query-Fehler" (Netzwerk/Config-Problem)

Alle drei Szenarien enden identisch: `noDataInDB = true` → selbe "keine Termine"-Meldung.

### Root Cause #3: `isLoading` bleibt ggf. `true` (Loading-Hänger)

```
components/booking/AvailabilityCalendar.tsx : 57-95 (useEffect)
```

Wenn der Supabase-Call hängt (z.B. langsame Verbindung, Timeout), bleibt `isLoading = true` für immer, weil `setIsLoading(false)` nur im `finally`-Block aufgerufen wird. Wenn der Promise nie resolvet (Network-Timeout nach 60s), zeigt die Seite dauerhaft den Spinner.

### Root Cause #4: Services-Query (Sidebar)

```
app/book/[serviceId]/page.tsx : 92-102
  → from('services').select('*').ilike('title', ...)
  → ohne "Anyone can view services" Policy: data = null, service nicht gefunden
  → Seite bleibt leer weil kein Service geladen wurde
```

Die `/book/[serviceId]` Seite lädt den Service-Datensatz via Query. Ohne die SELECT-Policy auf `services` findet sie nichts → zeigt möglicherweise gar keine Seite.

---

## Problem 2 — `/admin/login` und `/admin/dashboard` hängen

### Symptom
Login-Seite lädt lange, Dashboard dreht Spinner und leitet nach ~8 Sekunden wieder zur Login-Seite weiter. Schleife.

### Root Cause #1 (Hauptursache): RLS-Rekursion auf `profiles`-Tabelle

**Datei:** `supabase/fix_admin_rls.sql` — wurde **noch nicht ausgeführt**.

Die `profiles`-Tabelle hat noch die Original-RLS-Policy aus `schema.sql`:

```sql
-- Original-Policy (noch aktiv in Supabase):
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

Diese Policy erlaubt nur dem User seinen eigenen Profil-Eintrag zu lesen. **Das Middleware-Code versucht aber den Profil-Eintrag des eingeloggten Users zu lesen** — das ist der eigene Eintrag, also sollte es funktionieren.

**ABER**: Andere Policies könnten die Situation verschlechtern. Wenn `fix_admin_rls.sql` teilweise angewendet wurde, gibt es folgendes Szenario:

```sql
-- fix_admin_rls.sql erstellt:
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Dann Policy:
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT USING (is_admin());
```

**Rekursions-Kette:**
```
middleware.ts:37  → profiles SELECT
  → RLS Policy "Admin can view all profiles" prüft is_admin()
  → is_admin() macht SELECT auf profiles
  → RLS Policy "Admin can view all profiles" prüft is_admin()
  → is_admin() macht SELECT auf profiles
  → [Infinite Loop / Timeout]
```

Obwohl `is_admin()` als `SECURITY DEFINER` markiert ist (was RLS umgehen sollte), sind es gerade **Supabase-spezifische Eigenheiten** bei `SECURITY DEFINER`-Funktionen auf `auth.uid()`, die dies nicht immer korrekt verhindern.

### Root Cause #2: Middleware lädt `profiles` zweimal

**Datei:** `lib/supabase/middleware.ts`

```typescript
// Zeile 37-42: Beim Aufruf von /admin/login (wenn bereits eingeloggt)
const { data: profile } = await supabase
  .from('profiles').select('role').eq('id', user.id).single()

// Zeile 67-72: Bei allen /admin/* Routen
const { data: profile } = await supabase
  .from('profiles').select('role').eq('id', user.id).single()
```

Jede Request auf `/admin/*` löst **mindestens einen `profiles`-Query** aus. Wenn dieser hängt (RLS-Rekursion oder langsamer Query ohne Index), hängt die gesamte Request-Verarbeitung in der Middleware.

**Konsequenz:** Der Browser wartet auf eine Response, die nie kommt (oder erst nach 30s Timeout), und zeigt daher "lädt...".

### Root Cause #3: AuthContext `fetchProfile` — stille Fehler

**Datei:** `contexts/AuthContext.tsx`

```typescript
// Zeile 27-34
const fetchProfile = async (userId: string) => {
  const { data } = await supabase           // ← error wird ignoriert!
    .from('profiles')
    .select('id, email, full_name, ...')
    .eq('id', userId)
    .single()
  setProfile(data)                           // ← null wenn error, kein catch
}
```

Wenn der `profiles`-Query fehlschlägt (RLS-Fehler, Rekursion, Timeout):
- `data = null`
- `error` wird nicht geprüft
- `setProfile(null)` → kein Profil gesetzt
- `setIsLoading(false)` wird trotzdem aufgerufen (Zeile 46)
- **AdminLayout sieht**: `isLoading=false`, `profile=null` → startet 8-Sekunden-Redirect-Timer

### Root Cause #4: AdminLayout 8-Sekunden-Timeout-Loop

**Datei:** `components/admin/AdminLayout.tsx`

```typescript
// Zeile 38-42: Timeout
useEffect(() => {
  if (isLoginPage) return
  const t = setTimeout(() => setTimedOut(true), 8000)
  return () => clearTimeout(t)
}, [isLoginPage])

// Zeile 48-57: Spinner / Redirect
if (isLoading || !profile || profile.role !== 'admin') {
  if (timedOut) {
    window.location.href = '/admin/login'   // ← forcierter Redirect nach 8s
    return null
  }
  return <Spinner />                         // ← 8s Spinner dann Loop
}
```

**Vollständige Loop-Kette:**
1. User öffnet `/admin/login`
2. Middleware-Query auf `profiles` hängt (RLS-Rekursion)
3. Seite lädt langsam oder hängt
4. User gibt Credentials ein
5. `signInWithPassword()` erfolgreich
6. AuthContext fetcht Profile → hängt oder gibt `null` zurück
7. AdminLayout zeigt Spinner
8. Nach 8 Sekunden: `window.location.href = '/admin/login'`
9. Neustart bei Schritt 1 → **Endlosschleife**

### Root Cause #5: `performance_upgrades.sql` nicht ausgeführt

**Dateien:** `app/admin/analytics/page.tsx`, `app/admin/chat/page.tsx`

Beide Seiten rufen RPC-Funktionen auf:
```typescript
// analytics/page.tsx
const { data, error } = await supabase.rpc('get_analytics_summary')

// chat/page.tsx
const { data, error } = await supabase.rpc('get_chat_overview')
```

Da `performance_upgrades.sql` noch nicht ausgeführt wurde, existieren diese Funktionen nicht. Die Pages zeigen Error-Banner — aber das stoppt die anderen Admin-Seiten nicht.

---

## Vollständige Abhängigkeits-Übersicht

```
PROBLEM 1 (/book Kalender leer)
├── DIREKT: fix_public_booking.sql NICHT ausgeführt
│   ├── "Anyone can view availability" Policy fehlt → leeres [] statt Daten
│   └── "Anyone can view services" Policy fehlt → Service-Lookup schlägt fehl
└── CODE: AvailabilityCalendar.tsx unterscheidet nicht RLS-leer vs. DB-leer

PROBLEM 2 (/admin hängt)
├── DIREKT: profiles-Tabelle hat kein Index + mögliche RLS-Rekursion
│   ├── middleware.ts queries profiles auf jeder Request
│   └── fix_admin_rls.sql möglicherweise nicht oder teilweise ausgeführt
├── CODE: AuthContext.tsx schluckt fetchProfile-Fehler still
├── CODE: AdminLayout.tsx 8s-Timeout → Redirect-Loop zur Login-Seite
└── SEKUNDÄR: performance_upgrades.sql nicht ausgeführt
    └── Analytics und Chat zeigen Error-Banner (nicht Hauptursache des Hängers)
```

---

## Fehlende SQL-Migrationen (Übersicht)

| Datei | Status | Effekt wenn nicht ausgeführt |
|-------|--------|------------------------------|
| `supabase/fix_public_booking.sql` | **NICHT ausgeführt** | Kalender leer, Services nicht ladbar, Buchung unmöglich |
| `supabase/fix_admin_rls.sql` | **NICHT ausgeführt** | Potenzielle RLS-Rekursion auf profiles, Admin-Hänger |
| `supabase/performance_upgrades.sql` | **NICHT ausgeführt** | Analytics + Chat zeigen Error-Banner, keine DB-Indizes |

---

## Code-seitige Schwachstellen (unabhängig von SQL)

| Datei | Zeilen | Problem |
|-------|--------|---------|
| `components/booking/AvailabilityCalendar.tsx` | 111 | `noDataInDB` unterscheidet nicht zwischen leer-DB und RLS-Block |
| `contexts/AuthContext.tsx` | 28-34 | `fetchProfile` Error wird nicht gefangen/geloggt |
| `lib/supabase/middleware.ts` | 37-42, 67-72 | Profiles-Query auf jeder Request, ohne Fehler-Fallback |
| `components/admin/AdminLayout.tsx` | 48-57 | 8s-Timeout führt zu Redirect-Loop wenn Profile null bleibt |

---

## Verifikations-Queries für Supabase SQL Editor

Um den aktuellen Zustand der Policies zu prüfen, diese Queries im Supabase SQL Editor ausführen:

```sql
-- Welche Policies existieren auf availability?
SELECT policyname, cmd, qual
FROM pg_policies WHERE tablename = 'availability';

-- Welche Policies existieren auf services?
SELECT policyname, cmd, qual
FROM pg_policies WHERE tablename = 'services';

-- Welche Policies existieren auf bookings?
SELECT policyname, cmd, qual
FROM pg_policies WHERE tablename = 'bookings';

-- Welche Policies existieren auf profiles?
SELECT policyname, cmd, qual
FROM pg_policies WHERE tablename = 'profiles';

-- Existiert is_admin() Funktion?
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'is_admin';

-- Existieren die RPC-Funktionen?
SELECT proname FROM pg_proc
WHERE proname IN ('get_analytics_summary', 'get_chat_overview');
```

**Erwartete Ergebnisse nach korrekter Migration:**

| Query | Erwartetes Ergebnis |
|-------|---------------------|
| availability policies | `"Anyone can view availability"` FOR SELECT |
| services policies | `"Anyone can view services"` FOR SELECT |
| bookings policies | `"Anyone can create bookings"` FOR INSERT |
| profiles policies | `"Users can view own profile"` + evtl. `"Admin can view all profiles"` |
| is_admin | 1 Zeile, `prosecdef = true` |
| RPCs | 2 Zeilen: `get_analytics_summary`, `get_chat_overview` |

---

## Empfohlene Reihenfolge der Fixes (nur SQL, kein Code)

**Schritt 1** — Sofort (behebt /book Kalender):
```
Supabase Dashboard → SQL Editor → New Query
→ Inhalt von supabase/fix_public_booking.sql einfügen → Run
```

**Schritt 2** — Admin-Hänger (behebt /admin Login-Loop):
```
Supabase Dashboard → SQL Editor → New Query
→ Inhalt von supabase/fix_admin_rls.sql einfügen → Run
```

**Schritt 3** — Performance + Analytics/Chat (optional, aber empfohlen):
```
Supabase Dashboard → SQL Editor → New Query
→ Inhalt von supabase/performance_upgrades.sql einfügen → Run
```

**Wichtig:** Schritt 1 vor Schritt 2 ausführen. Schritt 2 ändert die profiles-Tabelle — wenn die öffentlichen Policies noch fehlen, könnten andere Dinge kaputt gehen.

---

## Browser-Console Diagnose-Anleitung

Um selbst zu verifizieren welches Problem vorliegt:

### Für /book:
1. Browser öffnen, DevTools → Network Tab
2. `/book/probe-training` öffnen
3. Filter auf "availability" setzen
4. Request anschauen:
   - **Status 200, Response `[]`** → RLS filtert, Policy fehlt
   - **Status 200, Response mit Daten** → Kalender-Bug, nicht RLS
   - **Status 403/401** → RLS blockiert aktiv (ungewöhnlich für Supabase)
   - **Kein Request** → Component rendert nicht (JS-Fehler)

### Für /admin:
1. Browser öffnen, DevTools → Network Tab + Console Tab
2. `/admin/login` öffnen, Credentials eingeben
3. Auf Profile-Request achten:
   - **Hängt (pending, kein Response)** → RLS-Rekursion / Timeout
   - **Status 200, Response `null`** → fetchProfile bekommt null → Auth-Loop
   - **Console-Fehler `infinite recursion`** → RLS-Rekursion bestätigt
   - **Console: `[Admin Chat] RPC error`** → performance_upgrades.sql fehlt (sekundär)

---

## Fazit

**Beide Probleme sind primär durch nicht ausgeführte SQL-Migrationen verursacht.** Alle drei Dateien in `supabase/` wurden erstellt und nach GitHub gepusht, aber der Supabase-Dienst liest keine Dateien aus GitHub — alle SQL-Änderungen müssen manuell im Supabase Dashboard SQL Editor ausgeführt werden.

Die Code-seitigen Schwachstellen (stille Fehler, keine RLS-Unterscheidung, 8s-Timeout-Loop) verschlimmern das Symptom und machen das Debuggen schwieriger, sind aber **nicht die Primärursache** der sichtbaren Probleme.

**Nach Ausführung aller drei SQL-Dateien sollten beide Probleme behoben sein.**
