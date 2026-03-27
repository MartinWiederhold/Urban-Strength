'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  slotDurationMinutes?: number
}

function normalizeHm(t: string): string { return String(t).slice(0, 5) }
function bookingKey(dateStr: string, startTime: string): string { return `${dateStr}-${normalizeHm(startTime)}` }
function timeStrToMinutes(t: string): number { const [h, m] = normalizeHm(t).split(':').map(Number); return (h || 0) * 60 + (m || 0) }
function minutesToPgTime(total: number): string { return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00` }

function expandWindowToSlots(windowRow: Availability, dateStr: string, durationMin: number, bookedKeys: Set<string>): Availability[] {
  const startM = timeStrToMinutes(windowRow.start_time), endM = timeStrToMinutes(windowRow.end_time), out: Availability[] = []
  if (durationMin <= 0 || endM <= startM) return out
  for (let t = startM; t + durationMin <= endM; t += durationMin) {
    const st = minutesToPgTime(t), et = minutesToPgTime(t + durationMin)
    if (bookedKeys.has(bookingKey(dateStr, st))) continue
    out.push({ ...windowRow, date: dateStr, start_time: st, end_time: et })
  }
  return out
}

function collectRawWindows(date: Date, specific: Availability[], recurring: Availability[]): Availability[] {
  const dateStr = format(date, 'yyyy-MM-dd'), dow = getDay(date), raw: Availability[] = []
  for (const s of specific) { if (s.date === dateStr) raw.push(s) }
  for (const s of recurring) { if (s.day_of_week === dow && dateStr >= s.date && !(s.recurring_end_date && dateStr > s.recurring_end_date)) raw.push(s) }
  return raw.sort((a, b) => a.start_time.localeCompare(b.start_time))
}

function getSlotsForDate(date: Date, specific: Availability[], recurring: Availability[], bookedKeys: Set<string>, durationMin: number): Availability[] {
  const dateStr = format(date, 'yyyy-MM-dd'), raw = collectRawWindows(date, specific, recurring), byStart = new Map<string, Availability>()
  for (const w of raw) for (const slot of expandWindowToSlots(w, dateStr, durationMin, bookedKeys)) { const k = normalizeHm(slot.start_time); if (!byStart.has(k)) byStart.set(k, slot) }
  return Array.from(byStart.values()).sort((a, b) => a.start_time.localeCompare(b.start_time))
}

/* ── Scroll Time Picker ──────────────────────────────────────────────── */
const ITEM_H = 52 // px per item
const VISIBLE = 5 // items visible

function ScrollTimePicker({ slots, selectedSlot, onSelect }: {
  slots: Availability[]
  selectedSlot: Availability | null
  onSelect: (s: Availability) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [centerIdx, setCenterIdx] = useState(0)

  // Initial scroll to selected or first
  useEffect(() => {
    const idx = slots.findIndex(s => selectedSlot?.start_time === s.start_time && selectedSlot?.date === s.date)
    const target = idx >= 0 ? idx : 0
    setCenterIdx(target)
    if (listRef.current) {
      listRef.current.scrollTop = target * ITEM_H
    }
  }, [slots, selectedSlot])

  const handleScroll = useCallback(() => {
    if (!listRef.current) return
    const idx = Math.round(listRef.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, slots.length - 1))
    setCenterIdx(clamped)
  }, [slots.length])

  const handleScrollEnd = useCallback(() => {
    if (!listRef.current || slots.length === 0) return
    const idx = Math.round(listRef.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, slots.length - 1))
    onSelect(slots[clamped])
  }, [slots, onSelect])

  // Listen for scroll end via timeout
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onScrollCombined = useCallback(() => {
    handleScroll()
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(handleScrollEnd, 120)
  }, [handleScroll, handleScrollEnd])

  if (slots.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">Keine freien Zeiten an diesem Tag.</p>

  const padCount = Math.floor(VISIBLE / 2)

  return (
    <div className="relative mx-auto" style={{ maxWidth: 280 }}>
      {/* Highlight bar in center */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-10 rounded-xl border border-white/15 bg-white/[0.06]"
        style={{ top: padCount * ITEM_H, height: ITEM_H }}
      />
      {/* Fade masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-card to-transparent" />

      <div
        ref={listRef}
        onScroll={onScrollCombined}
        className="overflow-y-auto scrollbar-hide"
        style={{
          height: VISIBLE * ITEM_H,
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Top padding */}
        {Array.from({ length: padCount }).map((_, i) => (
          <div key={`pad-t-${i}`} style={{ height: ITEM_H }} />
        ))}

        {slots.map((slot, i) => {
          const dist = Math.abs(i - centerIdx)
          const isCenter = dist === 0
          return (
            <div
              key={`${slot.date}-${slot.start_time}`}
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'start',
                opacity: isCenter ? 1 : dist === 1 ? 0.4 : 0.15,
                transform: `scale(${isCenter ? 1 : dist === 1 ? 0.92 : 0.85})`,
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              className="flex items-center justify-center cursor-pointer select-none"
              onClick={() => {
                if (listRef.current) {
                  listRef.current.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })
                }
                onSelect(slot)
              }}
            >
              <span className={`text-center font-semibold tracking-tight ${isCenter ? 'text-[1.5rem] text-white' : 'text-lg text-white/50'}`}>
                {slot.start_time.slice(0, 5)} Uhr
              </span>
            </div>
          )
        })}

        {/* Bottom padding */}
        {Array.from({ length: padCount }).map((_, i) => (
          <div key={`pad-b-${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  )
}

