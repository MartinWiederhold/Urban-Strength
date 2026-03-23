'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, Trash2, RefreshCw, X, CalendarDays, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Availability } from '@/lib/types'
import {
  format, addDays, startOfWeek, isSameDay, getDay,
  startOfDay, isBefore, parseISO,
} from 'date-fns'
import { de } from 'date-fns/locale'

// ── Time grid constants ─────────────────────────────────────────────────────
const HOUR_START = 6
const HOUR_END   = 22
const HOUR_PX    = 56
const TOTAL_H    = (HOUR_END - HOUR_START) * HOUR_PX
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

const DOW_LABELS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

function snapHalf(h: number) { return Math.round(h * 2) / 2 }
function hourToTime(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
function timeToHour(t: string): number {
  const [hh, mm] = t.split(':').map(Number)
  return hh + mm / 60
}

interface DragState {
  dayIndex: number
  startY: number
  currentY: number
}

interface EditState {
  slot: Availability
  recurring: boolean
  endDate: string
}

export default function AvailabilityPage() {
  const [slots, setSlots]           = useState<Availability[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSaving, setIsSaving]     = useState(false)
  const [msg, setMsg]               = useState<{ text: string; ok: boolean } | null>(null)
  const [weekStart, setWeekStart]   = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [drag, setDrag]             = useState<DragState | null>(null)
  const [edit, setEdit]             = useState<EditState | null>(null)
  const colRefs = useRef<(HTMLDivElement | null)[]>([])

  // ── Data ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('availability').select('*').eq('is_available', true)
      .order('date', { ascending: true }).order('start_time', { ascending: true })
    setSlots((data as Availability[]) ?? [])
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getSlotsForDay = (day: Date): Availability[] => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dow = getDay(day)
    return slots.filter(s => {
      if (s.date === dateStr) return true
      if (s.recurring_weekly && s.day_of_week === dow) {
        // Don't show before creation date
        if (dateStr < s.date) return false
        // Don't show after end date
        if (s.recurring_end_date && dateStr > s.recurring_end_date) return false
        return true
      }
      return false
    }).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEdit = (e: React.MouseEvent, slot: Availability) => {
    e.stopPropagation()
    setEdit({
      slot,
      recurring: slot.recurring_weekly,
      endDate: slot.recurring_end_date ?? '',
    })
  }

  // ── Save edits ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!edit) return
    setIsSaving(true)
    const supabase = createClient()
    const dow = getDay(parseISO(edit.slot.date))

    // Try full update including recurring_end_date
    let { error } = await supabase.from('availability').update({
      recurring_weekly:   edit.recurring,
      day_of_week:        edit.recurring ? dow : null,
      recurring_end_date: edit.recurring && edit.endDate ? edit.endDate : null,
    }).eq('id', edit.slot.id)

    // Fallback: if recurring_end_date column doesn't exist yet, update without it
    if (error) {
      const fallback = await supabase.from('availability').update({
        recurring_weekly: edit.recurring,
        day_of_week:      edit.recurring ? dow : null,
      }).eq('id', edit.slot.id)
      error = fallback.error
    }

    if (error) {
      setMsg({ text: 'Fehler beim Speichern: ' + error.message, ok: false })
      setTimeout(() => setMsg(null), 5000)
      setIsSaving(false)
      return
    }

    setMsg({ text: 'Gespeichert!', ok: true })
    setTimeout(() => setMsg(null), 3000)
    setEdit(null)
    await load()
    setIsSaving(false)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (slot: Availability) => {
    const confirmMsg = slot.recurring_weekly
      ? 'Wöchentlich wiederkehrenden Slot löschen? Dieser Slot wird von allen zukünftigen Wochen entfernt.'
      : 'Slot löschen?'
    if (!confirm(confirmMsg)) return
    setEdit(null)
    setDeletingId(slot.id)
    const supabase = createClient()
    await supabase.from('availability').update({ is_available: false }).eq('id', slot.id)
    await load()
    setDeletingId(null)
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onColMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    if ((e.target as HTMLElement).closest('[data-slot]')) return
    const col = colRefs.current[dayIndex]
    if (!col) return
    const rect = col.getBoundingClientRect()
    const y = Math.max(0, e.clientY - rect.top)
    setDrag({ dayIndex, startY: y, currentY: y })
    e.preventDefault()
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!drag) return
    const col = colRefs.current[drag.dayIndex]
    if (!col) return
    const rect = col.getBoundingClientRect()
    const y = Math.max(0, Math.min(e.clientY - rect.top, TOTAL_H))
    setDrag(prev => prev ? { ...prev, currentY: y } : null)
  }, [drag])

  const onMouseUp = useCallback(async () => {
    if (!drag) return
    const { dayIndex, startY, currentY } = drag
    setDrag(null)

    const minY = Math.min(startY, currentY)
    const maxY = Math.max(startY, currentY)
    if (maxY - minY < 8) return

    let startH = HOUR_START + (minY / TOTAL_H) * (HOUR_END - HOUR_START)
    let endH   = HOUR_START + (maxY / TOTAL_H) * (HOUR_END - HOUR_START)
    startH = snapHalf(startH)
    endH   = snapHalf(endH)
    if (endH - startH < 1) endH = startH + 1
    if (endH > HOUR_END)   endH = HOUR_END

    const startTime = hourToTime(startH)
    const endTime   = hourToTime(endH)
    const day       = weekDays[dayIndex]
    const dateStr   = format(day, 'yyyy-MM-dd')

    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('availability').insert({
      date: dateStr, start_time: startTime, end_time: endTime,
      is_available: true, recurring_weekly: false, day_of_week: null,
    })
    setMsg(error
      ? { text: 'Fehler beim Erstellen.', ok: false }
      : { text: `Slot ${startTime}–${endTime} Uhr erstellt!`, ok: true }
    )
    setTimeout(() => setMsg(null), 3000)
    await load()
    setIsSaving(false)
  }, [drag, weekDays, load])

  useEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [drag, onMouseMove, onMouseUp])

  const getDragRect = (dayIndex: number) => {
    if (!drag || drag.dayIndex !== dayIndex) return null
    const top    = Math.min(drag.startY, drag.currentY)
    const height = Math.abs(drag.currentY - drag.startY)
    return height > 4 ? { top, height } : null
  }

  const today    = startOfDay(new Date())
  const recCount = slots.filter(s => s.recurring_weekly).length
  const specCount = slots.filter(s => !s.recurring_weekly).length

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verfügbarkeit</h1>
        <p className="text-muted-foreground mt-1">
          Klicken &amp; ziehen zum Erstellen · Auf Slot klicken zum Bearbeiten
        </p>
      </motion.div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors text-sm font-medium"
          >
            Heute
          </button>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-muted-foreground ml-1">
            {format(weekStart, 'dd. MMM', { locale: de })} – {format(addDays(weekStart, 6), 'dd. MMM yyyy', { locale: de })}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {msg && (
            <motion.span
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-medium ${msg.ok ? 'text-emerald-400' : 'text-destructive'}`}
            >
              {msg.text}
            </motion.span>
          )}
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>
            <span className="font-semibold text-foreground">{slots.length}</span> aktiv ·{' '}
            <RefreshCw className="w-2.5 h-2.5 inline" /> {recCount} wöchentlich ·{' '}
            {specCount} einmalig
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#29C46A] inline-block" />
          Einmalig
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#1aaa58] inline-block opacity-70" />
          <RefreshCw className="w-2.5 h-2.5" /> Wöchentlich
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary/20 border border-primary/40 border-dashed inline-block" />
          Ziehen zum Erstellen
        </span>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="h-96 rounded-xl shimmer" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          {/* Day headers */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
            <div className="border-r border-border bg-secondary/20" />
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date())
              const isPast  = isBefore(startOfDay(day), today) && !isToday
              return (
                <div key={i} className={[
                  'p-3 text-center border-r border-border last:border-r-0 transition-colors',
                  isToday ? 'bg-primary/10' : '',
                  isPast  ? 'opacity-40' : '',
                ].join(' ')}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    {format(day, 'EEE', { locale: de })}
                  </p>
                  <p className={`text-xl font-bold leading-tight mt-0.5 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {format(day, 'dd.MM.')}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Scrollable time grid */}
          <div className="overflow-y-auto max-h-[680px]">
            <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
              {/* Hour labels */}
              <div className="border-r border-border bg-secondary/10">
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="flex items-start justify-end pr-2 pt-1"
                    style={{ height: `${HOUR_PX}px` }}
                  >
                    <span className="text-[9px] text-muted-foreground/50 font-mono leading-none">
                      {String(h).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const daySlots = getSlotsForDay(day)
                const dragRect = getDragRect(dayIndex)
                const isToday  = isSameDay(day, new Date())
                const isPast   = isBefore(startOfDay(day), today) && !isToday

                return (
                  <div
                    key={dayIndex}
                    ref={el => { colRefs.current[dayIndex] = el }}
                    className={[
                      'relative border-r border-border last:border-r-0 select-none',
                      isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-crosshair',
                      isToday ? 'bg-primary/[0.02]' : '',
                    ].join(' ')}
                    style={{ height: `${TOTAL_H}px` }}
                    onMouseDown={!isPast ? e => onColMouseDown(e, dayIndex) : undefined}
                  >
                    {/* Hour lines */}
                    {HOURS.map(h => (
                      <div key={h}
                        className="absolute left-0 right-0 border-t border-border/25 pointer-events-none"
                        style={{ top: `${(h - HOUR_START) * HOUR_PX}px` }}
                      />
                    ))}
                    {/* Half-hour lines */}
                    {HOURS.map(h => (
                      <div key={`hh${h}`}
                        className="absolute left-0 right-0 border-t border-border/10 pointer-events-none"
                        style={{ top: `${(h - HOUR_START + 0.5) * HOUR_PX}px` }}
                      />
                    ))}

                    {/* Drag preview */}
                    {dragRect && (
                      <div
                        className="absolute left-1 right-1 bg-primary/15 border border-primary/40 border-dashed rounded-lg pointer-events-none z-10"
                        style={{ top: dragRect.top, height: Math.max(dragRect.height, 4) }}
                      />
                    )}

                    {/* Slots */}
                    {daySlots.map(slot => {
                      const startH   = timeToHour(slot.start_time)
                      const endH     = timeToHour(slot.end_time)
                      const visStart = Math.max(startH, HOUR_START)
                      const visEnd   = Math.min(endH, HOUR_END)
                      if (visEnd <= visStart) return null

                      const top    = (visStart - HOUR_START) * HOUR_PX
                      const height = Math.max((visEnd - visStart) * HOUR_PX - 2, 20)
                      const isRec  = slot.recurring_weekly
                      const isDel  = deletingId === slot.id

                      return (
                        <div
                          key={slot.id}
                          data-slot="true"
                          className="absolute left-0.5 right-0.5 rounded-md cursor-pointer z-20 overflow-hidden group transition-all duration-150 hover:brightness-90 hover:shadow-lg"
                          style={{
                            top, height,
                            background: isRec ? 'rgba(26,170,88,0.85)' : '#29C46A',
                            border: `1px solid ${isRec ? '#17964d' : '#1FB85A'}`,
                          }}
                          onClick={e => openEdit(e, slot)}
                        >
                          <div className="flex items-start justify-between p-1 h-full">
                            <div className="text-[9px] font-semibold text-white leading-tight">
                              <p>{slot.start_time.slice(0, 5)}</p>
                              <p className="opacity-75">–{slot.end_time.slice(0, 5)}</p>
                              {isRec && <p className="opacity-60 mt-0.5">↻</p>}
                            </div>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                              {isDel
                                ? <Loader2 className="w-3 h-3 animate-spin text-white" />
                                : <CalendarDays className="w-3 h-3 text-white/80" />
                              }
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer note */}
      <p className="text-xs text-muted-foreground mt-3">
        Slots mit ↻ sind wöchentlich wiederkehrend. Auf einen Slot klicken zum Bearbeiten oder Löschen.
      </p>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {edit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setEdit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-lg leading-tight">Slot bearbeiten</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {edit.slot.start_time.slice(0, 5)} – {edit.slot.end_time.slice(0, 5)} Uhr
                    {' · '}
                    {format(parseISO(edit.slot.date), 'EEE dd. MMM yyyy', { locale: de })}
                  </p>
                </div>
                <button
                  onClick={() => setEdit(null)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Recurring toggle */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Wiederholung</p>
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-xl">
                  <button
                    onClick={() => setEdit(prev => prev ? { ...prev, recurring: false, endDate: '' } : prev)}
                    className={[
                      'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                      !edit.recurring
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Einmalig
                  </button>
                  <button
                    onClick={() => setEdit(prev => prev ? { ...prev, recurring: true } : prev)}
                    className={[
                      'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                      edit.recurring
                        ? 'bg-[#29C46A]/10 text-[#29C46A] shadow-sm border border-[#29C46A]/20'
                        : 'text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Jeden {DOW_LABELS[getDay(parseISO(edit.slot.date))]}
                  </button>
                </div>
              </div>

              {/* End date (only for recurring) */}
              <AnimatePresence>
                {edit.recurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mb-5"
                  >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Wiederholen bis (optional)
                    </p>
                    <input
                      type="date"
                      value={edit.endDate}
                      min={format(addDays(parseISO(edit.slot.date), 7), 'yyyy-MM-dd')}
                      onChange={e => setEdit(prev => prev ? { ...prev, endDate: e.target.value } : prev)}
                      className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {edit.endDate && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Letzter Slot: {format(parseISO(edit.endDate), 'EEE, dd. MMMM yyyy', { locale: de })}
                      </p>
                    )}
                    {!edit.endDate && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Kein Enddatum → wiederholt sich unbegrenzt
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(edit.slot)}
                  disabled={deletingId === edit.slot.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-400/10 hover:bg-red-400/20 text-red-400 text-sm font-medium transition-all border border-red-400/20"
                >
                  {deletingId === edit.slot.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                  Löschen
                </button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEdit(null)}
                  className="text-muted-foreground"
                >
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#29C46A] hover:bg-[#24b060] text-white border-0"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Speichern
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
