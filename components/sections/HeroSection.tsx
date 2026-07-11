'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Warm yellow → orange gradient (from the title artwork) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(125% 125% at 18% 8%, #ffc73a 0%, #ffab1f 32%, #ff9412 60%, #ff7a0a 84%, #f56b06 100%)',
        }}
      />

      <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-[1500px] items-center px-5 pb-16 pt-28 md:px-10 md:pt-32">
        <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12">

          {/* Left — copy */}
          <div className="order-2 text-left md:order-1">
            <span className="animate-hero-cta font-display text-[11px] font-bold uppercase tracking-[0.24em] text-black/70">
              (01) — Personal Training · Zürich
            </span>

            <h1
              className="animate-hero-word mt-5 font-display font-black uppercase leading-[0.9] tracking-[-0.02em] text-ink"
              style={{ fontSize: 'clamp(2.6rem, 6.4vw, 5.25rem)' }}
            >
              Train<br />with me
            </h1>

            <p className="animate-hero-cta mt-6 max-w-md text-[15px] leading-relaxed text-black/70 md:text-base">
              {t('hero.subtitle')}
            </p>

            <div className="animate-hero-cta mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book/probe-training" className="btn-dark h-14 gap-3">
                {t('hero.ctaPrimary')}
                <span aria-hidden className="text-flame">→</span>
              </Link>
              <Link
                href="/#angebote"
                className="inline-flex h-14 items-center rounded-full border border-black/25 px-7 text-[13px] font-bold uppercase tracking-[0.14em] text-ink transition-colors duration-300 hover:bg-black/[0.06]"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                  e.preventDefault()
                  document.getElementById('angebote')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Right — portrait in a circle. Full figure (nothing clipped), sized by
              height and right-aligned so his body edge sits toward the right; the
              photo's black background blends into the disc, so no seam shows. */}
          <div className="animate-hero-athlete order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative aspect-square w-[64vw] max-w-[24rem] overflow-hidden rounded-full bg-ink ring-1 ring-black/15 shadow-[0_30px_70px_-20px_rgba(90,40,0,0.45)] sm:w-[22rem]">
              <Image
                src="/assets/images/ChatGPT Image 11. Juli 2026, 21_51_45.png"
                alt="Martin – Personal Trainer in Zürich"
                width={892}
                height={1763}
                priority
                quality={92}
                className="pointer-events-none absolute top-1/2 right-[3%] h-[88%] w-auto max-w-none -translate-y-1/2 select-none"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
