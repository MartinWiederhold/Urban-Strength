# Performance Audit Report

**Projekt:** urbanstrength (Next.js 14.2, React 18, Supabase, App Router)  
**Audit-Datum:** 2026-03-24  
**Methodik:** Code- und Datenfluss-Review, Build-Metriken (`next build`), keine Live-Profiling-Läufe in Produktion.

---

## 1. Executive Summary

Die wahrgenommene **Langsamkeit** und gelegentlichen **Hänger** im Admin-Bereich sind **kein einzelnes UI-Problem**, sondern vor allem eine Kombination aus:

1. **Sehr grosse, ungebremste Datenladung** aus Supabase (vollständige Tabellen ohne Pagination / Aggregation).
2. **Schwere Client-Arbeit** nach dem Fetch (insbesondere **Analytics**: alle Buchungen + mehrfache Voll-Iterationen + Recharts).
3. **Request-Stürme** auf der **Admin-Chat-Übersicht** (pro Kunde mehrere parallele Queries → bei wachsender Kundenliste extrem teuer und instabil).
4. **Globales Auth-Gate**: Jede Admin-Seite wartet auf `AuthProvider` + blockiert das gesamte Layout mit Spinner; zusätzlich läuft **Middleware** mit `getUser()` auf praktisch allen Routes.
5. **Grosse Bundles** wo Charts und Admin-Logik gebündelt sind (**`/admin/analytics` ~111 kB Modul, ~265 kB First Load JS** laut Build).

Die **öffentliche Landingpage** ist vergleichsweise moderat (First Load ~172 kB für `/`); **Mapbox** wird dort per **dynamischem Import** geladen (`MapSection`) – das ist eine positive Entkopplung. Kritisch für „Premium-Feeling“ sind dagegen **Admin-Dashboard**, **Analytics** und **Chat-Liste**.

**Grösste Hebel:** (a) Datenmenge und Query-Design für Admin, (b) eine Analytics-Strategie mit Server-seitiger Aggregation oder limitierten Zeiträumen, (c) Chat-Liste ohne N+1-Request-Muster, (d) Pagination / Cursor überall wo Tabellen wachsen, (e) optional Admin-Route-Gruppierung mit eigenem Layout/Provider um globale Client-Kosten zu begrenzen.

---

## 2. Kritische Findings

### F-1: Admin Analytics lädt die gesamte `bookings`-Historie und aggregiert im Browser

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Kritisch** (skaliert schlecht; Hauptursache für Freeze bei wachsenden Daten) |
| **Bereich** | Frontend + DB/API + Dashboard |
| **Beschreibung** | `app/admin/analytics/page.tsx` holt mit einem Call **alle** Buchungen inkl. Join `services(price, title, duration_minutes)` ohne `limit`, ohne Datumsfilter. Anschliessend werden im Client mehrere Schleifen über **alle** Zeilen ausgeführt (Monats- und Wochenaggregationen jeweils mit `bookings.filter` pro Periode, Status-/Source-Zählungen, Service-Umsätze, Conversion). |
| **Vermutete Ursache** | Schnelle Implementierung ohne skalierbare Aggregations-Schicht; keine Pagination/Time-Window. |
| **Betroffene Dateien** | `app/admin/analytics/page.tsx` |
| **Warum das Performance kostet** | Netzwerk-Payload wächst linear mit Buchungen; CPU-Zeit im Main-Thread wächst **überlinear** (viele wiederholte `filter`/`reduce` über dieselbe grosse Menge); Recharts rendert mehrere Charts danach → spürbare Blockierung und lange Ladezeit. |
| **Erwarteter Impact bei Behebung** | Hoch: Ladezeit und UI-Responsivität von Analytics typischerweise um Grössenordnungen besser, sobald nur noch aggregierte oder zeitlich begrenzte Daten ankommen. |

---