/* ── Main Calendar ───────────────────────────────────────────────────── */
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
  const timePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const availRes = await supabase.from('availability').select('*').eq('is_available', true)
        if (availRes.error) { setFetchError(`Fehler beim Laden: ${availRes.error.message}`); return }
        const all = (availRes.data ?? []) as Availability[]
        setSpecific(all.filter(s => !s.recurring_weekly))
        setRecurring(all.filter(s => s.recurring_weekly))

        const rangeStart = format(subMonths(startOfDay(new Date()), 1), 'yyyy-MM-dd')
        const rangeEnd = format(addMonths(startOfDay(new Date()), 6), 'yyyy-MM-dd')
        const keys = new Set<string>()
        const rpcRes = await supabase.rpc('get_occupied_booking_slots', { p_from: rangeStart, p_to: rangeEnd })
        if (!rpcRes.error && rpcRes.data) {
          ;(rpcRes.data as { booking_date: string; start_time: string }[]).forEach(b => keys.add(bookingKey(b.booking_date, b.start_time)))
        } else {
          const bookingsRes = await supabase.from('bookings').select('booking_date,start_time').in('status', ['booked', 'confirmed', 'completed']).gte('booking_date', rangeStart).lte('booking_date', rangeEnd)
          if (!bookingsRes.error) (bookingsRes.data ?? []).forEach((b: { booking_date: string; start_time: string }) => keys.add(bookingKey(b.booking_date, b.start_time)))
        }
        setBookedKeys(keys)
      } catch {
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

  const hasSlots = (d: Date) => !isBefore(d, today) && getSlotsForDate(d, specific, recurring, bookedKeys, slotDurationMinutes).length > 0
  const daySlots = selectedDay ? getSlotsForDate(selectedDay, specific, recurring, bookedKeys, slotDurationMinutes) : []
  const noDataInDB = !isLoading && !fetchError && specific.length === 0 && recurring.length === 0
  const anyAvailableInMonth = !isLoading && !fetchError && days.some(d => isSameMonth(d, currentMonth) && hasSlots(d))

  const handleDaySelect = (day: Date) => {
    setSelectedDay(day)
    // Auto-scroll to time picker
    setTimeout(() => {
      timePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleSlotSelect = (slot: Availability) => {
    onSelectSlot(slot)
  }

  return (
    <div className="space-y-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-secondary transition-colors">
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

      {fetchError && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{fetchError}</div>
      )}

      {/* Calendar grid */}
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
                onClick={() => { if (avail && inMonth && !past) handleDaySelect(day) }}
                className={[
                  'relative flex flex-col items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  !inMonth ? 'opacity-0 pointer-events-none' : '',
                  inMonth && (past || !avail) ? 'text-muted-foreground/30 cursor-default' : '',
                  sel ? 'bg-amber-400 text-black' : '',
                  !sel && avail && !past ? 'hover:bg-white/10 cursor-pointer' : '',
                  !sel && tod ? 'ring-1 ring-white/20 ring-inset' : '',
                ].join(' ')}
              >
                <span className={!sel && tod ? 'font-bold' : ''}>{format(day, 'd')}</span>
                {avail && !past && inMonth && !sel && (
                  <span className="w-1 h-1 rounded-full mt-0.5 bg-emerald-400" />
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
          <span className="w-3 h-3 rounded-md bg-amber-400 inline-block" />
          Ausgewählt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md ring-1 ring-white/20 inline-block" />
          Heute
        </span>
      </div>

      {/* Scroll Time Picker */}
      {selectedDay && (
        <div ref={timePickerRef} className="animate-slide-up border-t border-border pt-5">
          <p className="text-sm font-semibold mb-4 text-center text-muted-foreground">
            {format(selectedDay, 'EEEE, dd. MMMM', { locale: de })}
          </p>
          <ScrollTimePicker
            slots={daySlots}
            selectedSlot={selectedSlot}
            onSelect={handleSlotSelect}
          />
        </div>
      )}
    </div>
  )
}
