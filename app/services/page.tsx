import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ServicesSection from '@/components/sections/ServicesSection'
import CTASection from '@/components/sections/CTASection'

export const metadata: Metadata = {
  title: 'Personal Training Angebote Zürich | Probetraining & 1:1 Training',
  description: 'Kostenlose Geräte-Einweisung & Probetraining sowie Personal Training 1:1 für CHF 35/h. Dein Personal Trainer in Zürich – Martin. Jetzt buchen!',
  alternates: { canonical: 'https://personaltraining-zurich.ch/services' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://personaltraining-zurich.ch' },
    { '@type': 'ListItem', position: 2, name: 'Angebote', item: 'https://personaltraining-zurich.ch/services' },
  ],
}

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <main className="pt-20">
        <div className="section-padding bg-secondary/30 text-center">
          <div className="container-max">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Angebote – Personal Training in Zürich
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Klar, fair, ohne Kleingedrucktes. Starte mit dem kostenlosen Probetraining.
            </p>
          </div>
        </div>
        <ServicesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
