'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[92svh] overflow-hidden">
      {/* Orange gradient backdrop – bright yellow top-left → deep orange bottom-right */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(120% 120% at 22% 8%, #ffd23a 0%, #ffb01f 26%, #ff9412 52%, #f5810f 74%, #e9720c 100%)',
        }}
      />

      {/* Big wordmark – sits BEHIND the athlete for the overlap / depth effect */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <h1
          className="animate-hero-word whitespace-nowrap select-none text-center font-display font-black uppercase leading-none text-white"
          style={{
            fontSize: 'clamp(2.6rem, 12.8vw, 12rem)',
            letterSpacing: '-0.03em',
            textShadow: '0 8px 40px rgba(120,55,0,0.18)',
          }}
        >
          Train with me
        </h1>
      </div>

      {/* Athlete – transparent cut-out, sits on the orange in front of the word */}
      <div className="animate-hero-athlete absolute inset-x-0 bottom-0 z-20 mx-auto flex h-full max-w-[1440px] items-end justify-center">
        <div className="relative h-[90%] w-full max-w-[520px] sm:h-[93%] md:h-[97%]">
          {/* soft contact shadow at the feet */}
          <div
            className="pointer-events-none absolute inset-x-[14%] bottom-[2%] h-[6%] rounded-[50%] blur-xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(120,55,0,0.38) 0%, transparent 70%)' }}
          />
          <Image
            src="/assets/images/Objekt 3.png"
            alt="Personal Trainer Martin – Training in Zürich"
            fill
            priority
            quality={92}
            sizes="(max-width: 768px) 90vw, 520px"
            className="object-contain object-bottom"
            style={{ filter: 'drop-shadow(0 24px 40px rgba(90,40,0,0.28))' }}
          />
        </div>
      </div>

      {/* Bottom fade into the black page + CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-b from-transparent to-black/25" />

      <div className="absolute inset-x-0 bottom-9 z-40 flex flex-col items-center gap-5 px-4 md:bottom-11">
        <Link
          href="/book/probe-training"
          className="animate-hero-cta inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-[15px] font-semibold text-white shadow-[0_16px_48px_-8px_rgba(90,40,0,0.45)] transition-all duration-300 hover:scale-[1.03] hover:bg-black/90 active:scale-[0.98]"
        >
          {t('hero.ctaPrimary')}
        </Link>

        <button
          onClick={() => document.getElementById('angebote')?.scrollIntoView({ behavior: 'smooth' })}
          className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/70 transition-colors hover:text-black md:text-[11px]"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-[2px]" />
        </button>
      </div>
    </section>
  )
}
