import type { Metadata } from 'next'
import { Outfit, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ScrollToTop from '@/components/ScrollToTop'
import { WebVitals } from '@/components/WebVitals'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-outfit',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://personaltrainingbymartin.netlify.app'),
  title: 'Personal Training Zürich | Kostenloses Probetraining | by Martin',
  description: 'Dein Personal Trainer in Zürich. Individuelles 1:1 Training für Muskelaufbau, Fettabbau & Fitness. Erster Termin gratis! ✓ CHF 85/h ✓ Geräte-Einweisung ✓ Trainingsplan. Jetzt buchen!',
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
    images: [
      {
        url: '/og-image.jpg',
        width: 1536,
        height: 1024,
        alt: 'Personal Training Zürich – by Martin',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/faviconXmartin.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    shortcut: '/favicon.ico',
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
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
    <html lang="de-CH" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <meta name="google-site-verification" content="PqjATptIERle8deiSP1NeBH7Uf5KaHOBBAwjAL7vaU0" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <WebVitals />
            {children}
            <ScrollToTop />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
