'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Admin] unhandled error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Etwas ist schiefgelaufen</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        {error.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
      </p>
      <Button onClick={reset} variant="outline">
        Erneut versuchen
      </Button>
    </div>
  )
}
