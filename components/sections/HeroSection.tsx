'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-flame">
      {/* Orange gradient backdrop – bright top-left → deep flame bottom-right */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(125% 125% at 20% 6%, #ffc73a 0%, #ff9f16 30%, #ff7a0a 58%, #ff5100 82%, #f24500 100%)',
        }}
      />

      {/* Editorial meta frame */}
      <div className="pointer-events-none absolute inset-0 z-30 mx-auto flex max-w-[1600px] flex-col justify-between px-5 pb-6 pt-24 md:px-10 md:pt-28">
        <div className="flex items-start justify-between font-display text-[10px] font-bold uppercase tracking-[0.24em] text-black/70 md:text-[11px]">
          <span>(01) — Personal Training</span>
          <span className="hidden sm:block">Zürich · CH</span>
          <span>Est. Oberer Heuelsteig</span>
        </div>
        <div className="flex items-end justify-between font-display text-[10px] font-bold uppercase tracking-[0.24em] text-black/70 md:text-[11px]">
          <span>1:1 Coaching</span>
          <span className="hidden md:block">Muskelaufbau · Fettabbau · Kraft</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Big wordmark – sits BEHIND the athlete for the overlap / depth effect */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <h1
          className="animate-hero-word whitespace-nowrap select-none text-center font-display font-black uppercase leading-[0.82] text-white"
          style={{
            fontSize: 'clamp(2.4rem, 11.5vw, 11rem)',
            letterSpacing: '-0.02em',
          }}
        >
          Train with me
        </h1>
      </div>

      {/* Athlete – transparent cut-out, sits on the orange in front of the word */}
      <div className="animate-hero-athlete absolute inset-x-0 bottom-0 z-20 mx-auto flex h-full max-w-[1600px] items-end justify-center">
        <div className="relative h-[88%] w-full max-w-[500px] sm:h-[92%] md:h-[96%]">
          <div
            className="pointer-events-none absolute inset-x-[16%] bottom-[2%] h-[5%] rounded-[50%] blur-xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(90,35,0,0.4) 0%, transparent 70%)' }}
          />
          <Image
            src="/assets/images/Objekt 3.png"
            alt="Personal Trainer Martin – Training in Zürich"
            fill
            priority
            quality={92}
            sizes="(max-width: 768px) 88vw, 500px"
            className="object-contain object-bottom"
            style={{ filter: 'drop-shadow(0 30px 44px rgba(80,32,0,0.32))' }}
          />
        </div>
      </div>

      {/* CTA row */}
      <div className="animate-hero-cta absolute inset-x-0 bottom-14 z-40 flex justify-center px-4 md:bottom-16">
        <Link href="/book/probe-training" className="btn-dark h-14 gap-3">
          {t('hero.ctaPrimary')}
          <span aria-hidden className="text-flame">→</span>
        </Link>
      </div>
    </section>
  )
}
