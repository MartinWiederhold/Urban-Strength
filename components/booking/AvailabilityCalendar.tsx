'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Availability } from '@/lib/types'
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek,
  isSameDay, isSameMonth, isToday, isBefore, startOfDay, getDay,
} from 'date-fns'
import { de } from 'date-fns/locale'

interface AvailabilityCalendarProps {
  onSelectSlot: (slot: Availability) => void
  selectedSlot: Availability | null
  /** Länge einer Buchung in Minuten — bestimmt Raster (z. B. 60 → 07:00, 08:00, … bis Fensterende). */
  slotDurationMinutes?: number
}

function normalizeHm(t: string): string {
  return String(t).slice(0, 5)
}

function bookingKey(dateStr: string, startTime: string): string {
  return `${dateStr}-${normalizeHm(startTime)}`
}

function timeStrToMinutes(t: string): number {
  const [h, m] = normalizeHm(t).split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function minutesToPgTime(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

/** Zerlegt ein Verfügbarkeitsfenster (start–end) in buchbare Slots fester Dauer. */
function expandWindowToSlots(
  windowRow: Availability,
  dateStr: string,
  durationMin: number,
  bookedKeys: Set<string>,
): Availability[] {
  const startM = timeStrToMinutes(windowRow.start_time)
  const endM = timeStrToMinutes(windowRow.end_time)
  const out: Availability[] = []
  if (durationMin <= 0 || endM <= startM) return out
  for (let t = startM; t + durationMin <= endM; t += durationMin) {
    const st = minutesToPgTime(t)
    const et = minutesToPgTime(t + durationMin)
    if (bookedKeys.has(bookingKey(dateStr, st))) continue
    out.push({
      ...windowRow,
      date: dateStr,
      start_time: st,
      end_time: et,
    })
  }
  return out
}

function collectRawWindows(
  date: Date,
  specific: Availability[],
  recurring: Availability[],
): Availability[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dow = getDay(date)
  const raw: Availability[] = []
  for (const s of specific) {
    if (s.date === dateStr) raw.push(s)
  }
  for (const s of recurring) {
    if (
      s.day_of_week === dow &&
      dateStr >= s.date &&
      !(s.recurring_end_date && dateStr > s.recurring_end_date)
    ) {
      raw.push(s)
    }
  }
  return raw.sort((a, b) => a.start_time.localeCompare(b.start_time))
}

function getSlotsForDate(
  date: Date,
  specific: Availability[],
  recurring: Availability[],
  bookedKeys: Set<string>,
  durationMin: number,
): Availability[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  const raw = collectRawWindows(date, specific, recurring)
  const byStart = new Map<string, Availability>()
  for (const w of raw) {
    for (const slot of expandWindowToSlots(w, dateStr, durationMin, bookedKeys)) {
      const k = normalizeHm(slot.start_time)
      if (!byStart.has(k)) byStart.set(k, slot)
    }
  }
  return Array.from(byStart.values()).sort((a, b) => a.start_time.localeCompare(b.start_time))
}

export default function AvailabilityCalendar({
  onSelectSlot,
  selectedSlot,
  slotDurationMinutes = 60,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [specific, setSpecific] = useState<Availability[]>([])
  const [recurring, setRecurring] = useState<Availability[]>([])
  const [bookedKeys, setBookedKeys] = useState<Set<string>>(new Set())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()

        console.log('[Calendar] Starting availability fetch...')

        // Fetch availability independently so a bookings error can't mask it
        const availRes = await supabase
          .from('availability')
          .select('*')
          .eq('is_available', true)

        console.log('[Calendar] availability response:', {
          data: availRes.data,
          error: availRes.error,
          count: availRes.data?.length ?? 0,
        })

        if (availRes.error) {
          console.error('[Calendar] Availability fetch error:', availRes.error)
          setFetchError(`Fehler beim Laden: ${availRes.error.message}`)
          return
        }

        const all = (availRes.data ?? []) as Availability[]
        console.log('[Calendar] rows total:', all.length, '| specific:', all.filter(s => !s.recurring_weekly).length, '| recurring:', all.filter(s => s.recurring_weekly).length)
        setSpecific(all.filter(s => !s.recurring_weekly))
        setRecurring(all.filter(s => s.recurring_weekly))

        const rangeStart = format(subMonths(startOfDay(new Date()), 1), 'yyyy-MM-dd')
        const rangeEnd = format(addMonths(startOfDay(new Date()), 6), 'yyyy-MM-dd')

        const keys = new Set<string>()
        const rpcRes = await supabase.rpc('get_occupied_booking_slots', {
          p_from: rangeStart,
          p_to: rangeEnd,
        })

        if (!rpcRes.error && rpcRes.data) {
          ;(rpcRes.data as { booking_date: string; start_time: string }[]).forEach(b =>
            keys.add(bookingKey(b.booking_date, b.start_time)),
          )
        } else {
          const bookingsRes = await supabase
            .from('bookings')
            .select('booking_date,start_time')
            .in('status', ['booked', 'confirmed', 'completed'])
            .gte('booking_date', rangeStart)
            .lte('booking_date', rangeEnd)
          if (!bookingsRes.error) {
            ;(bookingsRes.data ?? []).forEach((b: { booking_date: string; start_time: string }) =>
              keys.add(bookingKey(b.booking_date, b.start_time)),
            )
          }
        }

        console.log('[Calendar] occupied slots:', { count: keys.size, rpcError: rpcRes.error?.message })
        setBookedKeys(keys)
      } catch (err) {
        console.error('[Calendar] load error:', err)
        setFetchError('Termine konnten nicht geladen werden. Bitte Seite neu laden.')
      } finally {
        setIsLoading(false)
        console.log('[Calendar] loading complete')
      }
    }
    load()
  }, [])

  const today = startOfDay(new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  })

  const hasSlots = (d: Date) =>
    !isBefore(d, today) &&
    getSlotsForDate(d, specific, recurring, bookedKeys, slotDurationMinutes).length > 0

  const daySlots = selectedDay
    ? getSlotsForDate(selectedDay, specific, recurring, bookedKeys, slotDurationMinutes)
    : []

  const noDataInDB = !isLoading && !fetchError && specific.length === 0 && recurring.length === 0
  const anyAvailableInMonth = !isLoading && !fetchError && days.some(d => isSameMonth(d, currentMonth) && hasSlots(d))

  return (
    <div className="space-y-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
          <p key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</p>
        ))}
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
          {fetchError}
        </div>
      )}

      {/* Calendar grid — always rendered so day numbers are visible immediately */}
      {!fetchError && (
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const inMonth = isSameMonth(day, currentMonth)
            const past = isBefore(day, today)
            const avail = !isLoading && hasSlots(day)
            const sel = !!(selectedDay && isSameDay(day, selectedDay))
            const tod = isToday(day)

            return (
              <button
                key={day.toISOString()}
                disabled={!inMonth || past || !avail || isLoading}
                onClick={() => { if (avail && inMonth && !past) setSelectedDay(day) }}
                className={[
                  'relative flex flex-col items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  !inMonth ? 'opacity-0 pointer-events-none' : '',
                  inMonth && (past || !avail) ? 'text-muted-foreground/30 cursor-default' : '',
                  sel ? 'bg-emerald-400 text-black' : '',
                  !sel && avail && !past ? 'hover:bg-emerald-400/15 cursor-pointer' : '',
                ].join(' ')}
              >
                <span className={tod && !sel ? 'text-primary font-bold' : ''}>{format(day, 'd')}</span>
                {avail && !past && inMonth && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${sel ? 'bg-black/40' : 'bg-emerald-400'}`} />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Empty states */}
      {noDataInDB && (
        <p className="text-sm text-center text-muted-foreground py-2">
          Derzeit keine Termine verfügbar. Bitte kontaktiere mich direkt.
        </p>
      )}
      {!noDataInDB && !anyAvailableInMonth && !isLoading && (
        <p className="text-sm text-center text-muted-foreground py-2">
          Kein freier Termin in diesem Monat — bitte zum nächsten navigieren.
        </p>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Verfügbar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-400 inline-block" />
          Ausgewählt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-primary/30 inline-block" />
          Heute
        </span>
      </div>

      {/* Time slots */}
      {selectedDay && (
        <div className="animate-slide-up border-t border-border pt-5"
        >
          <p className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Verfügbare Zeiten — {format(selectedDay, 'EEEE, dd. MMMM', { locale: de })}
          </p>
          {daySlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine freien Zeiten an diesem Tag.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {daySlots.map(slot => {
                const active =
                  selectedSlot?.date === slot.date &&
                  selectedSlot?.start_time === slot.start_time
                return (
                  <button
                    key={`${slot.date}-${slot.start_time}`}
                    onClick={() => onSelectSlot(slot)}
                    className={[
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      active
                        ? 'bg-emerald-400/20 border-emerald-400 text-emerald-400'
                        : 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/15 hover:border-emerald-400/50',
                    ].join(' ')}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {slot.start_time.slice(0, 5)} Uhr
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