### F-2: Admin Chat-Liste – fan-out mit 2×N parallelen Supabase-Requests

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Kritisch** (bei N Kunden) |
| **Bereich** | Frontend + API + Dashboard |
| **Beschreibung** | `app/admin/chat/page.tsx`: Nach Laden aller Kunden-`profiles` wird `Promise.all(profiles.map(...))` ausgeführt. **Pro Profil** werden **zwei** separate Queries auf `chat_messages` ausgeführt (letzte Nachricht + Unread-Count). |
| **Vermutete Ursache** | Fehlende batch-/serverseitige Abfrage (z. B. eine Query mit Window-Funktionen, RPC oder gruppierte Subqueries). |
| **Betroffene Dateien** | `app/admin/chat/page.tsx` |
| **Warum das Performance kostet** | Bei z. B. 100 Kunden = **200 gleichzeitige** HTTP/Realtime-lastige Requests → Browser-Connection-Limits, Supabase-Rate-Limits, hohe Latenz, „Hängen“ oder Timeouts. |
| **Erwarteter Impact bei Behebung** | Sehr hoch: Chat-Übersicht wird von O(N) Requests auf O(1)–O(k) reduzierbar. |

---

### F-3: Admin Buchungen – volle Tabelle, kein Pagination; voller Re-Fetch nach Mutationen

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Hoch** |
| **Bereich** | Frontend + DB + Dashboard |
| **Beschreibung** | `app/admin/bookings/page.tsx` lädt **alle** Buchungen mit Joins `profiles(...)`, `services(...)` bei Filterwechsel komplett neu. Nach Status-Update oder `togglePaid` wird **`fetchBookings()`** erneut aufgerufen und lädt wieder die **gesamte** Liste. |
| **Vermutete Ursache** | Keine serverseitige Pagination; Optimistic UI / partielle Updates fehlen. |
| **Betroffene Dateien** | `app/admin/bookings/page.tsx` |
| **Warum das Performance kostet** | Payload und Render-Zeit wachsen linear; jede kleine Änderung triggert grossen Refetch + kompletten Re-Render der Tabelle (inkl. `animate-in` mit gestaffeltem `animationDelay` pro Zeile). |
| **Erwarteter Impact bei Behebung** | Hoch bei vielen Buchungen; mittel bei wenigen. |

---

### F-4: Admin Kundenliste – alle Profile, Client-Suche, mehrfache Filter-Pässe in der Render-Phase

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Mittel** (steigt mit Kundenzahl) |
| **Bereich** | Frontend + Dashboard |
| **Beschreibung** | `app/admin/customers/page.tsx`: `select('*')` für alle Kunden ohne Limit. Suche läuft per `customers.filter` bei jedem Tastendruck. Stat-Kacheln iterieren `customers.filter` pro Status (**4×** pro Render). |
| **Betroffene Dateien** | `app/admin/customers/page.tsx` |
| **Warum das Performance kostet** | Grosse Arrays im Speicher; unnötige Arbeit bei jedem Render (Stats nicht memoized). |
| **Erwarteter Impact bei Behebung** | Mittel: Server-Suche + Pagination oder `useMemo` für Stats + limitierte Felder. |

---

### F-5: `createBrowserClient` pro Render / pro Komponente – kein Singleton

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Mittel** (Stabilität / Speicher / schwer zu messende Nebenwirkungen) |
| **Bereich** | Frontend / Architektur |
| **Beschreibung** | `lib/supabase/client.ts` exportiert `createClient()`, das bei jedem Aufruf einen **neuen** Browser-Client erzeugt. `AuthProvider` ruft `createClient()` im **Render-Body** auf (`contexts/AuthContext.tsx`), nicht in `useMemo`. `app/admin/chat/[customerId]/page.tsx` hält `const supabase = createClient()` auf Top-Level der Komponente → **neuer Client bei jedem Re-Render**. |
| **Vermutete Ursache** | Übliches Supabase-SSR-Pattern ohne Singleton-Wrapper für CSR. |
| **Betroffene Dateien** | `lib/supabase/client.ts`, `contexts/AuthContext.tsx`, u. a. `app/admin/chat/[customerId]/page.tsx` |
| **Warum das Performance kostet** | Zusätzliche Instanzen, mögliche doppelte Listener, erschwerte Realtime-Channel-Verwaltung, unnötige Allokation. |
| **Erwarteter Impact bei Behebung** | Mittel für Stabilität; gering bis mittel für reine FPS. |

