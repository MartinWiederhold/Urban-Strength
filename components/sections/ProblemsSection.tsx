'use client'

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
    <section className="section-padding bg-[#080808]" id="probleme">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Kommt dir das bekannt vor?
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Viele meiner Kunden hatten genau diese Erfahrungen, bevor wir zusammen angefangen haben.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {problems.map((problem, i) => (
            <div className="animate-slide-up rounded-3xl bg-[#111] border border-white/8 p-8 hover:border-white/16 hover:bg-[#141414] transition-all duration-300"
            >
              <problem.icon className="w-7 h-7 text-white/50 mb-4" />
              <p className="text-white/80 text-base leading-relaxed">{problem.text}</p>
            </div>
          ))}
        </div>

        <div className="animate-slide-up text-center max-w-2xl mx-auto"
        >
          <p className="text-lg text-white/55 leading-relaxed">
            Genau dafür bin ich da. Als dein{' '}
            <span className="text-white font-semibold">Personal Trainer in Zürich</span>{' '}
            helfe ich dir, deine Ziele zu erreichen – mit einem Plan, der zu dir passt.
          </p>
        </div>
      </div>
    </section>
  )
}
