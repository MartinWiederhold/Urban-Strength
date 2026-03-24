'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import AvailabilityCalendar from '@/components/booking/AvailabilityCalendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Service, Availability } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const SERVICE_SLUGS: Record<string, string> = {
  'probe-training': 'Kostenloser Start',
  'personal-training': 'Personal Training 1:1',
  'quartals-abo': 'Quartals-Abo',
}

const GOAL_OPTIONS = [
  'Muskelaufbau',
  'Fettabbau',
  'Ausdauer',
  'Kraft',
  'Flexibilität',
  'Gesundheit',
  'Rehabilitation',
  'Allgemeine Fitness',
]

type Step = 1 | 2 | 3

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string

  const [step, setStep] = useState<Step>(1)
  const [service, setService] = useState<Service | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    experience: '',
  })

  useEffect(() => {
    const fetchService = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*')
        .ilike('title', `%${SERVICE_SLUGS[serviceId] ?? serviceId}%`)
        .eq('is_active', true)
        .limit(1)
        .single()
      setService(data)
    }
    fetchService()
  }, [serviceId])

  const updateForm = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const toggleGoal = (goal: string) =>
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    )

  const validateStep2 = () => {
    if (!formData.firstName.trim()) return 'Vorname ist erforderlich.'
    if (!formData.lastName.trim()) return 'Nachname ist erforderlich.'
    if (!formData.email.trim()) return 'E-Mail ist erforderlich.'
    if (!formData.phone.trim()) return 'Telefonnummer ist erforderlich.'
    return null
  }

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (!service || !selectedSlot) {
        setError('Bitte wähle einen Termin aus.')
        setIsLoading(false)
        return
      }

      const goalsStr = selectedGoals.join(', ') || null

      const { error: bookingError } = await supabase.from('bookings').insert({
        customer_id: null,
        first_name: formData.firstName,
        last_name: formData.lastName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        service_id: service.id,
        availability_id: selectedSlot.id,
        booking_date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        status: 'confirmed',
        age: formData.age ? parseInt(formData.age) : null,
        fitness_level: formData.experience || null,
        goals: goalsStr,
      })

      if (bookingError) {
        setError('Fehler beim Speichern der Buchung. Bitte versuche es erneut.')
        setIsLoading(false)
        return
      }

      // Pass booking data to success page via sessionStorage
      const bookingInfo = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        service: service.title,
        date: selectedSlot.date,
        time: selectedSlot.start_time,
        experience: formData.experience,
        goals: goalsStr,
      }
      sessionStorage.setItem('booking_success', JSON.stringify(bookingInfo))

      // Fire & forget emails
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking_confirmation',
          to: formData.email,
          name: bookingInfo.name,
          service: service.title,
          date: selectedSlot.date,
          time: selectedSlot.start_time,
        }),
      }).catch(() => {})

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_booking_admin',
          to: formData.email,
          customerEmail: formData.email,
          name: bookingInfo.name,
          service: service.title,
          date: selectedSlot.date,
          time: selectedSlot.start_time,
          phone: formData.phone,
          age: formData.age || null,
          experience: formData.experience || null,
          goals: goalsStr,
        }),
      }).catch(() => {})

      router.push('/book/success')
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, label: 'Termin' },
    { number: 2, label: 'Deine Daten' },
    { number: 3, label: 'Zusammenfassung' },
  ]

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container-max px-4 md:px-10 py-12">
          {/* Back */}
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zu den Angeboten
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-10 max-w-lg">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step > s.number ? 'bg-primary text-white' :
                  step === s.number ? 'bg-primary text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                </div>
                <span className={`text-sm hidden sm:block ${step === s.number ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px ${step > s.number ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
            {/* Main Content */}
            <div className="lg:col-span-2">

              {/* STEP 1: Calendar */}
              {step === 1 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">Termin auswählen</h2>
                  <AvailabilityCalendar
                    onSelectSlot={setSelectedSlot}
                    selectedSlot={selectedSlot}
                  />
                  <div className="mt-6">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={!selectedSlot}
                      onClick={() => setStep(2)}
                    >
                      Weiter
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Simplified Form */}
              {step === 2 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">Deine Daten</h2>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Vorname *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={e => updateForm('firstName', e.target.value)}
                          placeholder="Max"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nachname *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={e => updateForm('lastName', e.target.value)}
                          placeholder="Muster"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Age */}
                    <div>
                      <Label htmlFor="age">Alter (optional)</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={e => updateForm('age', e.target.value)}
                        placeholder="30"
                        className="mt-1"
                        min="10"
                        max="100"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <Label htmlFor="experience">Erfahrung</Label>
                      <Select value={formData.experience} onValueChange={v => updateForm('experience', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Anfänger">Anfänger</SelectItem>
                          <SelectItem value="Fortgeschritten">Fortgeschritten</SelectItem>
                          <SelectItem value="Profi">Profi</SelectItem>
                          <SelectItem value="Keine Angabe">Keine Angabe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Goals chips */}
                    <div>
                      <Label>Ziele (mehrere wählbar)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {GOAL_OPTIONS.map(goal => (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => toggleGoal(goal)}
                            className={[
                              'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                              selectedGoals.includes(goal)
                                ? 'bg-primary text-white border-primary'
                                : 'bg-secondary text-foreground border-border hover:border-primary/50',
                            ].join(' ')}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => updateForm('email', e.target.value)}
                        placeholder="max@beispiel.ch"
                        className="mt-1"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => updateForm('phone', e.target.value)}
                        placeholder="+41 79 123 45 67"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4" />
                      Zurück
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        const err = validateStep2()
                        if (err) { setError(err); return }
                        setError('')
                        setStep(3)
                      }}
                    >
                      Weiter
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Summary */}
              {step === 3 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">Zusammenfassung</h2>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-xl bg-secondary space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Termin</h3>
                      {selectedSlot && (
                        <p className="font-medium">
                          {format(new Date(selectedSlot.date), 'EEEE, dd. MMMM yyyy', { locale: de })} · {selectedSlot.start_time.slice(0, 5)} Uhr
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-secondary space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Angebot</h3>
                      <p className="font-medium">{service?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {service?.price === 0 ? 'Kostenlos' : service?.price && service.price >= 100 ? `CHF ${service.price}/Quartal` : `CHF ${service?.price}/h`} · {service?.duration_minutes} Minuten
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Deine Daten</h3>
                      <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                      <p className="text-sm text-muted-foreground">{formData.phone}</p>
                      {selectedGoals.length > 0 && (
                        <p className="text-sm text-muted-foreground">Ziele: {selectedGoals.join(', ')}</p>
                      )}
                    </div>

                    <div className="flex items-start gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Trainingsstandort</p>
                        <p className="text-sm text-muted-foreground">Oberer Heuelsteig 30, 8032 Zürich</p>
                      </div>
                    </div>

                    {service?.price === 0 && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary">
                        ✓ Dieser Termin ist komplett kostenlos und unverbindlich.
                      </div>
                    )}
                    {service?.price !== undefined && service.price > 0 && (
                      <div className="p-4 rounded-xl bg-muted text-sm text-muted-foreground">
                        Bezahlung erfolgt bequem per Twint nach dem Training.
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4" />
                      Zurück
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Verbindlich buchen
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {service && (
                <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
                  <h3 className="font-bold mb-3">{service.title}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-primary">
                      {service.price === 0 ? 'Gratis' : `CHF ${service.price}`}
                    </span>
                    {service.price > 0 && service.price < 100 && <span className="text-sm text-muted-foreground">/h</span>}
                    {service.price >= 100 && <span className="text-sm text-muted-foreground">/Quartal</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{service.duration_minutes} Minuten</p>
                  {selectedSlot && (
                    <div className="p-3 rounded-lg bg-primary/10 text-sm text-primary font-medium">
                      ✓ {selectedSlot.start_time.slice(0, 5)} Uhr ausgewählt
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
