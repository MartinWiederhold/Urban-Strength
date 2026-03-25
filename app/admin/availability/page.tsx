'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Loader2, Trash2, RefreshCw,
  X, CalendarDays, RotateCcw, LayoutList, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Availability } from '@/lib/types'
import {
  format, addDays, startOfWeek, isSameDay, getDay,
  startOfDay, isBefore, parseISO,
} from 'date-fns'
import { de } from 'date-fns/locale'

// ── Constants ──────────────────────────────────────────────────────────────
const HOUR_START = 6
const HOUR_END   = 22
const HOUR_PX    = 56
const TOTAL_H    = (HOUR_END - HOUR_START) * HOUR_PX
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const DOW_LABELS = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']

function snapHalf(h: number) { return Math.round(h * 2) / 2 }
function hourToTime(h: number): string {
  const hh = Math.floor(h); const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`
}
function timeToHour(t: string): number {
  const [hh, mm] = t.split(':').map(Number); return hh + mm / 60
}
function durationLabel(start: string, end: string): string {
  const mins = Math.round((timeToHour(end) - timeToHour(start)) * 60)
  return mins >= 60 ? `${mins / 60}h` : `${mins}min`
}

// ── Types ──────────────────────────────────────────────────────────────────
interface ColDrag { dayIndex: number; startY: number; currentY: number }
interface SlotDragInit {
  slot: Availability; dayIndex: number
  startX: number; startY: number; offsetY: number; slotH: number
}
interface SlotDragPreview {
  targetDayIndex: number; top: number; height: number; slot: Availability
}
interface EditState {
  slot: Availability; recurring: boolean; endDate: string
  startTime: string; endTime: string
}
interface SeriesConfirm {
  slot: Availability; newDate: string; newStartTime: string; newEndTime: string
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AvailabilityPage() {
  const [slots, setSlots]           = useState<Availability[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSaving, setIsSaving]     = useState(false)
  const [msg, setMsg]               = useState<{ text: string; ok: boolean } | null>(null)
  const [weekStart, setWeekStart]   = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [activeTab, setActiveTab]   = useState<'calendar' | 'list'>('calendar')
  const [listFilter, setListFilter] = useState<string>('all')
  const [edit, setEdit]             = useState<EditState | null>(null)
  const [seriesConfirm, setSeriesConfirm] = useState<SeriesConfirm | null>(null)

  // Refs — avoid stale closures in event handlers
  const colRefs             = useRef<(HTMLDivElement | null)[]>([])
  const colDragRef          = useRef<ColDrag | null>(null)
  const [colDrag, setColDragState] = useState<ColDrag | null>(null)
  const setColDrag = (v: ColDrag | null) => { colDragRef.current = v; setColDragState(v) }

  const slotDragInitRef     = useRef<SlotDragInit | null>(null)
  const slotDragActiveRef   = useRef(false)
  const slotDragPreviewRef  = useRef<SlotDragPreview | null>(null)
  const [slotDragPreview, setSlotDragPreviewState] = useState<SlotDragPreview | null>(null)
  const setSlotDragPreview  = (v: SlotDragPreview | null) => { slotDragPreviewRef.current = v; setSlotDragPreviewState(v) }

  const weekDaysRef         = useRef<Date[]>([])
  const weekDays            = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  useEffect(() => { weekDaysRef.current = weekDays }, [weekDays])

  // ── Data ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const supabase = createClient()
    // Load a bounded window: 4 weeks back + 12 weeks forward (covers calendar + list view)
    const windowStart = format(addDays(new Date(), -28), 'yyyy-MM-dd')
    const windowEnd   = format(addDays(new Date(),  84), 'yyyy-MM-dd')
    const { data } = await supabase.from('availability').select('*')
      .eq('is_available', true)
      .or(`date.gte.${windowStart},recurring_weekly.eq.true`)
      .lte('date', windowEnd)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    setSlots((data as Availability[]) ?? [])
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const getSlotsForDay = (day: Date): Availability[] => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dow = getDay(day)
    return slots.filter(s => {
      if (s.date === dateStr) return true
      if (s.recurring_weekly && s.day_of_week === dow) {
        if (dateStr < s.date) return false
        if (s.recurring_end_date && dateStr > s.recurring_end_date) return false
        return true
      }
      return false
    }).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // ── Edit / Save ──────────────────────────────────────────────────────────
  const openEdit = (slot: Availability) => setEdit({
    slot,
    recurring:  slot.recurring_weekly,
    endDate:    slot.recurring_end_date ?? '',
    startTime:  slot.start_time.slice(0, 5),
    endTime:    slot.end_time.slice(0, 5),
  })

  const handleSave = async () => {
    if (!edit) return
    setIsSaving(true)
    const supabase = createClient()
    const dow = getDay(parseISO(edit.slot.date))

    let { error } = await supabase.from('availability').update({
      recurring_weekly:   edit.recurring,
      day_of_week:        edit.recurring ? dow : null,
      recurring_end_date: edit.recurring && edit.endDate ? edit.endDate : null,
      start_time:         edit.startTime,
      end_time:           edit.endTime,
    }).eq('id', edit.slot.id)

    if (error) {
      const fb = await supabase.from('availability').update({
        recurring_weekly: edit.recurring,
        day_of_week:      edit.recurring ? dow : null,
        start_time:       edit.startTime,
        end_time:         edit.endTime,
      }).eq('id', edit.slot.id)
      error = fb.error
    }

    if (error) {
      setMsg({ text: 'Fehler: ' + error.message, ok: false })
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

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (slot: Availability) => {
    const confirmMsg = slot.recurring_weekly
      ? 'Wöchentlich wiederkehrenden Slot löschen?'
      : 'Slot löschen?'
    if (!confirm(confirmMsg)) return
    setEdit(null)
    setDeletingId(slot.id)
    const supabase = createClient()
    await supabase.from('availability').update({ is_available: false }).eq('id', slot.id)
    await load()
    setDeletingId(null)
  }

  // ── Move slot ────────────────────────────────────────────────────────────
  const moveSlot = useCallback(async (
    slot: Availability, newDate: string,
    newStartTime: string, newEndTime: string, seriesMove: boolean,
  ) => {
    setIsSaving(true)
    const supabase = createClient()
    const updateData: Record<string, unknown> = { date: newDate, start_time: newStartTime, end_time: newEndTime }
    if (slot.recurring_weekly) {
      if (seriesMove) {
        updateData.day_of_week = getDay(parseISO(newDate))
      } else {
        updateData.recurring_weekly = false
        updateData.day_of_week = null
      }
    }
    const { error } = await supabase.from('availability').update(updateData).eq('id', slot.id)
    setMsg(error ? { text: 'Fehler beim Verschieben.', ok: false } : { text: 'Slot verschoben!', ok: true })
    setTimeout(() => setMsg(null), 3000)
    await load()
    setIsSaving(false)
  }, [load])

  // ── Column drag (create) ─────────────────────────────────────────────────
  const onColMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    if ((e.target as HTMLElement).closest('[data-slot]')) return
    const col = colRefs.current[dayIndex]
    if (!col) return
    const rect = col.getBoundingClientRect()
    const y = Math.max(0, e.clientY - rect.top)
    setColDrag({ dayIndex, startY: y, currentY: y })
    e.preventDefault()
  }

  // ── Slot mousedown (move or click) ───────────────────────────────────────
  const handleSlotMouseDown = (e: React.MouseEvent, slot: Availability, dayIndex: number) => {
    e.stopPropagation()
    e.preventDefault()
    const col = colRefs.current[dayIndex]
    if (!col) return
    const rect  = col.getBoundingClientRect()
    const startH = Math.max(timeToHour(slot.start_time), HOUR_START)
    const slotTop = (startH - HOUR_START) * HOUR_PX
    const offsetY = Math.max(0, e.clientY - rect.top - slotTop)
    const slotH   = Math.max((timeToHour(slot.end_time) - startH) * HOUR_PX - 2, 20)
    slotDragInitRef.current  = { slot, dayIndex, startX: e.clientX, startY: e.clientY, offsetY, slotH }
    slotDragActiveRef.current = false
  }

  // ── Combined window handlers (stable via refs) ───────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    // Column drag
    const cd = colDragRef.current
    if (cd) {
      const col = colRefs.current[cd.dayIndex]
      if (!col) return
      const rect = col.getBoundingClientRect()
      const y = Math.max(0, Math.min(e.clientY - rect.top, TOTAL_H))
      setColDrag({ ...cd, currentY: y })
      return
    }

    // Slot drag
    const init = slotDragInitRef.current
    if (!init) return
    if (!slotDragActiveRef.current) {
      const dx = Math.abs(e.clientX - init.startX)
      const dy = Math.abs(e.clientY - init.startY)
      if (dx < 5 && dy < 5) return
      slotDragActiveRef.current = true
    }

    // Find target column
    let targetDayIndex = init.dayIndex
    for (let i = 0; i < 7; i++) {
      const col = colRefs.current[i]
      if (!col) continue
      const r = col.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right) { targetDayIndex = i; break }
    }

    const targetCol = colRefs.current[targetDayIndex]
    if (!targetCol) return
    const tRect = targetCol.getBoundingClientRect()
    const rawY  = e.clientY - tRect.top - init.offsetY
    const durH  = timeToHour(init.slot.end_time) - timeToHour(init.slot.start_time)
    let startH  = HOUR_START + (rawY / TOTAL_H) * (HOUR_END - HOUR_START)
    startH      = snapHalf(Math.max(HOUR_START, Math.min(startH, HOUR_END - durH)))
    const top   = (startH - HOUR_START) * HOUR_PX
    const height = Math.max(durH * HOUR_PX - 2, 20)
    setSlotDragPreview({ targetDayIndex, top, height, slot: init.slot })
  }, [])

  const onMouseUp = useCallback(async () => {
    // Column drag → create slot
    const cd = colDragRef.current
    if (cd) {
      setColDrag(null)
      const { dayIndex, startY, currentY } = cd
      const minY = Math.min(startY, currentY)
      const maxY = Math.max(startY, currentY)
      if (maxY - minY < 8) return

      let startH = HOUR_START + (minY / TOTAL_H) * (HOUR_END - HOUR_START)
      let endH   = HOUR_START + (maxY / TOTAL_H) * (HOUR_END - HOUR_START)
      startH = snapHalf(startH); endH = snapHalf(endH)
      if (endH - startH < 1) endH = startH + 1
      if (endH > HOUR_END)   endH = HOUR_END

      const day     = weekDaysRef.current[dayIndex]
      const dateStr = format(day, 'yyyy-MM-dd')
      setIsSaving(true)
      const supabase = createClient()
      const { error } = await supabase.from('availability').insert({
        date: dateStr, start_time: hourToTime(startH), end_time: hourToTime(endH),
        is_available: true, recurring_weekly: false, day_of_week: null,
      })
      setMsg(error
        ? { text: 'Fehler beim Erstellen.', ok: false }
        : { text: `Slot ${hourToTime(startH)}–${hourToTime(endH)} Uhr erstellt!`, ok: true }
      )
      setTimeout(() => setMsg(null), 3000)
      await load()
      setIsSaving(false)
      return
    }

    // Slot drag
    const init      = slotDragInitRef.current
    const activated = slotDragActiveRef.current
    const preview   = slotDragPreviewRef.current

    slotDragInitRef.current   = null
    slotDragActiveRef.current = false
    setSlotDragPreview(null)

    if (!init) return

    if (!activated || !preview) {
      // Just a click → open edit modal
      const s = init.slot
      setEdit({ slot: s, recurring: s.recurring_weekly, endDate: s.recurring_end_date ?? '', startTime: s.start_time.slice(0,5), endTime: s.end_time.slice(0,5) })
      return
    }

    // Finalize move
    const slot    = init.slot
    const target  = weekDaysRef.current[preview.targetDayIndex]
    if (!target) return
    const durH    = timeToHour(slot.end_time) - timeToHour(slot.start_time)
    const startH  = snapHalf(HOUR_START + (preview.top / TOTAL_H) * (HOUR_END - HOUR_START))
    const endH    = Math.min(startH + durH, HOUR_END)
    const newDate = format(target, 'yyyy-MM-dd')
    const newStart = hourToTime(startH)
    const newEnd   = hourToTime(endH)

    if (newDate === slot.date && newStart === slot.start_time.slice(0,5)) return

    if (slot.recurring_weekly) {
      setSeriesConfirm({ slot, newDate, newStartTime: newStart, newEndTime: newEnd })
    } else {
      await moveSlot(slot, newDate, newStart, newEnd, false)
    }
  }, [load, moveSlot])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getColDragRect = (dayIndex: number) => {
    const cd = colDragRef.current
    if (!cd || cd.dayIndex !== dayIndex) return null
    const top    = Math.min(cd.startY, cd.currentY)
    const height = Math.abs(cd.currentY - cd.startY)
    return height > 4 ? { top, height } : null
  }

  const today     = startOfDay(new Date())
  const recCount  = slots.filter(s => s.recurring_weekly).length
  const specCount = slots.filter(s => !s.recurring_weekly).length

  // List view data
  const filteredListSlots = slots.filter(s => {
    if (listFilter === 'all') return true
    const dow = s.recurring_weekly ? (s.day_of_week ?? 0) : getDay(parseISO(s.date))
    return dow === Number(listFilter)
  }).sort((a, b) => {
    const da = a.recurring_weekly ? (a.day_of_week ?? 0) : getDay(parseISO(a.date))
    const db = b.recurring_weekly ? (b.day_of_week ?? 0) : getDay(parseISO(b.date))
    if (da !== db) return da - db
    return a.start_time.localeCompare(b.start_time)
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="animate-slide-up flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verfügbarkeit</h1>
          <p className="text-muted-foreground mt-1">
            {activeTab === 'calendar'
              ? 'Ziehen zum Erstellen · Slot anfassen und ziehen zum Verschieben · Klicken zum Bearbeiten'
              : 'Alle Slots als Liste – nach Tag filtern und bearbeiten'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('calendar')}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <Calendar className="w-3.5 h-3.5" /> Kalender
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <LayoutList className="w-3.5 h-3.5" /> Liste
          </button>
        </div>
      </div>

      {/* ── CALENDAR TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'calendar' && (
        <>
          {/* Week nav */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors text-sm font-medium">
                Heute
              </button>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-muted-foreground ml-1">
                {format(weekStart, 'dd. MMM', { locale: de })} – {format(addDays(weekStart, 6), 'dd. MMM yyyy', { locale: de })}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {msg && (
                <span className={`animate-in text-sm font-medium ${msg.ok ? 'text-emerald-400' : 'text-destructive'}`}>
                  {msg.text}
                </span>
              )}
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                <span className="font-semibold text-foreground">{slots.length}</span> aktiv ·{' '}
                <RefreshCw className="w-2.5 h-2.5 inline" /> {recCount} wöchentlich · {specCount} einmalig
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mb-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#29C46A] inline-block" />Einmalig</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1aaa58] inline-block opacity-70" /><RefreshCw className="w-2.5 h-2.5" /> Wöchentlich</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/20 border border-primary/40 border-dashed inline-block" />Ziehen zum Erstellen</span>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="h-96 rounded-xl shimmer" />
          ) : (
            <div
              className="animate-in bg-card rounded-xl border border-border overflow-hidden"
              style={{ cursor: slotDragPreview ? 'grabbing' : undefined }}
            >
              {/* Day headers */}
              <div className="grid border-b border-border" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
                <div className="border-r border-border bg-secondary/20" />
                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, new Date())
                  const isPast  = isBefore(startOfDay(day), today) && !isToday
                  return (
                    <div key={i} className={['p-3 text-center border-r border-border last:border-r-0', isToday ? 'bg-primary/10' : '', isPast ? 'opacity-40' : ''].join(' ')}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{format(day, 'EEE', { locale: de })}</p>
                      <p className={`text-xl font-bold leading-tight mt-0.5 ${isToday ? 'text-primary' : ''}`}>{format(day, 'd')}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">{format(day, 'dd.MM.')}</p>
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
                      <div key={h} className="flex items-start justify-end pr-2 pt-1" style={{ height: `${HOUR_PX}px` }}>
                        <span className="text-[9px] text-muted-foreground/50 font-mono leading-none">{String(h).padStart(2,'0')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((day, dayIndex) => {
                    const daySlots = getSlotsForDay(day)
                    const dragRect = getColDragRect(dayIndex)
                    const isToday  = isSameDay(day, new Date())
                    const isPast   = isBefore(startOfDay(day), today) && !isToday

                    return (
                      <div
                        key={dayIndex}
                        ref={el => { colRefs.current[dayIndex] = el }}
                        className={['relative border-r border-border last:border-r-0 select-none', isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-crosshair', isToday ? 'bg-primary/[0.02]' : ''].join(' ')}
                        style={{ height: `${TOTAL_H}px` }}
                        onMouseDown={!isPast ? e => onColMouseDown(e, dayIndex) : undefined}
                      >
                        {/* Hour/half lines */}
                        {HOURS.map(h => (
                          <div key={h} className="absolute left-0 right-0 border-t border-border/25 pointer-events-none" style={{ top: `${(h - HOUR_START) * HOUR_PX}px` }} />
                        ))}
                        {HOURS.map(h => (
                          <div key={`hh${h}`} className="absolute left-0 right-0 border-t border-border/10 pointer-events-none" style={{ top: `${(h - HOUR_START + 0.5) * HOUR_PX}px` }} />
                        ))}

                        {/* Column drag preview */}
                        {dragRect && (
                          <div className="absolute left-1 right-1 bg-primary/15 border border-primary/40 border-dashed rounded-lg pointer-events-none z-10"
                            style={{ top: dragRect.top, height: Math.max(dragRect.height, 4) }} />
                        )}

                        {/* Slot drag ghost */}
                        {slotDragPreview && slotDragPreview.targetDayIndex === dayIndex && (
                          <div
                            className="absolute left-0.5 right-0.5 rounded-md z-30 pointer-events-none"
                            style={{
                              top: slotDragPreview.top,
                              height: slotDragPreview.height,
                              background: slotDragPreview.slot.recurring_weekly ? 'rgba(26,170,88,0.55)' : 'rgba(41,196,106,0.55)',
                              border: '2px dashed rgba(255,255,255,0.5)',
                            }}
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
                          const isDraggingThis = slotDragPreview?.slot.id === slot.id

                          return (
                            <div
                              key={slot.id}
                              data-slot="true"
                              className="absolute left-0.5 right-0.5 rounded-md z-20 overflow-hidden group transition-all duration-100 hover:brightness-90 hover:shadow-lg"
                              style={{
                                top, height,
                                background: isRec ? 'rgba(26,170,88,0.85)' : '#29C46A',
                                border: `1px solid ${isRec ? '#17964d' : '#1FB85A'}`,
                                opacity: isDraggingThis ? 0.35 : 1,
                                cursor: isDraggingThis ? 'grabbing' : 'grab',
                              }}
                              onMouseDown={e => handleSlotMouseDown(e, slot, dayIndex)}
                            >
                              <div className="flex items-start justify-between p-1 h-full">
                                <div className="text-[9px] font-semibold text-white leading-tight">
                                  <p>{slot.start_time.slice(0,5)}</p>
                                  <p className="opacity-75">–{slot.end_time.slice(0,5)}</p>
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
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            Slots mit ↻ sind wöchentlich wiederkehrend. Slot anfassen &amp; ziehen zum Verschieben. Klicken zum Bearbeiten.
          </p>
        </>
      )}

      {/* ── LIST TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'list' && (
        <div className="animate-in">
          {/* Day filter */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Select value={listFilter} onValueChange={setListFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Alle Tage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Tage</SelectItem>
                {DOW_LABELS.map((label, i) => (
                  <SelectItem key={i} value={String(i)}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filteredListSlots.length} Slot{filteredListSlots.length !== 1 ? 's' : ''}</span>
          </div>

          {/* List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-secondary rounded-xl animate-pulse" />)}</div>
            ) : filteredListSlots.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">Keine Verfügbarkeiten gefunden.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Datum / Tag</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Uhrzeit</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Dauer</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Typ</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Enddatum</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredListSlots.map((slot, i) => (
                      <tr
                        key={slot.id}
                        className="animate-in hover:bg-secondary/30 transition-colors"
                        style={{ animationDelay: `${i * 0.02}s` }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {slot.recurring_weekly ? (
                              <span className="font-medium">{DOW_LABELS[slot.day_of_week ?? 0]}</span>
                            ) : (
                              <span className="font-medium">{format(parseISO(slot.date), 'EEE, dd. MMM yyyy', { locale: de })}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)} Uhr
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {durationLabel(slot.start_time, slot.end_time)}
                        </td>
                        <td className="p-4">
                          {slot.recurring_weekly ? (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-[#29C46A]/10 text-[#29C46A] border border-[#29C46A]/20 w-fit">
                              <RefreshCw className="w-2.5 h-2.5" /> Wöchentlich
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-muted-foreground border border-border">Einmalig</span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {slot.recurring_end_date
                            ? format(parseISO(slot.recurring_end_date), 'dd.MM.yyyy')
                            : slot.recurring_weekly ? '∞ unbegrenzt' : '–'
                          }
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost" size="sm"
                              className="text-xs h-8"
                              onClick={() => openEdit(slot)}
                            >
                              Bearbeiten
                            </Button>
                            <button
                              onClick={() => handleDelete(slot)}
                              disabled={deletingId === slot.id}
                              className="p-1.5 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-400 transition-colors"
                            >
                              {deletingId === slot.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ───────────────────────────────────────────────────── */}
      {edit && (
          <div
            className="animate-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setEdit(null)}
          >
            <div
              className="animate-scale-in bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-lg leading-tight">Slot bearbeiten</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {format(parseISO(edit.slot.date), 'EEE dd. MMM yyyy', { locale: de })}
                  </p>
                </div>
                <button onClick={() => setEdit(null)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Time inputs */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Uhrzeit</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Von</label>
                    <input
                      type="time"
                      value={edit.startTime}
                      onChange={e => setEdit(prev => prev ? { ...prev, startTime: e.target.value } : prev)}
                      className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Bis</label>
                    <input
                      type="time"
                      value={edit.endTime}
                      onChange={e => setEdit(prev => prev ? { ...prev, endTime: e.target.value } : prev)}
                      className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              {/* Recurring toggle */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Wiederholung</p>
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-xl">
                  <button
                    onClick={() => setEdit(prev => prev ? { ...prev, recurring: false, endDate: '' } : prev)}
                    className={['flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all', !edit.recurring ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}
                  >
                    <CalendarDays className="w-3.5 h-3.5" /> Einmalig
                  </button>
                  <button
                    onClick={() => setEdit(prev => prev ? { ...prev, recurring: true } : prev)}
                    className={['flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all', edit.recurring ? 'bg-[#29C46A]/10 text-[#29C46A] shadow-sm border border-[#29C46A]/20' : 'text-muted-foreground hover:text-foreground'].join(' ')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Jeden {DOW_LABELS[getDay(parseISO(edit.slot.date))]}
                  </button>
                </div>
              </div>

              {/* End date (recurring only) */}
              {edit.recurring && (
                <div className="animate-in overflow-hidden mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Wiederholen bis (optional)</p>
                  <input
                    type="date"
                    value={edit.endDate}
                    min={format(addDays(parseISO(edit.slot.date), 7), 'yyyy-MM-dd')}
                    onChange={e => setEdit(prev => prev ? { ...prev, endDate: e.target.value } : prev)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {edit.endDate
                      ? `Letzter Slot: ${format(parseISO(edit.endDate), 'EEE, dd. MMMM yyyy', { locale: de })}`
                      : 'Kein Enddatum → wiederholt sich unbegrenzt'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(edit.slot)}
                  disabled={deletingId === edit.slot.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-400/10 hover:bg-red-400/20 text-red-400 text-sm font-medium transition-all border border-red-400/20"
                >
                  {deletingId === edit.slot.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Löschen
                </button>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={() => setEdit(null)} className="text-muted-foreground">Abbrechen</Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-[#29C46A] hover:bg-[#24b060] text-white border-0">
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Speichern
                </Button>
              </div>
            </div>
          </div>
      )}

      {/* ── SERIES CONFIRM MODAL ─────────────────────────────────────────── */}
      {seriesConfirm && (
          <div
            className="animate-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <div
              className="animate-scale-in bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="font-bold text-lg mb-2">Serie oder einzelner Slot?</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Dieser Slot ist Teil einer wöchentlichen Serie.
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                Neues Datum: <span className="text-foreground font-medium">{format(parseISO(seriesConfirm.newDate), 'EEE dd. MMM', { locale: de })}</span> · {seriesConfirm.newStartTime}–{seriesConfirm.newEndTime} Uhr
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { moveSlot(seriesConfirm.slot, seriesConfirm.newDate, seriesConfirm.newStartTime, seriesConfirm.newEndTime, false); setSeriesConfirm(null) }}
                  className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/70 border border-border text-sm font-medium transition-all text-left"
                >
                  <p className="font-semibold">Nur dieser Slot</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Série läuft weiter</p>
                </button>
                <button
                  onClick={() => { moveSlot(seriesConfirm.slot, seriesConfirm.newDate, seriesConfirm.newStartTime, seriesConfirm.newEndTime, true); setSeriesConfirm(null) }}
                  className="py-2.5 px-4 rounded-xl bg-[#29C46A]/10 hover:bg-[#29C46A]/20 border border-[#29C46A]/20 text-sm font-medium transition-all text-left"
                >
                  <p className="font-semibold text-[#29C46A]">Gesamte Serie</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Alle Wochen verschoben</p>
                </button>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => setSeriesConfirm(null)}>
                Abbrechen
              </Button>
            </div>
          </div>
      )}
    </div>
  )
}
