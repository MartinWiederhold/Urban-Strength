'use client'

import { useState, useEffect } from 'react'
import { Calendar, Check, ArrowLeft, ArrowRight, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import AvailabilityCalendar from '@/components/booking/AvailabilityCalendar'
import type { Availability, Service } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

export default function DashboardBookPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      setServices((data as Service[]) ?? [])
    }
    load()
  }, [])

  const handleBook = async () => {
    if (!profile || !selectedService || !selectedSlot) return
    setIsLoading(true)
    setError('')
    const supabase = createClient()
    const { error: bookingError } = await supabase.from('bookings').insert({
      customer_id: profile.id,
      service_id: selectedService.id,
      availability_id: selectedSlot.id,
      booking_date: selectedSlot.date,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      status: 'confirmed',
    })
    if (bookingError) {
      setError('Fehler beim Speichern der Buchung. Bitte versuche es erneut.')
      setIsLoading(false)
      return
    }
    // Send confirmation emails (fire & forget)
    const emailPayload = {
      name: profile.full_name ?? profile.email,
      service: selectedService.title,
      date: selectedSlot.date,
      time: selectedSlot.start_time,
    }
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'booking_confirmation', to: profile.email, ...emailPayload }),
    }).catch(() => {})
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'new_booking_admin', to: profile.email, customerEmail: profile.email, ...emailPayload }),
    }).catch(() => {})

    router.push('/dashboard/bookings')
  }

  return (
    <div>
      <div className="animate-slide-up mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Termin buchen</h1>
        <p className="text-muted-foreground mt-1">Wähle ein Angebot und einen freien Termin aus.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 max-w-xs">
        {[{ n: 1, label: 'Termin' }, { n: 2, label: 'Bestätigen' }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              step > s.n ? 'bg-emerald-400 text-black' :
              step === s.n ? 'bg-foreground text-background' :
              'bg-secondary text-muted-foreground'
            }`}>
              {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
            </div>
            <span className={`text-sm hidden sm:block ${step === s.n ? 'font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
            {i === 0 && <div className={`flex-1 h-px ${step > 1 ? 'bg-emerald-400' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
        {step === 1 && (
          <div
            key="step1"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-5">
              {/* Service picker */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="font-semibold mb-4">Angebot wählen</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedService?.id === svc.id
                          ? 'border-emerald-400 bg-emerald-400/10'
                          : 'border-border hover:border-foreground/30 hover:bg-secondary/50'
                      }`}
                    >
                      <p className="font-semibold text-sm">{svc.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {svc.price === 0 ? 'Kostenlos' : `CHF ${svc.price}`} · {svc.duration_minutes} Min.
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Freie Termine
                </h2>
                <AvailabilityCalendar
                  onSelectSlot={setSelectedSlot}
                  selectedSlot={selectedSlot}
                />
              </div>
            </div>

            {/* Sidebar summary */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5 sticky top-8">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Zusammenfassung</h3>
                {selectedService ? (
                  <div className="mb-3 p-3 rounded-lg bg-secondary text-sm">
                    <p className="font-medium">{selectedService.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedService.price === 0 ? 'Kostenlos' : `CHF ${selectedService.price}`} · {selectedService.duration_minutes} Min.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3">Kein Angebot gewählt</p>
                )}
                {selectedSlot ? (
                  <div className="p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-sm">
                    <p className="font-semibold text-emerald-400 text-xs uppercase tracking-wide mb-1">Gewählt</p>
                    <p className="font-medium">
                      {format(new Date(selectedSlot.date), 'EEE, dd. MMM yyyy', { locale: de })}
                    </p>
                    <p className="text-muted-foreground">{selectedSlot.start_time.slice(0, 5)} Uhr</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Noch kein Termin gewählt</p>
                )}

                <Button
                  variant="hero"
                  className="w-full mt-5"
                  disabled={!selectedService || !selectedSlot}
                  onClick={() => setStep(2)}
                >
                  Weiter
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div
            key="step2"
            className="max-w-lg"
          >
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-lg">Buchung bestätigen</h2>

              <div className="p-4 rounded-xl bg-secondary space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Angebot</p>
                <p className="font-semibold">{selectedService?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedService?.price === 0 ? 'Kostenlos' : `CHF ${selectedService?.price}`} · {selectedService?.duration_minutes} Min.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 space-y-1">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Termin</p>
                <p className="font-semibold">
                  {selectedSlot && format(new Date(selectedSlot.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                </p>
                <p className="text-sm text-muted-foreground">{selectedSlot?.start_time.slice(0, 5)} Uhr</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deine Daten</p>
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>

              <div className="flex items-start gap-2 p-4 rounded-xl bg-secondary">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Trainingsstandort</p>
                  <p className="text-sm text-muted-foreground">Oberer Heuelsteig 30, 8032 Zürich</p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" /> Zurück
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleBook} disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Check className="w-4 h-4" />
                  Verbindlich buchen
                </Button>
              </div>
            </div>
          </div>
        )}
      
    </div>
  )
}
