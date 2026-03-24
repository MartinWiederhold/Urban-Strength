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
}

function getSlotsForDate(
  date: Date,
  specific: Availability[],
  recurring: Availability[],
  bookedKeys: Set<string>,
): Availability[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dow = getDay(date)
  const result: Availability[] = []

  for (const s of specific) {
    if (s.date === dateStr && !bookedKeys.has(`${dateStr}-${s.start_time}`)) {
      result.push(s)
    }
  }
  for (const s of recurring) {
    if (
      s.day_of_week === dow &&
      dateStr >= s.date &&
      !(s.recurring_end_date && dateStr > s.recurring_end_date) &&
      !bookedKeys.has(`${dateStr}-${s.start_time}`)
    ) {
      result.push({ ...s, date: dateStr })
    }
  }
  return result.sort((a, b) => a.start_time.localeCompare(b.start_time))
}

export default function AvailabilityCalendar({ onSelectSlot, selectedSlot }: AvailabilityCalendarProps) {
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

        // Fetch availability independently so a bookings error can't mask it
        const availRes = await supabase
          .from('availability')
          .select('*')
          .eq('is_available', true)

        if (availRes.error) {
          console.error('Availability fetch error:', availRes.error)
          setFetchError(`Fehler beim Laden: ${availRes.error.message}`)
          return
        }

        const all = (availRes.data ?? []) as Availability[]
        setSpecific(all.filter(s => !s.recurring_weekly))
        setRecurring(all.filter(s => s.recurring_weekly))

        // Bookings query may return empty for anonymous users (RLS) — that's OK
        const bookingsRes = await supabase
          .from('bookings')
          .select('booking_date,start_time')
          .in('status', ['confirmed', 'completed'])

        const keys = new Set<string>()
        ;(bookingsRes.data ?? []).forEach((b: any) => keys.add(`${b.booking_date}-${b.start_time}`))
        setBookedKeys(keys)
      } catch (err) {
        console.error('Calendar load error:', err)
        setFetchError('Termine konnten nicht geladen werden. Bitte Seite neu laden.')
      } finally {
        setIsLoading(false)
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
    !isBefore(d, today) && getSlotsForDate(d, specific, recurring, bookedKeys).length > 0

  const daySlots = selectedDay
    ? getSlotsForDate(selectedDay, specific, recurring, bookedKeys)
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

      {/* Calendar grid */}
      {isLoading ? (
        <div className="h-52 rounded-xl bg-secondary animate-pulse" />
      ) : fetchError ? null : (
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const inMonth = isSameMonth(day, currentMonth)
            const avail = hasSlots(day)
            const past = isBefore(day, today)
            const sel = !!(selectedDay && isSameDay(day, selectedDay))
            const tod = isToday(day)

            return (
              <button
                key={day.toISOString()}
                disabled={!inMonth || past || !avail}
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
          Derzeit keine Termine verfügbar. Bitte kontaktiere uns direkt.
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
              {daySlots.map((slot, i) => {
                const active =
                  selectedSlot?.date === slot.date &&
                  selectedSlot?.start_time === slot.start_time
                return (
                  <button
                    key={i}
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
