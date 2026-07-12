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

      {/* Desktop portrait — large black disc that runs off the right edge.
          The photo's black background blends into the disc; his body bleeds
          toward the right, his face stays visible on the left of the disc. */}
      <div className="animate-hero-athlete pointer-events-none absolute inset-y-0 right-0 z-10 hidden md:block">
        <div className="absolute right-0 top-1/2 aspect-square h-[84vh] max-h-[880px] -translate-y-1/2 translate-x-[24%] overflow-hidden rounded-full bg-ink">
          <Image
            src="/assets/images/ChatGPT Image 11. Juli 2026, 21_51_45.png"
            alt="Martin – Personal Trainer in Zürich"
            fill
            priority
            quality={92}
            sizes="60vw"
            className="object-cover object-[46%_16%]"
          />
        </div>
      </div>

      <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-[1500px] items-center px-5 pb-16 pt-28 md:px-10 md:pt-32">
        <div className="flex w-full flex-col items-start gap-10 md:max-w-[54%] md:gap-0">

          {/* Mobile portrait */}
          <div className="animate-hero-athlete order-1 mx-auto w-[62vw] max-w-[20rem] md:hidden">
            <div className="relative aspect-square overflow-hidden rounded-full bg-ink ring-1 ring-black/15">
              <Image
                src="/assets/images/ChatGPT Image 11. Juli 2026, 21_51_45.png"
                alt="Martin – Personal Trainer in Zürich"
                fill
                priority
                quality={92}
                sizes="62vw"
                className="object-cover object-[46%_14%]"
              />
            </div>
          </div>

          {/* Copy */}
          <div className="order-2 text-left">
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

        </div>
      </div>
    </section>
  )
}
