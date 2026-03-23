'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Target, Zap } from 'lucide-react'

const problems = [
  {
    icon: AlertCircle,
    text: 'Du trainierst regelmässig, aber siehst keine Resultate',
  },
  {
    icon: Target,
    text: 'Du bist unsicher bei der Übungsausführung und hast Angst vor Verletzungen',
  },
  {
    icon: Zap,
    text: 'Dir fehlt die Motivation und Struktur, um dranzubleiben',
  },
]

export default function ProblemsSection() {
  return (
    <section className="section-padding bg-[hsl(0,0%,11%)] text-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Kommt dir das bekannt vor?
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Viele meiner Kunden hatten genau diese Erfahrungen, bevor wir zusammen angefangen haben.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/8 border border-white/10 rounded-3xl p-8 hover:bg-white/12 transition-all duration-300 hover:-translate-y-0.5"
            >
              <problem.icon className="w-8 h-8 text-primary mb-4" />
              <p className="text-white/80 text-base leading-relaxed">{problem.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-lg text-white/70 leading-relaxed">
            Genau dafür bin ich da. Als dein{' '}
            <span className="text-primary font-semibold">Personal Trainer in Zürich</span>{' '}
            helfe ich dir, deine Ziele zu erreichen – mit einem Plan, der zu dir passt.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
