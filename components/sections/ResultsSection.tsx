'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const results = [
  {
    name: 'Marco, 28',
    goal: 'Muskelaufbau',
    result: '-8 kg Fett, +6 kg Muskeln',
    duration: 'In 4 Monaten',
    quote: 'Ich hatte keine Ahnung wie Krafttraining wirklich funktioniert. Martin hat mir alles erklärt und ich sehe jetzt endlich Resultate.',
  },
  {
    name: 'Lisa, 34',
    goal: 'Fettabbau & Fitness',
    result: '-12 kg',
    duration: 'In 5 Monaten',
    quote: 'Das Personal Training war die beste Investition für meine Gesundheit. Die individuelle Betreuung macht den riesigen Unterschied.',
  },
  {
    name: 'Thomas, 42',
    goal: 'Allgemeine Fitness',
    result: 'Rückenschmerzen weg',
    duration: 'Nach 8 Wochen',
    quote: 'Durch das gezielte Training sind meine chronischen Rückenschmerzen verschwunden. Hätte ich nicht für möglich gehalten.',
  },
]

export default function ResultsSection() {
  return (
    <section className="section-padding bg-black" id="resultate">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Echte Resultate meiner Kunden in Zürich
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Keine Hochglanz-Versprechen, echte Ergebnisse. Das können auch deine Resultate sein.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl bg-[#111] border border-white/8 p-6 hover:border-white/16 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Before/After */}
              <div className="flex gap-2 mb-5">
                <div className="flex-1 h-28 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-xs text-white/25 font-medium">
                  Vorher
                </div>
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1 h-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50 font-medium">
                  Nachher
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-white tracking-tight">{result.name}</p>
                  <p className="text-sm text-white/40">{result.goal}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white text-sm">{result.result}</p>
                  <p className="text-xs text-white/35">{result.duration}</p>
                </div>
              </div>

              <p className="text-sm text-white/50 leading-relaxed italic">
                &ldquo;{result.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
