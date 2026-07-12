'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { CalendarCheck, ClipboardCheck, Trophy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const PLAN_LINES: { text: string; className: string }[] = [
  { text: 'Trainingsplan', className: 'text-[clamp(12px,1.55vw,19px)] font-bold uppercase tracking-wide underline decoration-neutral-500 underline-offset-[3px]' },
  { text: 'Max · 25 J. — 8 Wochen', className: 'mt-[3%] text-[clamp(10px,1.2vw,15px)]' },
  { text: 'Woche 1–4', className: 'mt-[6%] text-[clamp(11px,1.3vw,16px)] font-bold' },
  { text: 'Mo · Push', className: 'text-[clamp(10px,1.15vw,14px)]' },
  { text: 'Mi · Pull', className: 'text-[clamp(10px,1.15vw,14px)]' },
  { text: 'Fr · Legs', className: 'text-[clamp(10px,1.15vw,14px)]' },
  { text: 'Woche 5–8', className: 'mt-[4%] text-[clamp(11px,1.3vw,16px)] font-bold' },
  { text: '+ Volumen ↑', className: 'text-[clamp(10px,1.15vw,14px)]' },
  { text: '+ Beine 2×/Wo', className: 'text-[clamp(10px,1.15vw,14px)]' },
  { text: 'Ernährung', className: 'mt-[5%] text-[clamp(11px,1.3vw,16px)] font-bold' },
  { text: '≈ 2800 kcal', className: 'text-[clamp(10px,1.15vw,14px)]' },
  { text: 'Protein 160 g', className: 'text-[clamp(10px,1.15vw,14px)]' },
  { text: '3 Mahlz. + Shake', className: 'text-[clamp(10px,1.15vw,14px)]' },
]

export default function MethodSection() {
  const { t } = useLanguage()

  const planRef = useRef<HTMLDivElement>(null)
  const [planVisible, setPlanVisible] = useState(false)

  useEffect(() => {
    if (!planRef.current || planVisible) return
    const el = planRef.current
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlanVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [planVisible])

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

                {/* Handwritten training plan overlay — only on step 02 (clipboard),
                    written line by line via IntersectionObserver + staggered CSS. */}
                {i === 1 && (
                  <div
                    ref={planRef}
                    className="pointer-events-none absolute font-hand text-neutral-800"
                    style={{
                      left: '54%',
                      top: '34%',
                      width: '38%',
                      height: '44%',
                      transform: 'rotate(-2deg)',
                      transformOrigin: 'top left',
                      lineHeight: 1.05,
                    }}
                  >
                    {PLAN_LINES.map((line, k) => (
                      <div
                        key={k}
                        className={line.className}
                        style={{
                          opacity: planVisible ? undefined : 0,
                          animation: planVisible
                            ? `writeIn 0.45s cubic-bezier(0.22,1,0.36,1) ${k * 0.28}s forwards`
                            : undefined,
                        }}
                      >
                        {line.text}
                      </div>
                    ))}
                  </div>
                )}

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