---

### F-6: AdminLayout blockiert gesamtes Admin-UI bis Auth fertig (+ 8s Hard-Timeout)

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Mittel** (UX / wahrgenommene „Langsamkeit“) |
| **Bereich** | UX + Frontend |
| **Beschreibung** | `components/admin/AdminLayout.tsx`: Solange `useAuth().isLoading` oder Profil fehlt/nicht admin, wird **nur** ein Vollbild-Spinner gerendert; nach 8s `window.location.href = '/admin/login'`. |
| **Betroffene Dateien** | `components/admin/AdminLayout.tsx`, `contexts/AuthContext.tsx` |
| **Warum das Performance kostet** | Kein progressives Rendering; Nutzer wahrnehmen jede Session-/Netzwerk-Verzögerung als „Dashboard hängt“. |
| **Erwarteter Impact bei Behebung** | Mittel: Shell sofort, Daten nachladen; klarere Loading-States. |

---

### F-7: Middleware 79 kB + `getUser()` auf fast allen Routes

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Mittel** |
| **Bereich** | Infrastruktur / API |
| **Beschreibung** | `middleware.ts` matcht breit; `updateSession` ruft `supabase.auth.getUser()` auf. Build meldet **Middleware 79 kB**. |
| **Betroffene Dateien** | `middleware.ts`, `lib/supabase/middleware.ts` |
| **Warum das Performance kostet** | Jede Navigation trägt Edge-/Middleware-Kosten; `getUser` kann I/O implizieren. |
| **Erwarteter Impact bei Behebung** | Mittel: Matcher verschärfen (z. B. nur `/admin`, `/dashboard`, `/api/...`). |

---

### F-8: Recharts-Bundle auf Analytics-Route

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Mittel** |
| **Bereich** | Build / Frontend |
| **Beschreibung** | Build: `/admin/analytics` **111 kB** (Route) und **265 kB First Load JS**. Recharts wird direkt importiert (`BarChart`, `PieChart`, `LineChart`, …). |
| **Betroffene Dateien** | `app/admin/analytics/page.tsx` |
| **Warum das Performance kostet** | Parse-/Compile-/Execute-Zeit auf schwächeren Geräten; TTI steigt. |
| **Erwarteter Impact bei Behebung** | Mittel: `next/dynamic` für Chart-Bereich, leichtere Chart-Library, oder Server-rendered SVG. |

---

### F-9: Verfügbarkeits-Admin: sehr grosse Client-Komponente + volle `availability`-Tabelle

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Mittel** |
| **Bereich** | Frontend + Dashboard |
| **Beschreibung** | `app/admin/availability/page.tsx` ist **800+ Zeilen** mit viel Drag-State, Refs und `slots.filter` pro Tag/Woche. `load()` holt alle Slots mit `is_available = true` ohne Datumsfenster. |
| **Betroffene Dateien** | `app/admin/availability/page.tsx` |
| **Warum das Performance kostet** | Komplexe Interaktion + grosse Listen erhöhen Reconciliation-Kosten; wachsende DB-Rows laden alles. |
| **Erwarteter Impact bei Behebung** | Mittel: Aufteilen in Subkomponenten + `React.memo`, Datumsfenster in der Query, Virtualisierung für Listen-Ansicht. |

---

### F-10: Keine Error Boundaries

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Niedrig–Mittel** (Stabilität) |
| **Bereich** | UX / Frontend |
| **Beschreibung** | Kein `ErrorBoundary` / `error.tsx`-Nutzung für Admin-Subtree explizit für Chart-/Datenfehler abgefangen (Projekt-weit keine `componentDidCatch`-Treffer). |
| **Erwarteter Impact** | Isolierung von Fehlern, weniger „weisse/leere“ Hänger bei Exceptions. |

---

### F-11: `useSupabaseRealtime` – `onData` fehlt in `useEffect`-Dependencies

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Niedrig** (Korrektheit / subtile Bugs) |
| **Bereich** | Frontend |
| **Beschreibung** | `lib/hooks/useSupabaseRealtime.ts`: Effect hängt nur an `[table, event, filter]`, nicht an `onData`. Stale Closures möglich. |
| **Erwarteter Impact** | Stabilität von Realtime-Updates; indirekt UX. |

