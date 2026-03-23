'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Ungültige E-Mail oder Passwort. Bitte versuche es erneut.')
        return
      }
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
        router.refresh()
      }
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (error) {
        setError('Fehler beim Senden der E-Mail. Bitte prüfe deine E-Mail-Adresse.')
      } else {
        setForgotSent(true)
      }
    } catch {
      setError('Ein Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border rounded-2xl p-8 shadow-card"
        >
          {/* Logo */}
          <div className="mb-8">
            <p className="text-lg font-bold tracking-tight">Personal Training Zurich</p>
            <p className="text-sm text-muted-foreground">by Martin</p>
          </div>

          {forgotMode ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Passwort zurücksetzen</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen.
              </p>

              {forgotSent ? (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-primary">
                  ✓ E-Mail wurde gesendet! Prüfe deinen Posteingang.
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.ch"
                      required
                      className="mt-1"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Link senden
                  </Button>
                </form>
              )}

              <button
                onClick={() => { setForgotMode(false); setForgotSent(false); setError('') }}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Zurück zum Login
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Willkommen zurück</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Logge dich ein, um deine Buchungen zu verwalten.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.ch"
                    required
                    autoComplete="email"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Passwort</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Dein Passwort"
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
                )}

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Einloggen
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => { setForgotMode(true); setError('') }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Passwort vergessen?
                </button>
                <Link href="/book/probe-training" className="text-primary hover:underline">
                  Konto erstellen
                </Link>
              </div>
            </>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Noch kein Konto?{' '}
          <Link href="/book/probe-training" className="text-primary hover:underline">
            Kostenloses Probetraining buchen
          </Link>
        </p>
      </div>
    </div>
  )
}
