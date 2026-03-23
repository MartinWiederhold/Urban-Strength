'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Loader2, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Availability } from '@/lib/types'
import {
  format, addWeeks, subWeeks, startOfWeek, endOfWeek,
  eachDayOfInterval, getDay, isSameDay, isToday, isBefore, startOfDay,
} from 'date-fns'
import { de } from 'date-fns/locale'

// 0=Sun,1=Mon,...6=Sat  →  German names
const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const DAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** Return slots that apply on a given date (specific OR recurring). */
function getSlotsForDay(date: Date, slots: Availability[]): Availability[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dow = getDay(date)
  return slots
    .filter(s => (s.date === dateStr) || (s.recurring_weekly && s.day_of_week === dow))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '08:00',
    end_time: '09:00',
    recurring_weekly: false,
    day_of_week: 1,
  })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('is_available', true)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    setSlots((data as Availability[]) ?? [])
    setIsLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!newSlot.recurring_weekly && !newSlot.date) {
      setMessage('Bitte Datum oder wiederkehrend auswählen.')
      return
    }
    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('availability').insert({
      date: newSlot.recurring_weekly ? new Date().toISOString().split('T')[0] : newSlot.date,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      is_available: true,
      recurring_weekly: newSlot.recurring_weekly,
      day_of_week: newSlot.recurring_weekly ? newSlot.day_of_week : null,
    })
    if (!error) {
      setMessage('Slot hinzugefügt!')
      await load()
    } else {
      setMessage('Fehler beim Hinzufügen.')
    }
    setIsSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (slotId: string) => {
    setDeletingId(slotId)
    const supabase = createClient()
    await supabase.from('availability').update({ is_available: false }).eq('id', slotId)
    await load()
    setDeletingId(null)
  }

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  })

  const today = startOfDay(new Date())
  const recurringSlots = slots.filter(s => s.recurring_weekly)
  const specificSlots = slots.filter(s => !s.recurring_weekly)

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verfügbarkeit</h1>
        <p className="text-muted-foreground mt-1">Verfügbare Zeitslots verwalten.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold mb-5">Neuen Slot hinzufügen</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={newSlot.recurring_weekly}
                onChange={e => setNewSlot(s => ({ ...s, recurring_weekly: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="recurring" className="flex items-center gap-1.5 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Wöchentlich wiederholen
              </Label>
            </div>

            {newSlot.recurring_weekly ? (
              <div>
                <Label>Wochentag</Label>
                <Select value={String(newSlot.day_of_week)} onValueChange={v => setNewSlot(s => ({ ...s, day_of_week: parseInt(v) }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((day, i) => <SelectItem key={i} value={String(i)}>{day}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Datum</Label>
                <Input type="date" value={newSlot.date} onChange={e => setNewSlot(s => ({ ...s, date: e.target.value }))} className="mt-1" min={new Date().toISOString().split('T')[0]} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Von</Label>
                <Input type="time" value={newSlot.start_time} onChange={e => setNewSlot(s => ({ ...s, start_time: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Bis</Label>
                <Input type="time" value={newSlot.end_time} onChange={e => setNewSlot(s => ({ ...s, end_time: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {message && (
              <p className={`text-sm p-3 rounded-lg ${message.includes('Fehler') ? 'bg-destructive/10 text-destructive' : 'bg-emerald-400/10 text-emerald-400'}`}>{message}</p>
            )}

            <Button onClick={handleAdd} disabled={isSaving} variant="hero" className="w-full">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Slot hinzufügen
            </Button>
          </div>
        </div>

        {/* Week Calendar */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Wochenansicht</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="text-xs px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors font-medium">
                Heute
              </button>
              <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-400/20 border border-emerald-400/50 inline-block" />Einmaliger Slot</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-400/10 border border-emerald-400/30 inline-block" /><RefreshCw className="w-2.5 h-2.5" />Wiederkehrend</span>
          </div>

          {isLoading ? (
            <div className="h-40 rounded-xl bg-secondary animate-pulse" />
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(day => {
                const daySlots = getSlotsForDay(day, slots)
                const past = isBefore(day, today) && !isToday(day)
                const tod = isToday(day)

                return (
                  <div key={day.toISOString()} className={`min-h-[120px] rounded-xl border p-2 flex flex-col gap-1.5 ${tod ? 'border-primary/40 bg-primary/5' : 'border-border'} ${past ? 'opacity-40' : ''}`}>
                    {/* Day header */}
                    <div className="text-center mb-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {DAY_SHORT[getDay(day)]}
                      </p>
                      <p className={`text-sm font-bold ${tod ? 'text-primary' : ''}`}>{format(day, 'd')}</p>
                    </div>

                    {/* Slots */}
                    {daySlots.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/50 text-center mt-1">—</p>
                    ) : (
                      daySlots.map(slot => (
                        <div
                          key={slot.id}
                          className={`relative group rounded-lg px-1.5 py-1.5 text-[10px] font-medium leading-tight ${
                            slot.recurring_weekly
                              ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400'
                              : 'bg-emerald-400/20 border border-emerald-400/50 text-emerald-400'
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            {slot.recurring_weekly && <RefreshCw className="w-2.5 h-2.5 shrink-0 opacity-70" />}
                            <Clock className="w-2.5 h-2.5 shrink-0 opacity-70" />
                          </div>
                          <p>{slot.start_time.slice(0,5)}</p>
                          <p className="opacity-60">–{slot.end_time.slice(0,5)}</p>

                          {/* Delete on hover */}
                          <button
                            onClick={() => handleDelete(slot.id)}
                            disabled={deletingId === slot.id}
                            className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-destructive/20 hover:bg-destructive/40 text-destructive"
                          >
                            {deletingId === slot.id
                              ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              : <Trash2 className="w-2.5 h-2.5" />
                            }
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Summary row */}
          <div className="mt-5 pt-4 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
            <span><span className="font-semibold text-foreground">{recurringSlots.length}</span> wöchentliche Slots</span>
            <span><span className="font-semibold text-foreground">{specificSlots.length}</span> einmalige Slots</span>
            <span><span className="font-semibold text-emerald-400">{slots.length}</span> gesamt aktiv</span>
          </div>
        </div>
      </div>
    </div>
  )
}
