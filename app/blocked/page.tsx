import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nur in der Schweiz verfügbar – Personal Training Zurich',
  description: 'Diese Website ist nur in der Schweiz verfügbar.',
  robots: { index: false, follow: false, nocache: true },
}

export default function BlockedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-md text-center space-y-8">
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
          Personal Training Zurich – by Martin
        </p>

        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            Diese Website ist nur in der Schweiz verfügbar.
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            This website is only available in Switzerland.
          </p>
        </div>

        <div className="pt-4">
          <span className="inline-block h-px w-12 bg-border" />
        </div>
      </div>
    </main>
  )
}
