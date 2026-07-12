'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CalendarCheck, ClipboardCheck, Trophy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MethodSection() {
  const { t } = useLanguage()

  const steps = [
    {
      number: '01',
      icon: CalendarCheck,
      image: '/assets/images/probetrainingxx1.jpg',
      titleKey: 'method.step1Title',
      descKey: 'method.step1Desc',
    },
    {
      number: '02',
      icon: ClipboardCheck,
      image: '/assets/images/Trainingsplanxx1.jpg',
      titleKey: 'method.step2Title',
      descKey: 'method.step2Desc',
    },
    {
      number: '03',
      icon: Trophy,
      image: '/assets/images/ergebnissexx1.jpg',
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
            <div key={i} className="animate-slide-up group flex flex-col">
              {/* Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ink/10">
                <Image
                  src={step.image}
                  alt={t(step.titleKey)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Number badge on the image */}
                <span className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-lg font-black text-white shadow-lg">
                  {step.number}
                </span>
              </div>

              {/* Text block */}
              <div className="pt-6">
                <div className="mb-3 flex w-full items-center gap-4">
                  <h3 className="flex-1 font-display text-lg font-bold uppercase tracking-wide leading-snug text-ink">
                    {t(step.titleKey)}
                  </h3>
                  <step.icon className="h-6 w-6 shrink-0 text-flame" strokeWidth={1.75} />
                </div>
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