---

### F-12: Globale Fonts & Mapbox-CSS auf jeder Seite

| Feld | Inhalt |
|------|--------|
| **Schweregrad** | **Niedrig** |
| **Bereich** | Build / Netzwerk |
| **Beschreibung** | `app/layout.tsx`: **Outfit** (5 Gewichte) + **Inter** (3 Gewichte) via `next/font`; Mapbox-CSS immer im `<head>`. |
| **Warum** | Jede Route zahlt Font-Bytes; Mapbox-CSS auch ohne Karte. |
| **Erwarteter Impact** | Niedrig bis mittel: Mapbox-CSS nur auf Seiten mit Karte. |

---

## 3. Admin-Dashboard Deep Dive

### 3.1 Initialer Ladeprozess (jede Admin-Seite)

1. **HTML/JS** der Route laden (shared **~87 kB** First Load JS + route-spezifisch).
2. **`AuthProvider`** (`app/layout.tsx` umschliesst **alle** Seiten): `getSession()` + bei User `profiles.select('*')`.
3. **`AdminLayout`**: Wartet bis `profile` und `role === 'admin'` – sonst Vollbild-Spinner (max. 8s dann Redirect).
4. **Seiten-spezifischer `useEffect`**: jeweils neue `createClient()`-Aufrufe und Supabase-Queries.

**Engpass:** Schritte 2–3 serialisieren wahrgenommenes „Dashboard öffnet“; Daten der Seite kommen danach **noch einmal** extra.

### 3.2 Admin-Übersicht (`/admin`)

- **5 parallele** Queries (`Promise.all`): 4× Count-only + 1× `bookings` mit Joins limit 5.  
- Relativ **gesund**, solange Count-Queries auf indexierbaren Spalten und ohne RLS-Full-Scan bleiben (DB-Seite separat validieren).

### 3.3 Analytics (`/admin/analytics`) – teuerster Pfad

- **Ein** grosser `bookings`-Select + **ein** `profiles`-Count.
- **Client:** Mehrfache vollständige Durchläufe über `bookings`; 6+8 Iterationen mit eingebettetem `filter` → grobe Komplexität **O(Buchungen × Perioden)**.
- **UI:** 7× `AnimatedNumber` (jeweils `requestAnimationFrame` bis 1600ms) + mehrere `ResponsiveContainer`/Recharts → Main-Thread-Last direkt nach Datenankunft.

**Hänger-Risiko:** Blockierung des Main-Threads durch Aggregation + Chart-Layout in derselben Tick-Kette.

### 3.4 Buchungen (`/admin/bookings`)

- Volle Liste, breite Tabelle, `animate-in` pro Zeile.
- Jede Status-/Bezahl-Änderung: **kompletter** Refetch.

### 3.5 Chat (`/admin/chat`)

- **N+1-Request-Sturm** (siehe F-2) – bei Produktionsdaten der kritischste Stabilitäts-Engpass neben Analytics.

### 3.6 Chat Detail (`/admin/chat/[customerId]`)

- `createClient()` im Komponenten-Body → Client-Instanz pro Render.
- `setInterval` 30s für `admin_online_status` + Realtime-Channel + `scrollIntoView` bei jeder `messages`-Änderung → akzeptabel für kleine Chats, aber kombiniert mit obigem Muster überdenkenswert.

---

## 4. Architekturprobleme

| Thema | Beschreibung |
|--------|--------------|
| **Kein zentrales Daten-Caching** | Kein React Query / SWR / TanStack Query: identische Daten werden pro Navigation neu gefetched; keine Dedupe/Stale-while-revalidate. |
| **Business-Analytics im Client** | Aggregationen, die besser in **SQL**, **RPC**, **Materialized Views** oder einem **Edge/API-Endpoint** liegen. |
| **Monolithische Admin-Seiten** | Availability + Analytics als grosse `'use client'`-Pages ohne Zerlegung → schwer zu optimieren und zu testen. |
| **Global Auth für alle Routes** | `AuthProvider` für gesamte App inkl. Marketing-Seiten; erhöht Client-Hydration und Session-Checks überall. |
| **Fehlende Pagination als Standard** | Tabellen-Pattern ohne Cursor/Limit skaliert nicht. |
| **Fehlende Observability** | Kaum strukturiertes Performance-Logging, keine Web-Vitals-Übergabe, keine serverseitigen Timings für Supabase-Calls im Dashboard. |

