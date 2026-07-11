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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          <div className="animate-slide-up md:order-1 order-2 min-w-0">
            <span className="eyebrow mb-6">(01) — Über Martin</span>
            <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
              <h2 className="font-display text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-black uppercase leading-[1.05] tracking-[-0.01em] mt-4 mb-6 text-ink whitespace-nowrap w-max max-w-none">
                <span className="sm:hidden">{t('about.titleShort')}</span>
                <span className="hidden sm:inline">{t('about.titleLong')}</span>
              </h2>
            </div>
            <p className="text-ink/60 leading-relaxed mb-8 max-w-md">
              {t('about.bio')}
            </p>

            <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-8">
              {highlights.map((item, i) => (
                <div key={i} className="flex justify-center">
                  <div className="text-left p-5 flex flex-col items-start justify-center min-h-[8rem] sm:min-h-[9rem] w-full max-w-[17.5rem] sm:max-w-[15.5rem] border-t border-ink/15">
                    <item.icon className="w-5 h-5 text-flame mb-3 shrink-0" />
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-ink leading-snug mb-1.5">
                      {t(item.titleKey)}
                    </p>
                    <p className="text-sm text-ink/50 leading-snug">{t(item.subtitleKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-start sm:justify-center">
              <Link
                href="/book/probe-training"
                className="btn-dark h-12 gap-2 group"
              >
                {t('about.cta')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="animate-slide-up md:order-2 order-1 flex justify-center">
            <div className="relative">
              <div
                className="relative w-64 h-64 md:w-[20rem] md:h-[20rem] rounded-full overflow-hidden bg-ink ring-1 ring-ink/15"
              >
                <Image
                  src="/assets/images/ChatGPT Image 11. Juli 2026, 21_51_45.png"
                  alt="Martin – Personal Trainer in Zürich"
                  fill
                  className="object-contain object-bottom"
                  sizes="(max-width: 768px) 256px, 320px"
                  priority
                />
              </div>

              <div className="absolute -bottom-2 -right-1 sm:-right-3 w-fit overflow-hidden rounded-full bg-flame px-5 py-2.5">
                <p className="relative font-display text-lg font-black uppercase leading-none tracking-[0.06em] text-white">
                  Martin
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
