'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[88svh] md:min-h-[92svh] overflow-hidden bg-black">
      {/* Hero image + layered black treatment */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/berdet.png?v=3"
          alt="Personal Training – Gym und Training in Zürich"
          fill
          className="object-cover object-[center_14%] scale-[1.02]"
          sizes="100vw"
          priority
          quality={90}
        />
        {/* Base: vertical depth – darker footer zone for scroll affordance */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0.52) 72%, rgba(0,0,0,0.82) 100%)',
          }}
        />
        {/* Soft vignette – draws focus to center copy */}
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              'radial-gradient(ellipse 95% 75% at 50% 42%, transparent 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.75) 100%)',
          }}
        />
        {/* Thin top edge – header blend */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-28 bg-gradient-to-b from-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto flex min-h-[88svh] w-full max-w-[1440px] items-center px-2 pb-24 pt-28 md:min-h-[92svh] md:px-10 md:pt-32">
        <div className="w-full text-center">

          {/* Badge */}
          <div className="animate-slide-up mb-8 md:mb-10"
          >
            <span className="inline-block rounded-full border border-white/22 bg-white/8 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm md:px-5 md:py-2 md:text-xs">
              Zürich · Oberer Heuelsteig 30-34 · 8032 Zürich
            </span>
          </div>

          {/* H1 */}
          <div className="animate-slide-up mx-auto w-full max-w-none text-center"
          >
            <h1 className="mx-auto w-fit max-w-full px-0 text-[1.92rem] max-[430px]:text-[1.78rem] max-[375px]:text-[1.62rem] font-light leading-[1.08] max-[375px]:leading-[1.12] tracking-tight text-white md:text-[clamp(2.5rem,4.2vw,3.95rem)]">
              <span className="mx-auto block">Personal Training in Zürich –</span>
              <span className="mx-auto block">
                Dein Weg zu{' '}
                <span className="text-primary">echten Resultaten</span>
              </span>
            </h1>
          </div>

          {/* Subline */}
          <p className="animate-slide-up mt-6 text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed" style={{ animationDelay: '0.28s' }}
          >
            Individuelles 1:1 Training für Muskelaufbau, Fettabbau und mehr Fitness.
            Dein erster Termin ist gratis.
          </p>

          <div className="animate-slide-up mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center sm:items-stretch"
          >
            <Link
              href="/book/probe-training"
              className="inline-flex min-h-12 sm:min-h-14 h-auto py-3 sm:py-0 items-center justify-center rounded-full bg-primary px-5 sm:px-10 text-sm sm:text-[15px] font-semibold text-black text-center leading-snug hover:bg-white/90 hover:shadow-[0_16px_48px_-8px_hsl(0_0%_0%_/0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-[min(100%,19rem)] sm:w-auto"
            >
              Kostenloses Probetraining buchen
            </Link>
            <Link
              href="/#angebote"
              className="inline-flex h-12 sm:h-14 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/8 px-5 sm:px-10 text-sm sm:text-[15px] font-semibold text-white hover:bg-white/15 backdrop-blur-sm transition-all duration-300 w-[min(100%,19rem)] sm:w-auto"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                e.preventDefault()
                document.getElementById('angebote')?.scrollIntoView({ behavior: 'smooth' })
                window.history.pushState(null, '', '/#angebote')
              }}
            >
              Angebote ansehen
            </Link>
          </div>

        </div>
      </div>

      {/* Scroll Button */}
      <div
        className="absolute bottom-7 left-0 right-0 z-20 flex justify-center md:bottom-8"
      >
        <button
          onClick={() => {
            const el = document.getElementById('angebote')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm transition-colors duration-500 hover:bg-white/14 md:text-[11px]"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 text-white transition-transform duration-500 group-hover:translate-y-[2px]" />
        </button>
      </div>
    </section>
  )
}
