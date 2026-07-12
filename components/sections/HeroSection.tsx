'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Golden-yellow → warm-orange gradient (matched to the reference artwork) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(120% 130% at 25% 14%, #FEC402 0%, #FDB400 26%, #FBA52A 52%, #F3901E 76%, #E87D1D 100%)',
        }}
      />

      {/* Centered wordmark — sits behind the athlete for the overlap effect */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <h1
          className="animate-hero-word whitespace-nowrap select-none text-center font-display font-black uppercase leading-[0.9] tracking-[-0.02em] text-white"
          style={{ fontSize: 'clamp(2.4rem, 12vw, 11.5rem)' }}
        >
          Train with me
        </h1>
      </div>

      {/* Athlete — transparent cut-out, centered, in front of the wordmark */}
      <div className="animate-hero-athlete absolute inset-x-0 bottom-0 z-20 mx-auto flex h-full max-w-[1500px] items-end justify-center">
        <div className="relative h-[90%] w-full max-w-[540px] sm:h-[93%] md:h-[97%]">
          <div
            className="pointer-events-none absolute inset-x-[16%] bottom-[2%] h-[5%] rounded-[50%] blur-xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(120,60,0,0.4) 0%, transparent 70%)' }}
          />
          <Image
            src="/assets/images/Objekt 3.png"
            alt="Personal Trainer – Training in Zürich"
            fill
            priority
            quality={92}
            sizes="(max-width: 768px) 90vw, 540px"
            className="object-contain object-bottom"
            style={{ filter: 'drop-shadow(0 30px 44px rgba(90,45,0,0.3))' }}
          />
        </div>
      </div>

      {/* CTA + scroll cue */}
      <div className="absolute inset-x-0 bottom-9 z-30 flex flex-col items-center gap-5 px-4 md:bottom-11">
        <Link href="/book/probe-training" className="btn-dark animate-hero-cta h-14 gap-3">
          {t('hero.ctaPrimary')}
          <span aria-hidden className="text-flame">→</span>
        </Link>
        <button
          onClick={() => document.getElementById('angebote')?.scrollIntoView({ behavior: 'smooth' })}
          className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/60 transition-colors hover:text-black/90 md:text-[11px]"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-[2px]" />
        </button>
      </div>
    </section>
  )
}
