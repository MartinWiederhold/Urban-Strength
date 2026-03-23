'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, Play } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[88svh] md:min-h-[92svh] overflow-hidden bg-[hsl(0,0%,11%)]">
      {/* Video Placeholder Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/38 via-black/42 to-black/52" />
        {/* Video placeholder UI */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-24 h-24 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-110">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </div>
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, hsl(140 26% 39% / 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 40%, hsl(0 0% 5% / 0.8) 0%, transparent 60%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto flex min-h-[88svh] w-full max-w-[1440px] items-center px-2 pb-24 pt-28 md:min-h-[92svh] md:px-10 md:pt-32">
        <div className="w-full text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 md:mb-10"
          >
            <span className="inline-block rounded-full border border-white/22 bg-white/8 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm md:px-5 md:py-2 md:text-xs">
              Zürich · Oberer Heuelsteig 30 · Erster Termin gratis
            </span>
          </motion.div>

          {/* H1 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-none text-center"
          >
            <h1 className="mx-auto w-fit max-w-full px-0 text-[1.92rem] max-[430px]:text-[1.78rem] max-[375px]:text-[1.62rem] font-light leading-[1.08] max-[375px]:leading-[1.12] tracking-tight text-white md:text-[clamp(2.5rem,4.2vw,3.95rem)]">
              <span className="mx-auto block">Personal Training in Zürich –</span>
              <span className="mx-auto block">
                Dein Weg zu{' '}
                <span className="text-primary">echten Resultaten</span>
              </span>
            </h1>
          </motion.div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed"
          >
            Individuelles 1:1 Training für Muskelaufbau, Fettabbau und mehr Fitness.
            Dein erster Termin ist gratis.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/book/probe-training"
              className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-[15px] font-semibold text-white hover:bg-[hsl(140,26%,45%)] hover:shadow-[0_16px_48px_-8px_hsl(0_0%_0%_/0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
            >
              Kostenloses Probetraining buchen
            </Link>
            <Link
              href="/services"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 bg-white/8 px-10 text-[15px] font-semibold text-white hover:bg-white/15 backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
            >
              Angebote ansehen
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Scroll Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-7 left-0 right-0 z-20 flex justify-center md:bottom-8"
      >
        <button
          onClick={() => {
            const el = document.getElementById('probleme')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm transition-colors duration-500 hover:bg-white/14 md:text-[11px]"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 text-white transition-transform duration-500 group-hover:translate-y-[2px]" />
        </button>
      </motion.div>
    </section>
  )
}
