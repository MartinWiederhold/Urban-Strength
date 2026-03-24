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
    price: 'CHF 75',
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
      'CHF 300 Ersparnis gegenüber Einzelbuchungen',
    ],
    cta: 'Jetzt Termin buchen',
    paymentNote: 'CHF 300 günstiger als 12 × CHF 75 Einzelbuchungen',
  },
]

export default function ServicesSection() {
  return (
    <section className="section-padding bg-black" id="angebote">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Mein Angebot – Personal Training in Zürich
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Drei klare Angebote, kein Kleingedrucktes. Starte einfach mit dem kostenlosen Termin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="relative rounded-3xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 bg-white text-black hover:shadow-[0_32px_64px_-16px_hsl(0_0%_0%_/0.7)]"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6 w-fit bg-black text-white">
                {service.badge}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold tracking-tight mb-2 text-black">
                {service.title}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-semibold text-black">{service.price}</span>
                <span className="text-sm text-black/50">{service.priceNote}</span>
              </div>
              <p className="text-sm mb-4 text-black/50">Dauer: {service.duration}</p>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-6 text-black/65">{service.description}</p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-black" />
                    <span className="text-sm text-black/75">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Payment note */}
              {service.paymentNote && (
                <p className="text-xs mb-4 text-black/40">{service.paymentNote}</p>
              )}

              {/* CTA */}
              <Link
                href={`/book/${service.id}`}
                className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-all duration-300 group gap-2 bg-black text-white hover:bg-black/80 hover:scale-[1.02]"
              >
                {service.cta}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
