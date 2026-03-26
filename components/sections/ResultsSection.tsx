'use client'

import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { resultsData } from '@/lib/translations'

export default function ResultsSection() {
  const { lang, t } = useLanguage()
  const results = resultsData[lang]

  return (
    <section className="section-padding bg-black" id="resultate">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            {t('results.title')}
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            {t('results.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {results.map((result, i) => (
            <div key={i} className="animate-slide-up rounded-3xl bg-[#111] border border-white/8 p-6 hover:border-white/16 hover:-translate-y-1 transition-all duration-300">
              {/* Before/After */}
              <div className="flex gap-2 mb-5">
                <div className="flex-1 h-28 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-xs text-white/25 font-medium">
                  {t('results.before')}
                </div>
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1 h-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50 font-medium">
                  {t('results.after')}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-white tracking-tight">{result.name}</p>
                  <p className="text-sm text-white/40">{result.goal}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white text-sm">{result.result}</p>
                  <p className="text-xs text-white/35">{result.duration}</p>
                </div>
              </div>

              <p className="text-sm text-white/50 leading-relaxed italic">
                &ldquo;{result.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
