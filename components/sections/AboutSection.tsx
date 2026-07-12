'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Award, Target, Sparkles, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AboutSection() {
  const { t } = useLanguage()

  const highlights = [
    { icon: Award, titleKey: 'about.highlight1Title', subtitleKey: 'about.highlight1Sub' },
    { icon: Target, titleKey: 'about.highlight2Title', subtitleKey: 'about.highlight2Sub' },
    { icon: Sparkles, titleKey: 'about.highlight3Title', subtitleKey: 'about.highlight3Sub' },
  ]

  return (
    <section className="section-padding bg-paper" id="ueber-martin">
      <div className="container-max">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">

          {/* Text */}
          <div className="animate-slide-up order-2 min-w-0 md:order-1">
            <h2 className="mb-6 font-display text-[1.9rem] sm:text-4xl md:text-[3rem] font-black uppercase leading-[0.98] tracking-[-0.02em] text-ink text-balance">
              {t('about.titleShort')}
            </h2>
            <p className="max-w-xl leading-relaxed text-ink/60">
              {t('about.bio')}
            </p>

            {/* Highlights */}
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-ink/15 pt-8 sm:grid-cols-3">
              {highlights.map((item, i) => (
                <div key={i} className="flex flex-col items-start">
                  <item.icon className="mb-3 h-5 w-5 shrink-0 text-flame" />
                  <p className="font-display text-sm font-bold uppercase leading-snug tracking-wide text-ink">
                    {t(item.titleKey)}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-ink/50">{t(item.subtitleKey)}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link href="/book/probe-training" className="btn-dark group h-14 gap-2">
                {t('about.cta')}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Portrait — full figure inside the disc (photo bg blends with the disc) */}
          <div className="animate-slide-up order-1 flex justify-center md:order-2">
            <div className="relative aspect-square w-72 overflow-hidden rounded-full bg-ink ring-1 ring-ink/10 sm:w-80 md:w-[22rem]">
              <Image
                src="/assets/images/ChatGPT Image 11. Juli 2026, 21_51_45.png"
                alt="Martin – Personal Trainer in Zürich"
                width={892}
                height={1763}
                priority
                className="pointer-events-none absolute left-1/2 top-1/2 h-[94%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
