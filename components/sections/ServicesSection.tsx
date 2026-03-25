'use client'

import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'

const services = [
  {
    id: 'probe-training',
    badge: 'Kostenlos & Unverbindlich',
    title: 'Kostenloser Start – Geräte-Einweisung & Probetraining',
    price: 'CHF 0',
    priceNote: 'Komplett gratis',
    duration: 'ca. 60 Minuten',
    description: 'Dein erster Termin ist komplett gratis. Lerne das Gym kennen, lerne mich kennen, und starte mit deiner ersten Trainingseinheit.',
    features: [
      'Einführung in die wichtigsten Geräte',
      'Korrekte Übungsausführung (Verletzungen vermeiden)',
      'Individuelle Beratung zu deinen Zielen',
      'Erste Trainingseinheit mit Anleitung',
      'Tipps für einen sicheren Start',
    ],
    cta: 'Jetzt Termin buchen',
    paymentNote: null,
  },
  {
    id: 'personal-training',
    badge: 'Beliebtestes Angebot',
    title: 'Personal Training 1:1',
    price: 'CHF 85',
    priceNote: 'pro Stunde',
    duration: '60 Minuten',
    description: 'Individuelles Training, das auf dich zugeschnitten ist. Maximale Resultate durch persönliche Betreuung und einen Plan, der wirklich funktioniert.',
    features: [
      'Individuell auf dich abgestimmtes Training',
      'Persönliche Betreuung (keine Fehler, maximale Effizienz)',
      'Motivation & Push im Training',
      'Fortschritts-Tracking',
      'Anpassung deines Trainingsplans',
      'Optional: Ernährungstipps & Trainingsplan',
    ],
    cta: 'Jetzt Termin buchen',
    paymentNote: 'Bezahlung bequem per Twint nach dem Training',
  },
  {
    id: 'quartals-abo',
    badge: 'Bestes Preis-Leistungs-Verhältnis',
    title: 'Quartals-Abo – Personal Training',
    price: 'CHF 600',
    priceNote: 'pro Quartal',
    duration: '4 × 60 Min. / Monat',
    description: 'Dein regelmässiges Training zum Vorteilspreis. 4 Sessions à 60 Minuten pro Monat, frei wählbar – persönlich betreut wie beim 1:1 Training.',
    features: [
      '4 Sessions pro Monat (frei wählbar)',
      'Persönliche 1:1 Betreuung',
      'Trainingsplan inklusive',
      'Ernährungstipps inklusive',
      'Fortschritts-Tracking',
      'Priorität bei Terminvergabe',
      'CHF 420 Ersparnis gegenüber Einzelbuchungen (12 × 85 = 1020)',
    ],
    cta: 'Jetzt Termin buchen',
    paymentNote: 'CHF 420 günstiger als 12 × CHF 85 Einzelbuchungen',
    /** Hervorhebung wie gelber Map-Pin (#FBBF24 = MapSection-Marker) */
    highlight: true,
  },
]

export default function ServicesSection() {
  return (
    <section className="section-padding bg-black scroll-mt-[4.75rem] md:scroll-mt-[5rem]" id="angebote">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Mein Angebot – Personal Training in Zürich
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Drei klare Angebote, kein Kleingedrucktes. Starte einfach mit dem kostenlosen Termin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto md:items-stretch">
          {services.map((service) => {
            const featured = 'highlight' in service && service.highlight
            return (
            <div
              key={service.id}
              id={service.id}
              className={`relative scroll-mt-[5.5rem] md:scroll-mt-[6rem] rounded-3xl p-8 flex flex-col transition-all duration-500 bg-white text-black ${
                featured
                  ? 'z-[1] ring-2 ring-amber-400 ring-offset-2 ring-offset-black shadow-[0_20px_50px_-12px_rgba(251,191,36,0.45)] hover:-translate-y-1 hover:shadow-[0_28px_56px_-10px_rgba(251,191,36,0.55)] md:scale-[1.02] md:z-[2]'
                  : 'hover:-translate-y-1 hover:shadow-[0_32px_64px_-16px_hsl(0_0%_0%_/0.7)]'
              }`}
            >
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6 w-fit ${
                  featured ? 'bg-amber-400 text-black' : 'bg-black text-white'
                }`}
              >
                {service.badge}
              </div>

              <h3 className="text-xl font-semibold tracking-tight mb-2 text-black">
                {service.title}
              </h3>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-semibold text-black">{service.price}</span>
                <span className="text-sm text-black/50">{service.priceNote}</span>
              </div>
              <p className="text-sm mb-4 text-black/50">Dauer: {service.duration}</p>

              <p className="text-sm leading-relaxed mb-6 text-black/65">{service.description}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${featured ? 'text-amber-600' : 'text-black'}`} />
                    <span className="text-sm text-black/75">{feature}</span>
                  </li>
                ))}
              </ul>

              {service.paymentNote && (
                <p className="text-xs mb-4 text-black/40">{service.paymentNote}</p>
              )}

              <Link
                href={`/book/${service.id}`}
                className={`inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-all duration-300 group gap-2 hover:scale-[1.02] ${
                  featured
                    ? 'bg-amber-400 text-black hover:bg-amber-300'
                    : 'bg-black text-white hover:bg-black/80'
                }`}
              >
                {service.cta}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
