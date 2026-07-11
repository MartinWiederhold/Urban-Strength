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
    <section className="section-padding bg-white" id="ueber-martin">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div className="animate-slide-up md:order-1 order-2 min-w-0">
            <span className="eyebrow mb-4">Personal Trainer · Zürich</span>
            <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
              <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mt-3 mb-6 text-neutral-900 whitespace-nowrap w-max max-w-none">
                <span className="sm:hidden">{t('about.titleShort')}</span>
                <span className="hidden sm:inline">{t('about.titleLong')}</span>
              </h2>
            </div>
            <p className="text-neutral-500 leading-relaxed mb-8">
              {t('about.bio')}
            </p>

            <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-8">
              {highlights.map((item, i) => (
                <div key={i} className="flex justify-center">
                  <div className="card-light text-center p-4 flex flex-col items-center justify-center min-h-[8rem] sm:min-h-[9rem] w-full max-w-[17.5rem] sm:max-w-[15.5rem]">
                    <span className="icon-chip h-11 w-11 mb-2 shrink-0"><item.icon className="w-5 h-5" /></span>
                    <p className="text-base font-semibold text-neutral-900 tracking-tight leading-snug mb-1.5">
                      {t(item.titleKey)}
                    </p>
                    <p className="text-sm text-neutral-400 leading-snug">{t(item.subtitleKey)}</p>
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
              {/* warm glow behind the portrait */}
              <div className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-br from-amber-300/40 to-orange-400/30 blur-2xl" aria-hidden />
              <div
                className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden bg-neutral-900 ring-4 ring-orange-400/60 shadow-[0_24px_64px_-12px_rgba(245,129,15,0.4)]"
              >
                <Image
                  src="/assets/images/ChatGPT Image 11. Juli 2026, 21_51_45.png"
                  alt="Martin – Personal Trainer in Zürich"
                  fill
                  className="object-cover object-[54%_28%]"
                  sizes="(max-width: 768px) 256px, 288px"
                  priority
                />
              </div>

              <div className="absolute -bottom-3 -right-3 w-fit min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-none overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 sm:py-3 shadow-[0_10px_30px_-8px_rgba(245,129,15,0.6)]">
                <p className="relative text-2xl font-display font-extrabold leading-none tracking-tight text-white">
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
