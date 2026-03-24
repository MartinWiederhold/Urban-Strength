import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import ScrollToTop from '@/components/ScrollToTop'

export const metadata: Metadata = {
  metadataBase: new URL('https://personaltrainingbymartin.netlify.app'),
  title: 'Personal Training Zürich | Kostenloses Probetraining | by Martin',
  description: 'Dein Personal Trainer in Zürich. Individuelles 1:1 Training für Muskelaufbau, Fettabbau & Fitness. Erster Termin gratis! ✓ CHF 35/h ✓ Geräte-Einweisung ✓ Trainingsplan. Jetzt buchen!',
  keywords: [
    'Personal Training Zürich', 'Personal Trainer Zürich', 'Personaltraining Zürich',
    'Fitness Trainer Zürich', '1:1 Training Zürich', 'Probetraining Zürich gratis',
    'Muskelaufbau Zürich', 'Fettabbau Zürich', 'Gym Zürich', 'Trainingsplan Zürich',
  ],
  alternates: {
    canonical: 'https://personaltrainingbymartin.netlify.app',
    languages: {
      'de-CH': 'https://personaltrainingbymartin.netlify.app',
      'de': 'https://personaltrainingbymartin.netlify.app',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: 'https://personaltrainingbymartin.netlify.app',
    siteName: 'Personal Training Zurich – by Martin',
    title: 'Personal Training Zürich | Kostenloses Probetraining | by Martin',
    description: 'Dein Personal Trainer in Zürich. Individuelles 1:1 Training. Erster Termin gratis! Ab CHF 85/h.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Personal Training Zürich – by Martin' }],
  },
  icons: {
    icon: '/faviconXmartin.png',
    apple: '/faviconXmartin.png',
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de-CH">
      <head>
        <meta name="google-site-verification" content="PqjATptIERle8deiSP1NeBH7Uf5KaHOBBAwjAL7vaU0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  )
}
