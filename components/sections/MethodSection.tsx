'use client'

import Link from 'next/link'
import { CalendarCheck, ClipboardCheck, Trophy } from 'lucide-react'
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
      icon: ClipboardCheck,
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
    <section className="section-padding bg-paper">
      <div className="container-max">
        <div className="animate-slide-up mb-16 flex flex-col items-start gap-5 border-b border-ink/12 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-black uppercase tracking-[-0.01em] leading-[1.15] text-ink">
              {t('method.title')}
            </h2>
          </div>
          <p className="text-ink/55 text-base max-w-sm md:text-right">
            {t('method.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => (
            <div key={i} className="animate-slide-up relative border-t border-ink/15 pt-6">
              <div className="flex flex-col items-start">
                <div className="mb-5 flex w-full items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink font-display text-xl font-black text-white">
                    {step.number}
                  </span>
                  <step.icon className="h-7 w-7 text-flame" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-3 text-ink">{t(step.titleKey)}</h3>
                <p className="text-ink/55 leading-relaxed">{t(step.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-slide-up text-center">
          <Link
            href="/book/probe-training"
            className="btn-accent h-14 px-10"
          >
            {t('method.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
