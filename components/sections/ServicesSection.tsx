'use client'

import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { servicesData } from '@/lib/translations'

export default function ServicesSection() {
  const { lang, t } = useLanguage()
  const services = servicesData[lang]

  return (
    <section className="section-padding bg-[#fff8f0] scroll-mt-[4.75rem] md:scroll-mt-[5rem]" id="angebote">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-16">
          <span className="eyebrow mb-4">{t('services.title')}</span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-neutral-900">
            {t('services.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto md:items-stretch">
          {services.map((service) => {
            const featured = service.highlight
            return (
            <div
              key={service.id}
              id={service.id}
              className={`relative scroll-mt-[5.5rem] md:scroll-mt-[6rem] rounded-3xl p-8 flex flex-col transition-all duration-500 bg-white text-black border border-black/[0.06] ${
                featured
                  ? 'z-[1] ring-2 ring-orange-400 ring-offset-2 ring-offset-[#fff8f0] shadow-[0_20px_50px_-12px_rgba(245,129,15,0.4)] hover:-translate-y-1 hover:shadow-[0_28px_56px_-10px_rgba(245,129,15,0.5)] md:scale-[1.02] md:z-[2]'
                  : 'shadow-[0_10px_40px_-16px_rgba(20,20,20,0.16)] hover:-translate-y-1 hover:shadow-[0_28px_56px_-14px_rgba(20,20,20,0.22)]'
              }`}
            >
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6 w-fit ${
                  featured ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-neutral-900 text-white'
                }`}
              >
                {service.badge}
              </div>

              <h3 className="text-xl font-semibold tracking-tight mb-2 text-black">
                {service.title}
              </h3>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-semibold text-black">{service.price}</span>
                <span className="text-sm text-black/50">{service.priceNote}</span>
              </div>
              <p className="text-sm mb-4 text-black/50">{t('services.duration')}: {service.duration}</p>

              <p className="text-sm leading-relaxed mb-6 text-black/65">{service.description}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${featured ? 'text-orange-600' : 'text-orange-500'}`} />
                    <span className="text-sm text-black/75">{feature}</span>
                  </li>
                ))}
              </ul>

              {service.paymentNote && (
                <p className="text-xs mb-4 text-black/40">{service.paymentNote}</p>
              )}

              <Link
                href={`/book/${service.id}`}
                className={`inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold transition-all duration-300 group gap-2 hover:scale-[1.02] ${
                  featured
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-[0_14px_34px_-10px_rgba(245,129,15,0.6)] hover:brightness-[1.04]'
                    : 'bg-neutral-900 text-white hover:bg-black'
                }`}
              >
                {service.cta}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
