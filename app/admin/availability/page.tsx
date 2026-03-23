'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Availability } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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

  const recurringSlots = slots.filter(s => s.recurring_weekly)
  const specificSlots = slots.filter(s => !s.recurring_weekly)

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verfügbarkeit</h1>
        <p className="text-muted-foreground mt-1">Verfügbare Zeitslots verwalten.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Form */}
        <div className="bg-white rounded-2xl border border-border p-6">
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
              <Label htmlFor="recurring">Wöchentlich wiederholen</Label>
            </div>

            {newSlot.recurring_weekly ? (
              <div>
                <Label>Wochentag</Label>
                <Select value={String(newSlot.day_of_week)} onValueChange={v => setNewSlot(s => ({ ...s, day_of_week: parseInt(v) }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, i) => <SelectItem key={i} value={String(i)}>{day}</SelectItem>)}
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
              <p className={`text-sm p-3 rounded-lg ${message.includes('Fehler') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{message}</p>
            )}

            <Button onClick={handleAdd} disabled={isSaving} variant="hero" className="w-full">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Slot hinzufügen
            </Button>
          </div>
        </div>

        {/* Current Slots */}
        <div className="space-y-4">
          {/* Recurring */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-bold mb-4">Wöchentliche Slots ({recurringSlots.length})</h2>
            {recurringSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine wiederkehrenden Slots.</p>
            ) : (
              <div className="space-y-2">
                {recurringSlots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-muted text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">{DAYS[slot.day_of_week ?? 0]}</span>
                      <span className="text-muted-foreground">{slot.start_time.slice(0,5)}–{slot.end_time.slice(0,5)}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(slot.id)} disabled={deletingId === slot.id} className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0">
                      {deletingId === slot.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specific */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-bold mb-4">Spezifische Slots ({specificSlots.length})</h2>
            {specificSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine spezifischen Slots.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {specificSlots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-muted text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">{format(new Date(slot.date), 'EEE dd. MMM', { locale: de })}</span>
                      <span className="text-muted-foreground">{slot.start_time.slice(0,5)}–{slot.end_time.slice(0,5)}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(slot.id)} disabled={deletingId === slot.id} className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0">
                      {deletingId === slot.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
