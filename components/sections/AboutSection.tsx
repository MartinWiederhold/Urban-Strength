'use client'

import Link from 'next/link'
import { Award, Users, Clock, ChevronRight } from 'lucide-react'

const stats = [
  { icon: Award, value: '5+', label: 'Jahre Erfahrung' },
  { icon: Users, value: '100+', label: 'Kunden trainiert' },
  { icon: Clock, value: '1000+', label: 'Trainingsstunden' },
]

export default function AboutSection() {
  return (
    <section className="section-padding bg-[#080808]" id="ueber-martin">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="animate-slide-up relative">
            <div className="aspect-[3/4] rounded-3xl bg-[#111] border border-white/8 overflow-hidden relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-2">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <Users className="w-10 h-10" />
                </div>
                <span className="text-sm">Martin – Personal Trainer Zürich</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white text-black rounded-2xl p-4 shadow-[0_16px_48px_-8px_hsl(0_0%_0%_/0.8)]">
              <p className="text-2xl font-semibold">5+</p>
              <p className="text-xs text-black/60">Jahre<br/>Erfahrung</p>
            </div>
          </div>

          {/* Content */}
          <div className="animate-slide-up"
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6 text-white">
              Dein Personal Trainer in Zürich – Martin
            </h2>
            <p className="text-white/55 leading-relaxed mb-4">
              Als zertifizierter Personal Trainer helfe ich dir, deine Fitnessziele zu erreichen – egal ob Muskelaufbau, Fettabbau oder allgemeine Fitness. Mein Ansatz ist einfach: individuell, effizient und nachhaltig.
            </p>
            <p className="text-white/55 leading-relaxed mb-8">
              Ich trainiere im Gym am Oberer Heuelsteig 30 in Zürich. Mit mir bekommst du keine Standard-Programme – sondern ein Training, das wirklich zu dir und deinen Zielen passt.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-[#111] border border-white/8">
                  <stat.icon className="w-5 h-5 text-white/50 mx-auto mb-2" />
                  <p className="text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex h-12 items-center rounded-full border border-white/20 px-8 text-sm font-semibold text-white hover:bg-white/8 hover:border-white/40 transition-all duration-300 gap-2 group"
            >
              Mehr über Martin erfahren
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
