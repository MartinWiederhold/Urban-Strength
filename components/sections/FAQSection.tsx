'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { faqData } from '@/lib/translations'

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="animate-slide-up border-b border-white/8 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-white transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white/85">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-white/30 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white/60' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="overflow-hidden">
          <p className="text-white/50 pb-5 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQSection() {
  const { lang, t } = useLanguage()
  const faqs = faqData[lang]

  return (
    <section className="section-padding bg-[#080808]" id="faq">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            {t('faq.title')}
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
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
