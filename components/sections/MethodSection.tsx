'use client'

import Link from 'next/link'
import { CalendarCheck, ClipboardList, Trophy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MethodSection() {
  const { t } = useLanguage()

  const steps = [
    {
      number: '01',
      icon: CalendarCheck,
      titleKey: 'method.step1Title',
      descKey: 'method.step1Desc',
    },
    {
      number: '02',
      icon: ClipboardList,
      titleKey: 'method.step2Title',
      descKey: 'method.step2Desc',
    },
    {
      number: '03',
      icon: Trophy,
      titleKey: 'method.step3Title',
      descKey: 'method.step3Desc',
    },
  ]

  return (
    <section className="section-padding bg-black">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            {t('method.title')}
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            {t('method.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => (
            <div key={i} className="animate-slide-up relative">
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+1rem)] w-8 h-px bg-white/10" />
              )}

              <div className="flex flex-col items-start">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-semibold text-white/8 tracking-tight">{step.number}</span>
                  <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-white/60" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{t(step.titleKey)}</h3>
                <p className="text-white/50 leading-relaxed">{t(step.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-slide-up text-center">
          <Link
            href="/book/probe-training"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-[15px] font-semibold text-black hover:bg-white/90 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            {t('method.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
