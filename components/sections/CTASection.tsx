'use client'

import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CTASection() {
  const { t } = useLanguage()

  return (
    <section className="py-14 md:py-20 bg-black">
      <div className="container-max">
        <div className="animate-slide-up mx-auto max-w-2xl rounded-2xl bg-white text-black px-6 py-8 md:px-10 md:py-10 text-center shadow-[0_16px_48px_-12px_rgb(0_0_0_/_0.35)]">
          <div className="inline-block rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-black/55 mb-4 md:mb-5 md:text-[10px] md:px-4 md:py-1.5">
            {t('cta.badge')}
          </div>

          <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-2 text-black text-balance">
            {t('cta.title')}
          </h2>
          <p className="text-black/55 text-sm md:text-[15px] mb-6 max-w-md mx-auto leading-relaxed">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center mb-6">
            <Link
              href="/book/probe-training"
              className="inline-flex h-11 items-center justify-center rounded-full bg-black text-white px-6 text-[13px] font-semibold hover:bg-black/85 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
            >
              {t('cta.primary')}
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 bg-black/5 text-black px-6 text-[13px] font-semibold hover:bg-black/10 transition-all duration-300 w-full sm:w-auto"
            >
              {t('cta.secondary')}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-xs text-black/45">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-black/30 shrink-0" />
              <span>Oberer Heuelsteig 30-34, 8032 Zürich</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-black/10" />
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-black/30 shrink-0" />
              <a href="mailto:personaltrainingbymartin@gmail.com" className="hover:text-black/65 transition-colors">
                personaltrainingbymartin@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
