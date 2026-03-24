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

          {/* Content — DOM first so it's left on desktop; on mobile appears below image */}
          <div className="animate-slide-up md:order-1 order-2">
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

          {/* Profile image — on mobile appears first (top), on desktop goes to right column */}
          <div className="animate-slide-up md:order-2 order-1 flex justify-center">
            <div className="relative">
              {/* Round profile image placeholder — replace src with real photo when available */}
              <div
                className="w-64 h-64 md:w-72 md:h-72 rounded-full bg-[#181818] border-2 border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-[0_24px_64px_-12px_hsl(0_0%_0%_/0.9),0_0_0_1px_hsl(0_0%_100%_/0.06)]"
                role="img"
                aria-label="Martin – Personal Trainer in Zürich"
              >
                {/* Swap this div for <Image src="/personal-trainer-martin-zuerich.jpg" ... /> once the photo is ready */}
                <div className="w-24 h-24 rounded-full bg-white/6 flex items-center justify-center mb-3">
                  <Users className="w-12 h-12 text-white/25" />
                </div>
                <span className="text-xs text-white/20 font-medium px-4 text-center leading-snug">
                  Martin – Personal Trainer Zürich
                </span>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -right-3 bg-white text-black rounded-2xl px-4 py-3 shadow-[0_16px_48px_-8px_hsl(0_0%_0%_/0.8)]">
                <p className="text-xl font-semibold leading-none">5+</p>
                <p className="text-xs text-black/60 mt-0.5">Jahre<br/>Erfahrung</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
