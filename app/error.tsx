'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Etwas ist schiefgelaufen</h1>
        <p className="text-muted-foreground mb-8">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="hero" size="lg">
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">Zur Startseite</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
