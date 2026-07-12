'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { servicesData } from '@/lib/translations'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const WHATSAPP_NUMBER = '41774857535'

// Time options from 06:00 to 22:00 in 30-min steps.
const TIME_OPTIONS: string[] = (() => {
  const out: string[] = []
  for (let h = 6; h <= 22; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) out.push(`${String(h).padStart(2, '0')}:30`)
  }
  return out
})()

const pad = (n: number) => String(n).padStart(2, '0')
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export default function BookingRequest({ serviceId }: { serviceId: string }) {
  const { lang } = useLanguage()
  const t = (de: string, en: string) => (lang === 'en' ? en : de)

  const service = servicesData[lang].find((s) => s.id === serviceId) ?? servicesData[lang][0]
  const isAbo = service.id === 'quartals-abo'

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  // date-key -> selected time
  const [sessions, setSessions] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [experience, setExperience] = useState('')
  const [alreadyTraining, setAlreadyTraining] = useState('')

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-CH', {
    month: 'long',
    year: 'numeric',
  })

  const weekdays = lang === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  // Build the calendar grid (Monday-first).
  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const startOffset = (first.getDay() + 6) % 7 // Mon=0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const arr: (Date | null)[] = []
    for (let i = 0; i < startOffset; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(viewYear, viewMonth, d))
    return arr
  }, [viewYear, viewMonth])

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth())

  const prevMonth = () => {
    if (!canGoPrev) return
    setViewMonth((m) => (m === 0 ? 11 : m - 1))
    if (viewMonth === 0) setViewYear((y) => y - 1)
  }
  const nextMonth = () => {
    setViewMonth((m) => (m === 11 ? 0 : m + 1))
    if (viewMonth === 11) setViewYear((y) => y + 1)
  }

  const toggleDay = (d: Date) => {
    const key = toKey(d)
    setSessions((prev) => {
      if (!isAbo) {
        // Single-session mode: selecting a different day replaces the previous one.
        if (prev[key]) return {}
        return { [key]: '07:00' }
      }
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = '07:00'
      return next
    })
  }

  const setTime = (key: string, time: string) =>
    setSessions((prev) => ({ ...prev, [key]: time }))

  const removeSession = (key: string) =>
    setSessions((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })

  const sortedKeys = Object.keys(sessions).sort()

  const formatLong = (key: string) => {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-CH', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const sendWhatsApp = () => {
    const lines = sortedKeys.map((k) => `• ${formatLong(k)} ${t('um', 'at')} ${sessions[k]} ${t('Uhr', '')}`.trim())
    const priceStr = `${service.price} ${service.priceNote}`.trim()
    const intro = t(
      `Hallo Martin, ich möchte gerne "${service.title}" (${priceStr}) buchen.`,
      `Hi Martin, I'd like to book "${service.title}" (${priceStr}).`,
    )
    const label = isAbo
      ? t('Meine Wunschtermine:', 'My preferred sessions:')
      : t('Mein Wunschtermin:', 'My preferred date:')
    const parts = [intro, '', label, ...lines]
    const details: string[] = []
    if (name.trim()) details.push(`${t('Name', 'Name')}: ${name.trim()}`)
    if (phone.trim()) details.push(`${t('Telefon', 'Phone')}: ${phone.trim()}`)
    if (age.trim()) details.push(`${t('Alter', 'Age')}: ${age.trim()}`)
    if (experience) details.push(`${t('Erfahrung', 'Experience')}: ${experience}`)
    if (alreadyTraining) details.push(`${t('Trainierst du bereits', 'Already training')}: ${alreadyTraining}`)
    if (details.length) parts.push('', ...details)
    const msg = parts.join('\n')
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const isPast = (d: Date) => d < today

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Calendar + selection */}
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-1 text-xl font-bold">
            {isAbo
              ? t('Wunschtermine wählen', 'Choose your sessions')
              : t('Wunschtermin wählen', 'Choose your session')}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {isAbo
              ? t(
                  'Tippe die gewünschten Tage an und wähle für jeden Tag eine Uhrzeit (06:00–22:00).',
                  'Tap the days you want and pick a time for each (06:00–22:00).',
                )
              : t(
                  'Tippe einen Tag im Kalender an und wähle eine Uhrzeit (06:00–22:00).',
                  'Tap a day in the calendar and pick a time (06:00–22:00).',
                )}
          </p>

          {/* Month header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
              aria-label={t('Vorheriger Monat', 'Previous month')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold capitalize">{monthLabel}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary"
              aria-label={t('Nächster Monat', 'Next month')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="mb-1 grid grid-cols-7 gap-1 sm:gap-1.5">
            {weekdays.map((d) => (
              <div key={d} className="py-1 text-center text-[11px] text-muted-foreground sm:text-xs">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <div key={`b-${i}`} />
              const key = toKey(d)
              const selected = !!sessions[key]
              const past = isPast(d)
              return (
                <button
                  key={key}
                  type="button"
                  disabled={past}
                  onClick={() => toggleDay(d)}
                  className={[
                    'flex aspect-square items-center justify-center rounded-lg text-[15px] font-medium transition-all active:scale-95 sm:aspect-auto sm:h-10 sm:text-sm',
                    past
                      ? 'cursor-not-allowed text-muted-foreground/30'
                      : selected
                        ? 'bg-amber-400 text-black'
                        : 'text-foreground hover:bg-secondary',
                  ].join(' ')}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected sessions */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-bold">
            {isAbo ? t('Gewählte Termine', 'Selected sessions') : t('Dein Termin', 'Your session')}
            {isAbo && sortedKeys.length > 0 && <span className="ml-2 text-amber-400">({sortedKeys.length})</span>}
          </h3>

          {sortedKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isAbo
                ? t('Noch keine Termine gewählt. Tippe oben auf einen Tag im Kalender.', 'No sessions yet. Tap a day in the calendar above.')
                : t('Noch kein Termin gewählt. Tippe oben auf einen Tag im Kalender.', 'No session yet. Tap a day in the calendar above.')}
            </p>
          ) : (
            <ul className="space-y-2">
              {sortedKeys.map((key) => (
                <li key={key} className="flex flex-col gap-2 rounded-xl bg-secondary p-3 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm font-medium capitalize sm:flex-1">{formatLong(key)}</span>
                  <div className="flex items-center gap-2">
                    <Select value={sessions[key]} onValueChange={(v) => setTime(key, v)}>
                      <SelectTrigger className="h-11 w-full sm:h-10 sm:w-[128px] sm:shrink-0" aria-label={t('Uhrzeit', 'Time')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {TIME_OPTIONS.map((tm) => (
                          <SelectItem key={tm} value={tm}>{tm}{t(' Uhr', '')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => removeSession(key)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:h-9 sm:w-9"
                      aria-label={t('Entfernen', 'Remove')}
                    >
                      <X className="h-5 w-5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Contact + details (optional) */}
          <p className="mt-6 mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            {t('Deine Angaben (optional)', 'Your details (optional)')}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('Dein Name', 'Your name')}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber-400"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('Telefon', 'Phone')}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber-400"
            />
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              type="number"
              min={10}
              max={100}
              placeholder={t('Alter', 'Age')}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-amber-400"
            />
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger aria-label={t('Erfahrung', 'Experience')}>
                <SelectValue placeholder={t('Erfahrung wählen', 'Select experience')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={t('Anfänger', 'Beginner')}>{t('Anfänger', 'Beginner')}</SelectItem>
                <SelectItem value={t('Fortgeschritten', 'Intermediate')}>{t('Fortgeschritten', 'Intermediate')}</SelectItem>
                <SelectItem value={t('Profi', 'Advanced')}>{t('Profi', 'Advanced')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="sm:col-span-2">
              <Select value={alreadyTraining} onValueChange={setAlreadyTraining}>
                <SelectTrigger aria-label={t('Trainierst du bereits?', 'Already training?')}>
                  <SelectValue placeholder={t('Trainierst du bereits regelmässig?', 'Do you already train regularly?')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={t('Ja', 'Yes')}>{t('Ja', 'Yes')}</SelectItem>
                  <SelectItem value={t('Nein', 'No')}>{t('Nein', 'No')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar / summary + send */}
      <div className="space-y-4">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-2 font-bold">{service.title}</h3>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-400">{service.price}</span>
            <span className="text-sm text-muted-foreground">{service.priceNote}</span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{service.duration}</p>

          <div className="mb-4 rounded-lg bg-secondary p-3 text-sm">
            {sortedKeys.length > 0 ? (
              <span className="font-medium text-amber-400">
                {isAbo
                  ? `${sortedKeys.length} ${t('Termin(e) gewählt', 'session(s) selected')}`
                  : t('Termin gewählt', 'Session selected')}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {isAbo
                  ? t('Noch keine Termine gewählt', 'No sessions selected yet')
                  : t('Noch kein Termin gewählt', 'No session selected yet')}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={sendWhatsApp}
            disabled={sortedKeys.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('Anfrage per WhatsApp senden', 'Send request via WhatsApp')}
          </button>

          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {t(
              'WhatsApp öffnet sich mit deiner fertigen Nachricht – du musst nur noch auf Senden tippen.',
              'WhatsApp opens with your ready-made message – just tap send.',
            )}
          </p>
        </div>

        <Link
          href="/#angebote"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('Zurück zu den Angeboten', 'Back to offers')}
        </Link>
      </div>
    </div>
  )
}