---

## 5. Quick Wins

1. **Chat-Liste:** Eine aggregierte Query oder Supabase **RPC** für „letzte Nachricht + unread count pro Kunde“ statt 2×N Requests (`app/admin/chat/page.tsx`).
2. **Analytics:** Mindestens **Datumsfilter** auf z. B. letzte 12–24 Monate in der Supabase-Query; idealerweise nur Spalten holen, die gebraucht werden (`select` auf Felder statt `*` wo möglich).
3. **Singleton Supabase-Browserclient:** `useMemo`/`useRef` in `AuthProvider` + in Chat-Detail eine stabile Instanz.
4. **Recharts lazy:** `dynamic(() => import(...), { ssr: false, loading: ... })` für Chart-Wrapper in `analytics/page.tsx`.
5. **Kunden-Stats:** `useMemo` für `count` pro Status aus `customers` (reduziert Arbeit pro Tastendruck).
6. **Middleware-Matcher:** Nur geschützte Pfade matchen, nicht „fast alles“.
7. **AnimatedNumber:** Auf Analytics KPIs kürzere Dauer oder deaktivieren bis Daten da sind, um konkurrierende RAFs zu reduzieren (optional).

---

## 6. High Impact Refactors

1. **Dashboard-API-Schicht:** Next.js **Route Handlers** oder **Server Actions** mit Service-Role/RLS-sicheren Queries, die **aggregierte** JSON-Payloads für Analytics liefern.
2. **Pagination:** Buchungen + Kunden mit `range()` / Cursor; Server-seitige Filter für Suche.
3. **Admin-Layout/Auth:** Optional **`/admin`-eigenes Layout** mit lokalem Provider oder server-first Session für erste Paint Shell.
4. **Availability-Page splitten:** Kalender, Liste, Dialoge in separate Client-Komponenten; Datenfetch in Hook mit klarer Cache-Strategie.
5. **Indexed DB columns:** `bookings(booking_date)`, `bookings(status)`, `bookings(customer_id)`, `chat_messages(sender_id, receiver_id, created_at)` – in Supabase explizit prüfen/ergänzen (Hypothese: ohne Indexe werden Counts/Listen langsam).
6. **Error Boundaries + `error.tsx`** für `/admin`-Segment.

---

## 7. Priorisierte Roadmap

| ID | Maßnahme | Nutzen | Aufwand | Risiko | Prio |
|----|----------|--------|---------|--------|------|
| P0-1 | Chat-Liste: Batch-/RPC-Query statt 2×N | Sehr hoch | Mittel | Mittel (SQL/RLS) | **P0** |
| P0-2 | Analytics: Zeitraum + schlankes `select`; keine Full-Scan-Client-Loops | Sehr hoch | Mittel | Niedrig | **P0** |
| P0-3 | Supabase-Singleton im Browser für Provider + langlebige Pages | Mittel–Hoch | Gering | Gering | **P0** |
| P1-1 | Buchungen: Pagination + partielles Update nach Mutation | Hoch | Mittel | Gering | **P1** |
| P1-2 | Recharts `dynamic` import | Mittel | Gering | Gering | **P1** |
| P1-3 | Middleware-Matcher verschärfen | Mittel | Gering | Mittel | **P1** |
| P2-1 | Server-Aggregation Analytics (RPC/View) | Sehr hoch | Hoch | Mittel | **P2** |
| P2-2 | Kunden: serverseitige Suche + Pagination | Mittel–Hoch | Mittel | Gering | **P2** |
| P2-3 | Availability: Query nach Datumsfenster + Komponenten-Split | Mittel | Hoch | Mittel | **P2** |
| P3-1 | TanStack Query o. Ä. für Admin-Daten | Hoch langfristig | Hoch | Mittel | **P3** |
| P3-2 | Chart-Library evaluieren (leichter als Recharts) | Mittel | Hoch | Mittel | **P3** |

