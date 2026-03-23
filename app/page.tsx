import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import HeroSection from '@/components/sections/HeroSection'
import ProblemsSection from '@/components/sections/ProblemsSection'
import ServicesSection from '@/components/sections/ServicesSection'
import ResultsSection from '@/components/sections/ResultsSection'
import AboutSection from '@/components/sections/AboutSection'
import MethodSection from '@/components/sections/MethodSection'
import GallerySection from '@/components/sections/GallerySection'
import MapSection from '@/components/sections/MapSection'
import FAQSection from '@/components/sections/FAQSection'
import CTASection from '@/components/sections/CTASection'

export const metadata: Metadata = {
  title: 'Personal Training Zürich | Kostenloses Probetraining | by Martin',
  description: 'Dein Personal Trainer in Zürich. Individuelles 1:1 Training für Muskelaufbau, Fettabbau & Fitness. Erster Termin gratis! ✓ CHF 35/h ✓ Geräte-Einweisung ✓ Trainingsplan. Jetzt buchen!',
  keywords: [
    'Personal Training Zürich', 'Personal Trainer Zürich', 'Personaltraining Zürich',
    'Fitness Trainer Zürich', '1:1 Training Zürich', 'Probetraining Zürich gratis',
    'Muskelaufbau Zürich', 'Fettabbau Zürich', 'Gym Zürich', 'Trainingsplan Zürich',
    'Personal Training Zürich Preise', 'Geräte-Einweisung Zürich',
  ],
  alternates: {
    canonical: 'https://personaltraining-zurich.ch',
    languages: { 'de-CH': 'https://personaltraining-zurich.ch', 'de': 'https://personaltraining-zurich.ch' },
  },
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: 'https://personaltraining-zurich.ch',
    siteName: 'Personal Training Zurich – by Martin',
    title: 'Personal Training Zürich | Kostenloses Probetraining | by Martin',
    description: 'Dein Personal Trainer in Zürich. Individuelles 1:1 Training. Erster Termin gratis! Ab CHF 35/h.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Personal Training Zürich – by Martin' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

// JSON-LD Structured Data
const jsonLdLocalBusiness = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  '@id': 'https://personaltraining-zurich.ch/#business',
  name: 'Personal Training Zurich – by Martin',
  alternateName: ['Personal Training Zürich', 'PT Zurich by Martin'],
  description: 'Professionelles Personal Training in Zürich. Individuelles 1:1 Training für Muskelaufbau, Fettabbau und Fitness. Kostenlose Geräte-Einweisung und Probetraining.',
  url: 'https://personaltraining-zurich.ch',
  image: 'https://personaltraining-zurich.ch/og-image.jpg',
  priceRange: 'CHF 0-35',
  currenciesAccepted: 'CHF',
  paymentAccepted: 'Twint',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Oberer Heuelsteig 30',
    addressLocality: 'Zürich',
    addressRegion: 'ZH',
    postalCode: '8032',
    addressCountry: 'CH',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 47.3580, longitude: 8.5555 },
  areaServed: [
    { '@type': 'City', name: 'Zürich', sameAs: 'https://en.wikipedia.org/wiki/Z%C3%BCrich' },
    { '@type': 'State', name: 'Kanton Zürich' },
  ],
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '07:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '18:00' },
  ],
  founder: { '@type': 'Person', name: 'Martin Wiederhold', jobTitle: 'Personal Trainer' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Personal Training Angebote',
    itemListElement: [
      { '@type': 'Offer', name: 'Kostenlose Geräte-Einweisung & Probetraining', price: '0', priceCurrency: 'CHF' },
      { '@type': 'Offer', name: 'Personal Training 1:1', price: '35', priceCurrency: 'CHF' },
    ],
  },
}

const jsonLdPerson = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Martin Wiederhold',
  jobTitle: 'Personal Trainer',
  description: 'Zertifizierter Personal Trainer in Zürich. Spezialisiert auf individuelles 1:1 Training, Muskelaufbau und Fettabbau.',
  url: 'https://personaltraining-zurich.ch/about',
  knowsAbout: ['Personal Training','Muskelaufbau','Fettabbau','Fitness','Ernährungsberatung','Krafttraining'],
}

const jsonLdFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Brauche ich Vorerfahrung für das Personal Training?', acceptedAnswer: { '@type': 'Answer', text: 'Nein, überhaupt nicht. Egal ob du Anfänger bist oder schon Erfahrung hast – ich passe das Training individuell an dein Level an.' } },
    { '@type': 'Question', name: 'Wo findet das Personal Training in Zürich statt?', acceptedAnswer: { '@type': 'Answer', text: 'Das Training findet im Gym am Oberer Heuelsteig 30, 8032 Zürich statt.' } },
    { '@type': 'Question', name: 'Wie läuft das kostenlose Probetraining ab?', acceptedAnswer: { '@type': 'Answer', text: 'Du buchst online einen Termin, wir treffen uns im Gym, ich zeige dir die Geräte, wir besprechen deine Ziele und machen eine erste Trainingseinheit zusammen. Komplett gratis und unverbindlich.' } },
    { '@type': 'Question', name: 'Was kostet Personal Training in Zürich?', acceptedAnswer: { '@type': 'Answer', text: 'Das Personal Training 1:1 kostet CHF 35 pro Stunde. Der erste Termin – Geräte-Einweisung und Probetraining – ist komplett kostenlos.' } },
    { '@type': 'Question', name: 'Wie bezahle ich das Personal Training?', acceptedAnswer: { '@type': 'Answer', text: 'Die Bezahlung erfolgt bequem per Twint nach dem Training. Keine Vorauszahlung nötig.' } },
    { '@type': 'Question', name: 'Wie oft sollte ich Personal Training in Zürich machen?', acceptedAnswer: { '@type': 'Answer', text: 'Für optimale Resultate empfehle ich 2–3 Einheiten pro Woche. Auch einmal pro Woche bringt schon deutliche Fortschritte.' } },
    { '@type': 'Question', name: 'Kann ich einen Termin absagen oder verschieben?', acceptedAnswer: { '@type': 'Answer', text: 'Ja, über dein persönliches Dashboard kannst du Termine jederzeit verwalten. Bitte sage mindestens 24 Stunden vorher ab.' } },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
      <Navigation />
      <main>
        <HeroSection />
        <ProblemsSection />
        <ServicesSection />
        <ResultsSection />
        <AboutSection />
        <MethodSection />
        <GallerySection />
        <MapSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
