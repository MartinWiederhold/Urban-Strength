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
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-16">
          <span className="eyebrow mb-4">{t('method.title')}</span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-neutral-900">
            {t('method.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            {t('method.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {steps.map((step, i) => (
            <div key={i} className="animate-slide-up relative">
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+1rem)] w-8 h-px bg-orange-200" />
              )}

              <div className="flex flex-col items-start">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-display text-4xl font-extrabold text-orange-500/20 tracking-tight">{step.number}</span>
                  <span className="icon-chip h-12 w-12">
                    <step.icon className="w-6 h-6" />
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold mb-3 text-neutral-900">{t(step.titleKey)}</h3>
                <p className="text-neutral-500 leading-relaxed">{t(step.descKey)}</p>
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
