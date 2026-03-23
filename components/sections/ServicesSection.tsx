'use client'

import { motion } from 'framer-motion'
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
    highlight: false,
  },
  {
    id: 'personal-training',
    badge: 'Beliebtestes Angebot',
    title: 'Personal Training 1:1',
    price: 'CHF 35',
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
    highlight: true,
    paymentNote: 'Bezahlung bequem per Twint nach dem Training',
  },
]

export default function ServicesSection() {
  return (
    <section className="section-padding bg-black" id="angebote">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Mein Angebot – Personal Training in Zürich
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Zwei klare Angebote, kein Kleingedrucktes. Starte einfach mit dem kostenlosen Termin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-3xl p-8 md:p-10 flex flex-col transition-all duration-500 hover:-translate-y-1 ${
                service.highlight
                  ? 'bg-white text-black hover:shadow-[0_32px_64px_-16px_hsl(0_0%_0%_/0.7)]'
                  : 'bg-[#111] border border-white/8 hover:border-white/16 hover:shadow-[0_24px_48px_-12px_hsl(0_0%_0%_/0.8)]'
              }`}
            >
              {/* Badge */}
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6 w-fit ${
                service.highlight
                  ? 'bg-black text-white'
                  : 'bg-white/8 border border-white/12 text-white/70'
              }`}>
                {service.badge}
              </div>

              {/* Title */}
              <h3 className={`text-xl font-semibold tracking-tight mb-2 ${service.highlight ? 'text-black' : 'text-white'}`}>
                {service.title}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-4xl font-semibold ${service.highlight ? 'text-black' : 'text-white'}`}>
                  {service.price}
                </span>
                <span className={`text-sm ${service.highlight ? 'text-black/50' : 'text-white/40'}`}>
                  {service.priceNote}
                </span>
              </div>
              <p className={`text-sm mb-4 ${service.highlight ? 'text-black/50' : 'text-white/40'}`}>
                Dauer: {service.duration}
              </p>

              {/* Description */}
              <p className={`text-sm leading-relaxed mb-6 ${service.highlight ? 'text-black/65' : 'text-white/55'}`}>
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${service.highlight ? 'text-black' : 'text-white/60'}`} />
                    <span className={`text-sm ${service.highlight ? 'text-black/75' : 'text-white/70'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Payment note */}
              {service.paymentNote && (
                <p className={`text-xs mb-4 ${service.highlight ? 'text-black/40' : 'text-white/30'}`}>
                  {service.paymentNote}
                </p>
              )}

              {/* CTA */}
              <Link
                href={`/book/${service.id}`}
                className={`inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-all duration-300 group gap-2 ${
                  service.highlight
                    ? 'bg-black text-white hover:bg-black/80 hover:scale-[1.02]'
                    : 'bg-white text-black hover:bg-white/90 hover:scale-[1.02]'
                }`}
              >
                {service.cta}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
