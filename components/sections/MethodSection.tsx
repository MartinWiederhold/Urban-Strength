'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CalendarCheck, ClipboardList, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    number: '01',
    icon: CalendarCheck,
    title: 'Kostenloses Probetraining buchen',
    description: 'Lerne mich und das Gym kennen. Wir besprechen deine Ziele und machen eine erste Trainingseinheit. Komplett unverbindlich und kostenlos.',
  },
  {
    number: '02',
    icon: ClipboardList,
    title: 'Persönlicher Trainingsplan',
    description: 'Ich erstelle dir einen individuellen Trainingsplan, der auf deine Ziele, dein Level und deinen Alltag zugeschnitten ist.',
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Gemeinsam Ziele erreichen',
    description: 'Mit regelmässigem Training, meiner Unterstützung und gezieltem Fortschritts-Tracking erreichst du dein Ziel.',
  },
]

export default function MethodSection() {
  return (
    <section className="section-padding bg-[hsl(0,0%,11%)] text-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            In 3 Schritten zum Ziel
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            So einfach funktioniert das Personal Training mit mir in Zürich.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Connector Line (Desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+1rem)] w-8 h-px bg-white/20" />
              )}

              <div className="flex flex-col items-start">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold text-white/10 tracking-tighter">{step.number}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <Link href="/book/probe-training">
            <Button variant="hero" size="xl">
              Jetzt Schritt 1 starten – Kostenlos
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