---

## 8. Konkrete Umsetzungsempfehlungen

- **`app/admin/analytics/page.tsx`:** Ersetze `select('*, services(...)')` ohne Limit durch z. B. `.gte('booking_date', from)`; verschiebe Monats-/Wochenaggregation in **eine** SQL-Query oder mehrere kleine **group by**-Queries. Recharts in Subkomponente mit `next/dynamic({ ssr: false })`.
- **`app/admin/chat/page.tsx`:** Implementiere **eine** Postgres-Funktion `get_chat_threads_for_admin(admin_id)` die `distinct on` / Window verwendet, oder lade nur Kunden mit letzter Aktivität in den letzten X Tagen.
- **`app/admin/bookings/page.tsx`:** `.range(from, to)` + UI-Pagination; nach Update nur die betroffene Zeile im State patchen oder invalidiere gezielt.
- **`app/admin/customers/page.tsx`:** `.ilike` auf Server mit `limit`; Stats aus SQL `count(*) filter` oder memoized reduce **einmal** pro Daten-Array.
- **`contexts/AuthContext.tsx`:** `const supabase = useMemo(() => createClient(), [])`.
- **`app/admin/chat/[customerId]/page.tsx`:** Supabase-Client aus `useMemo`; `useEffect`-Dependencies prüfen (`supabase` stabil).
- **`middleware.ts`:** `matcher` auf `['/admin/:path*', '/dashboard/:path*']` o. Ä. evaluieren (mit Tests für statische Assets).
- **`lib/hooks/useSupabaseRealtime.ts`:** `onData` per `useRef` halten oder Dependencies korrekt setzen.

---

## 9. Performance-Hypothesen zur Validierung

| Hypothese | Wie validieren |
|-----------|----------------|
| Supabase **RLS** verursacht zusätzliche Subqueries pro Row | Supabase Dashboard → Query Performance; `explain` über SQL-Editor für typische Admin-Selects. |
| Fehlende **Indizes** auf `bookings.booking_date`, `chat_messages (sender_id, receiver_id)` | `EXPLAIN ANALYZE` in Postgres; Latenz der Count-Queries in Admin-Übersicht messen. |
| **Network-Latenz CH ↔ Supabase-Region** dominiert wahrgenommene Ladezeit | Chrome DevTools → Timing; optional Supabase Region wechseln / compare TTFB. |
| **7× AnimatedNumber** verlängert spürbare „fertig“-Phase | React Profiler + Performance-Tab: Main-Thread während 0–2s nach Datenload. |
| Mapbox-CSS in Root-Layout kostet unnötig | Lighthouse „unused CSS“ auf Seiten ohne Karte. |

**Messvorschläge:** Next.js `reportWebVitals` (öffentlich + ggf. nur Admin-Flag), Chrome Performance-Profil für `/admin/analytics` mit produktionsähnlicher Datenmenge, Supabase „API logs“ für Request-Anzahl beim Öffnen von `/admin/chat`.

---

## 10. Fazit

**Zuerst:** (1) **Admin Chat-Liste** entkoppeln von O(N) Requests, (2) **Analytics** von „alle Buchungen im Browser“ befreien, (3) **Singleton Supabase-Client** und kleinere Bundle-Tricks für Charts.

**Grösster Unterschied** für Premium-Gefühl: Datenfluss so gestalten, dass Admin-Seiten **kleine, bounded Payloads** erhalten und der Main-Thread nicht mit **O(n)-Aggregation** und **schweren Charts** gleichzeitig belastet wird.

**High-End-Niveau** erfordert zusätzlich: **messbare** Web Vitals, **Pagination/Indices** als Standard, optional **dedizierte Admin-Daten-API** und **Observability**, damit Regressionen sichtbar werden.

---

*Ende des Reports. Keine Codeänderungen im Rahmen dieses Audits durchgeführt.*
