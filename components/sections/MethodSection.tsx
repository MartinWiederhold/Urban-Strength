'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CalendarCheck, ClipboardList, Trophy } from 'lucide-react'

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
    <section className="section-padding bg-black">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            In 3 Schritten zum Ziel
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            So einfach funktioniert das Personal Training mit mir in Zürich.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+1rem)] w-8 h-px bg-white/10" />
              )}

              <div className="flex flex-col items-start">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-semibold text-white/8 tracking-tight">{step.number}</span>
                  <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-white/60" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.description}</p>
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
          <Link
            href="/book/probe-training"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-[15px] font-semibold text-black hover:bg-white/90 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            Jetzt Schritt 1 starten – Kostenlos
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
