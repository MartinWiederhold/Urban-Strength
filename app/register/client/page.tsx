'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

export default function RegisterClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    fitnessLevel: '',
    goals: '',
    healthConditions: '',
    howFoundUs: '',
    password: '',
    confirmPassword: '',
  })

  const updateForm = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const validate = () => {
    if (!formData.firstName.trim()) return 'Vorname ist erforderlich.'
    if (!formData.lastName.trim()) return 'Nachname ist erforderlich.'
    if (!formData.email.trim()) return 'E-Mail ist erforderlich.'
    if (!formData.phone.trim()) return 'Telefonnummer ist erforderlich.'
    if (!formData.password) return 'Passwort ist erforderlich.'
    if (formData.password.length < 8) return 'Passwort muss mindestens 8 Zeichen haben.'
    if (formData.password !== formData.confirmPassword) return 'Passwörter stimmen nicht überein.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: 'customer',
          },
        },
      })

      if (signUpError || !signUpData.user) {
        setError(signUpError?.message ?? 'Fehler beim Erstellen des Kontos.')
        setIsLoading(false)
        return
      }

      await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        email: formData.email,
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        fitness_goals: formData.goals || null,
        health_notes: formData.healthConditions || null,
        role: 'customer',
        customer_status: 'new',
      })

      router.push('/dashboard')
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="container-max px-4 md:px-10 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          <div className="max-w-xl">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Konto erstellen</h1>
              <p className="text-muted-foreground">
                Erstelle dein Kundenkonto, um Buchungen zu verwalten und Trainingspläne einzusehen.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input id="firstName" value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} placeholder="Max" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input id="lastName" value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} placeholder="Muster" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="max@beispiel.ch" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+41 79 123 45 67" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Alter</Label>
                  <Input id="age" type="number" value={formData.age} onChange={e => updateForm('age', e.target.value)} placeholder="30" className="mt-1" min="10" max="100" />
                </div>
                <div>
                  <Label htmlFor="gender">Geschlecht</Label>
                  <Select value={formData.gender} onValueChange={v => updateForm('gender', v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Männlich</SelectItem>
                      <SelectItem value="female">Weiblich</SelectItem>
                      <SelectItem value="other">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fitnessLevel">Fitnesslevel</Label>
                <Select value={formData.fitnessLevel} onValueChange={v => updateForm('fitnessLevel', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Anfänger (kein/wenig Training)</SelectItem>
                    <SelectItem value="intermediate">Fortgeschritten (1-2 Jahre)</SelectItem>
                    <SelectItem value="advanced">Erfahren (3+ Jahre)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goals">Ziele</Label>
                <Textarea id="goals" value={formData.goals} onChange={e => updateForm('goals', e.target.value)} placeholder="Was möchtest du erreichen? (z.B. Muskelaufbau, Fettabbau, mehr Energie)" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="healthConditions">Gesundheitliche Einschränkungen</Label>
                <Textarea id="healthConditions" value={formData.healthConditions} onChange={e => updateForm('healthConditions', e.target.value)} placeholder="Verletzungen, Erkrankungen oder sonstige Einschränkungen (optional)" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="howFoundUs">Wie hast du uns gefunden?</Label>
                <Select value={formData.howFoundUs} onValueChange={v => updateForm('howFoundUs', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="recommendation">Empfehlung</SelectItem>
                    <SelectItem value="other">Anderes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium mb-3">Passwort festlegen</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="password">Passwort * (min. 8 Zeichen)</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => updateForm('password', e.target.value)}
                        placeholder="Mind. 8 Zeichen"
                        className="pr-10"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => updateForm('confirmPassword', e.target.value)}
                      placeholder="Passwort wiederholen"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Konto erstellen
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Bereits ein Konto?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Anmelden
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
