'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <section className="section-padding bg-background" id="angebote">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Mein Angebot – Personal Training in Zürich
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Zwei klare Angebote, kein Kleingedrucktes. Starte einfach mit dem kostenlosen Termin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-3xl border p-8 md:p-10 flex flex-col group cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                service.highlight
                  ? 'bg-[hsl(0,0%,11%)] border-primary/20 text-white'
                  : 'bg-white border-black/5 shadow-sm'
              }`}
            >
              {/* Badge */}
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6 w-fit ${
                service.highlight
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {service.badge}
              </div>

              {/* Title */}
              <h3 className={`text-xl font-semibold tracking-tight mb-2 ${service.highlight ? 'text-white' : ''}`}>
                {service.title}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-4xl font-bold ${service.highlight ? 'text-primary' : 'text-foreground'}`}>
                  {service.price}
                </span>
                <span className={`text-sm ${service.highlight ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {service.priceNote}
                </span>
              </div>
              <p className={`text-sm mb-4 ${service.highlight ? 'text-white/60' : 'text-muted-foreground'}`}>
                Dauer: {service.duration}
              </p>

              {/* Description */}
              <p className={`text-sm leading-relaxed mb-6 ${service.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className={`text-sm ${service.highlight ? 'text-white/80' : 'text-foreground/80'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Payment note */}
              {service.paymentNote && (
                <p className="text-xs text-white/40 mb-4">{service.paymentNote}</p>
              )}

              {/* CTA */}
              <Link href={`/book/${service.id}`}>
                <Button
                  variant={service.highlight ? 'hero' : 'outline'}
                  size="lg"
                  className="w-full group"
                >
                  {service.cta}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
