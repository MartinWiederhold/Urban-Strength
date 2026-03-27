'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import dynamic from 'next/dynamic'

// Lazy-load: AvailabilityCalendar is ~40 kB of client logic + date-fns.
// Shown only in Step 1 — deferring keeps First Load JS lighter for all steps.
const AvailabilityCalendar = dynamic(
  () => import('@/components/booking/AvailabilityCalendar'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 w-8 bg-secondary rounded-lg animate-pulse" />
          <div className="h-5 w-36 bg-secondary rounded animate-pulse" />
          <div className="h-8 w-8 bg-secondary rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-secondary/60 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    ),
  }
)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Service, Availability } from '@/lib/types'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'

const SERVICE_SLUGS: Record<string, string> = {
  'probe-training': 'Kostenloser Start',
  'personal-training': 'Personal Training 1:1',
  'quartals-abo': 'Quartals-Abo',
}

const GOAL_KEYS = [
  'book.goalMuscle',
  'book.goalFat',
  'book.goalCardio',
  'book.goalStrength',
  'book.goalFlex',
  'book.goalHealth',
  'book.goalRehab',
  'book.goalFitness',
]

type Step = 1 | 2 | 3

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string
  const { lang, t } = useLanguage()

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
    if (!formData.firstName.trim()) return t('book.errFirstName')
    if (!formData.lastName.trim()) return t('book.errLastName')
    if (!formData.email.trim()) return t('book.errEmail')
    if (!formData.phone.trim()) return t('book.errPhone')
    return null
  }

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (!service || !selectedSlot) {
        setError(t('book.errNoSlot'))
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
        status: 'booked',
        age: formData.age ? parseInt(formData.age) : null,
        fitness_level: formData.experience || null,
        goals: goalsStr,
      })

      if (bookingError) {
        console.error('[Booking] Supabase insert error:', bookingError)
        setError(`${t('book.errBooking')}: ${bookingError.message}`)
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
      setError(t('book.errGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, label: t('book.step1') },
    { number: 2, label: t('book.step2') },
    { number: 3, label: t('book.step3') },
  ]

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container-max px-4 md:px-10 py-12">
          {/* Back */}
          <Link href="/#angebote" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('book.back')}
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-10 max-w-lg">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step > s.number ? 'bg-primary text-primary-foreground' :
                  step === s.number ? 'bg-primary text-primary-foreground' :
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
                  <h2 className="text-xl font-bold mb-6">{t('book.step1Title')}</h2>
                  <AvailabilityCalendar
                    onSelectSlot={setSelectedSlot}
                    selectedSlot={selectedSlot}
                    slotDurationMinutes={service?.duration_minutes ?? 60}
                  />
                  <div className="mt-6">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={!selectedSlot}
                      onClick={() => setStep(2)}
                    >
                      {t('book.next')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Simplified Form */}
              {step === 2 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">{t('book.step2Title')}</h2>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t('book.firstName')} *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={e => updateForm('firstName', e.target.value)}
                          placeholder="Max"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t('book.lastName')} *</Label>
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
                      <Label htmlFor="age">{t('book.age')}</Label>
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
                      <Label htmlFor="experience">{t('book.experience')}</Label>
                      <Select value={formData.experience} onValueChange={v => updateForm('experience', v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('book.experiencePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Anfänger">{t('book.expBeginner')}</SelectItem>
                          <SelectItem value="Fortgeschritten">{t('book.expIntermediate')}</SelectItem>
                          <SelectItem value="Profi">{t('book.expPro')}</SelectItem>
                          <SelectItem value="Keine Angabe">{t('book.expNoAnswer')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Goals chips */}
                    <div>
                      <Label>{t('book.goals')}</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {GOAL_KEYS.map(key => {
                          const label = t(key)
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => toggleGoal(label)}
                              className={[
                                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                                selectedGoals.includes(label)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-secondary text-foreground border-border hover:border-primary/50',
                              ].join(' ')}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">{t('book.email')} *</Label>
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
                      <Label htmlFor="phone">{t('book.phone')} *</Label>
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
                      {t('book.back2')}
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
                      {t('book.next')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Summary */}
              {step === 3 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">{t('book.step3Title')}</h2>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-xl bg-secondary space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('book.summaryAppointment')}</h3>
                      {selectedSlot && (
                        <p className="font-medium">
                          {format(new Date(selectedSlot.date), 'EEEE, dd. MMMM yyyy', { locale: lang === 'en' ? enUS : de })} · {selectedSlot.start_time.slice(0, 5)}{t('book.uhr') ? ` ${t('book.uhr')}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-secondary space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('book.summaryOffer')}</h3>
                      <p className="font-medium">{service?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {service?.price === 0 ? t('book.summaryFreeLabel') : service?.price && service.price >= 100 ? `CHF ${service.price}${t('book.summaryPerQuarter')}` : `CHF ${service?.price}${t('book.summaryPerHour')}`} · {service?.duration_minutes} {t('book.summaryTime')}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('book.summaryData')}</h3>
                      <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                      <p className="text-sm text-muted-foreground">{formData.phone}</p>
                      {selectedGoals.length > 0 && (
                        <p className="text-sm text-muted-foreground">{t('book.summaryGoals')}: {selectedGoals.join(', ')}</p>
                      )}
                    </div>

                    <div className="flex items-start gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{t('book.summaryLocation')}</p>
                        <p className="text-sm text-muted-foreground">Oberer Heuelsteig 30-34, 8032 Zürich</p>
                      </div>
                    </div>

                    {service?.price === 0 && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary">
                        {t('book.summaryFree')}
                      </div>
                    )}
                    {service?.price !== undefined && service.price > 0 && (
                      <div className="p-4 rounded-xl bg-muted text-sm text-muted-foreground">
                        {t('book.summaryPayment')}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4" />
                      {t('book.back2')}
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? t('book.submitting') : t('book.submit')}
                      {!isLoading && <Check className="w-4 h-4" />}
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
                      {service.price === 0 ? t('book.summaryFreeLabel') : `CHF ${service.price}`}
                    </span>
                    {service.price > 0 && service.price < 100 && <span className="text-sm text-muted-foreground">{t('book.summaryPerHour')}</span>}
                    {service.price >= 100 && <span className="text-sm text-muted-foreground">{t('book.summaryPerQuarter')}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{service.duration_minutes} {t('book.summaryTime')}</p>
                  {selectedSlot && (
                    <div className="p-3 rounded-lg bg-primary/10 text-sm text-primary font-medium">
                      ✓ {selectedSlot.start_time.slice(0, 5)}{t('book.uhr') ? ` ${t('book.uhr')}` : ''} {lang === 'de' ? 'ausgewählt' : 'selected'}
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
