'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Plus, Trash2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Booking, TrainingPlan } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [customer, setCustomer] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [newPlan, setNewPlan] = useState<{ title: string; type: TrainingPlan['type']; description: string }>({ title: '', type: 'training', description: '' })
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)

  const [notes, setNotes] = useState('')
  const [customerStatus, setCustomerStatus] = useState<Profile['customer_status']>('new')
  const [tags, setTags] = useState('')

  const load = async () => {
    const supabase = createClient()
    const [profileRes, bookingsRes, plansRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('bookings').select('*, services(title)').eq('customer_id', id).order('booking_date', { ascending: false }),
      supabase.from('training_plans').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    ])
    const p = profileRes.data as Profile
    setCustomer(p)
    setNotes(p?.notes ?? '')
    setCustomerStatus(p?.customer_status ?? 'new')
    setTags(p?.customer_tags?.join(', ') ?? '')
    setBookings((bookingsRes.data as Booking[]) ?? [])
    setPlans((plansRes.data as TrainingPlan[]) ?? [])
    setIsLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleSave = async () => {
    if (!customer) return
    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      notes,
      customer_status: customerStatus,
      customer_tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }).eq('id', id)
    if (error) setMessage({ text: 'Fehler beim Speichern.', type: 'error' })
    else setMessage({ text: 'Gespeichert!', type: 'success' })
    setIsSaving(false)
  }

  const handleCreatePlan = async () => {
    if (!newPlan.title.trim()) return
    setIsCreatingPlan(true)
    const supabase = createClient()
    await supabase.from('training_plans').insert({
      customer_id: id,
      title: newPlan.title,
      type: newPlan.type,
      content: { description: newPlan.description, exercises: [] },
      is_active: true,
    })
    setNewPlan({ title: '', type: 'training', description: '' })
    setShowPlanForm(false)
    await load()
    setIsCreatingPlan(false)
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Plan löschen?')) return
    const supabase = createClient()
    await supabase.from('training_plans').update({ is_active: false }).eq('id', planId)
    await load()
  }

  const statusLabel: Record<string, string> = {
    confirmed: 'Bestätigt', cancelled: 'Storniert', completed: 'Abgeschlossen',
    rescheduled: 'Verschoben', no_show: 'Nicht erschienen',
  }

  if (isLoading) return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!customer) return <div className="text-center text-muted-foreground pt-20">Kunde nicht gefunden.</div>

  return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Zurück zur Kundenliste
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{customer.full_name ?? 'Unbenannt'}</h1>
          <p className="text-muted-foreground">{customer.email} · {customer.phone ?? '–'}</p>
        </div>
        <Link href={`/admin/chat/${id}`}>
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4" /> Chat öffnen
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Fields */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-bold mb-2">CRM</h2>
          <div>
            <Label>Kunden-Status</Label>
            <Select value={customerStatus} onValueChange={(v) => setCustomerStatus(v as Profile['customer_status'])}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Neu</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tags (kommagetrennt)</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="z.B. muskelaufbau, anfänger" className="mt-1" />
          </div>
          <div>
            <Label>Notizen (intern)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Interne Notizen zu diesem Kunden..." className="mt-1" rows={4} />
          </div>
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}
          <Button onClick={handleSave} disabled={isSaving} variant="hero" className="w-full">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </div>

        {/* Bookings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold mb-4">Buchungshistorie ({bookings.length})</h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Buchungen.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                  <div>
                    <p className="font-medium">{(b as any).services?.title ?? '–'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(b.booking_date), 'dd. MMM yyyy', { locale: de })} · {b.start_time.slice(0,5)} Uhr
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{statusLabel[b.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Training Plans */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Trainingspläne ({plans.filter(p => p.is_active).length})</h2>
            <Button variant="outline" size="sm" onClick={() => setShowPlanForm(!showPlanForm)}>
              <Plus className="w-4 h-4" /> Plan erstellen
            </Button>
          </div>

          {showPlanForm && (
            <div className="mb-4 p-4 rounded-xl border border-border bg-secondary/50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Titel *</Label>
                  <Input value={newPlan.title} onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))} placeholder="z.B. Trainingsplan Woche 1" className="mt-1" />
                </div>
                <div>
                  <Label>Typ</Label>
                  <Select value={newPlan.type} onValueChange={(v) => setNewPlan(p => ({ ...p, type: v as TrainingPlan['type'] }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">Trainingsplan</SelectItem>
                      <SelectItem value="nutrition">Ernährungsplan</SelectItem>
                      <SelectItem value="general">Allgemein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Beschreibung / Inhalt</Label>
                <Textarea value={newPlan.description} onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))} placeholder="Beschreibung des Plans..." className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePlan} disabled={isCreatingPlan} variant="hero" size="sm">
                  {isCreatingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Erstellen
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPlanForm(false)}>Abbrechen</Button>
              </div>
            </div>
          )}

          {plans.filter(p => p.is_active).length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Pläne erstellt.</p>
          ) : (
            <div className="space-y-2">
              {plans.filter(p => p.is_active).map(plan => (
                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                  <div>
                    <p className="font-medium">{plan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.type === 'training' ? 'Trainingsplan' : plan.type === 'nutrition' ? 'Ernährungsplan' : 'Allgemein'} ·
                      {format(new Date(plan.created_at), ' dd. MMM yyyy', { locale: de })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
