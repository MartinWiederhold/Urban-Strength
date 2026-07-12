'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#F6A527]">
      {/* Full-bleed hero artwork (athlete on the golden-orange gradient) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/hero-person.png"
          alt="Personal Training Zürich – Athletin"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Wordmark — laid ON TOP of the image */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <h1
          className="animate-hero-word whitespace-nowrap select-none text-center font-display font-black uppercase leading-[0.9] tracking-[-0.02em] text-white"
          style={{
            fontSize: 'clamp(1.9rem, 8.4vw, 7.5rem)',
            textShadow: '0 6px 34px rgba(120,55,0,0.28)',
          }}
        >
          Train with me
        </h1>
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
