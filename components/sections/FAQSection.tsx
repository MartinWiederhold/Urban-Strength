'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { faqData } from '@/lib/translations'

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="animate-slide-up border-b border-black/[0.08] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-neutral-900">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-500' : 'text-neutral-400'}`}
        />
      </button>

      {isOpen && (
        <div className="overflow-hidden">
          <p className="text-neutral-500 pb-5 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQSection() {
  const { lang, t } = useLanguage()
  const faqs = faqData[lang]

  return (
    <section className="section-padding bg-white" id="faq">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-12">
          <span className="eyebrow mb-4">{t('faq.title')}</span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-neutral-900">
            {t('faq.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
