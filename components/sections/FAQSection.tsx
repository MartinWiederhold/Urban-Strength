'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Brauche ich Vorerfahrung für das Personal Training?',
    answer: 'Nein, überhaupt nicht. Egal ob du Anfänger bist oder schon Erfahrung hast – ich passe das Training individuell an dein Level an. Das kostenlose Probetraining ist der perfekte Einstieg.',
  },
  {
    question: 'Wo findet das Training statt?',
    answer: 'Das Training findet im Gym am Oberer Heuelsteig 30, 8032 Zürich statt. Zentral gelegen und gut erreichbar mit ÖV und Auto.',
  },
  {
    question: 'Wie läuft das kostenlose Probetraining ab?',
    answer: 'Du buchst online einen Termin, wir treffen uns im Gym, ich zeige dir die Geräte, wir besprechen deine Ziele und machen eine erste Trainingseinheit zusammen. Komplett gratis und unverbindlich.',
  },
  {
    question: 'Was kostet Personal Training in Zürich?',
    answer: 'Das Personal Training 1:1 kostet CHF 85 pro Stunde. Es gibt auch ein Quartals-Abo (4 Sessions/Monat) für CHF 600 pro Quartal – das spart CHF 420 gegenüber Einzelbuchungen (12 × 85 = 1020). Dein erster Termin ist komplett kostenlos.',
  },
  {
    question: 'Wie bezahle ich?',
    answer: 'Die Bezahlung erfolgt bequem per Twint nach dem Training. Keine Vorauszahlung nötig.',
  },
  {
    question: 'Wie oft sollte ich trainieren?',
    answer: 'Für optimale Resultate empfehle ich 2–3 Einheiten pro Woche. Aber auch einmal pro Woche bringt schon deutliche Fortschritte.',
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="animate-slide-up border-b border-white/8 last:border-0"
    >
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
          <div
            className="overflow-hidden"
          >
            <p className="text-white/50 pb-5 leading-relaxed">{faq.answer}</p>
          </div>
        )}
      
    </div>
  )
}

export default function FAQSection() {
  return (
    <section className="section-padding bg-[#080808]" id="faq">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Häufige Fragen zum Personal Training in Zürich
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Hast du noch weitere Fragen? Schreib mir einfach.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
