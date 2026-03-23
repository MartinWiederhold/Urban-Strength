'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
    answer: 'Das Personal Training 1:1 kostet CHF 35 pro Stunde. Dein erster Termin – die Geräte-Einweisung und das Probetraining – ist komplett kostenlos.',
  },
  {
    question: 'Wie bezahle ich?',
    answer: 'Die Bezahlung erfolgt bequem per Twint nach dem Training. Keine Vorauszahlung nötig.',
  },
  {
    question: 'Wie oft sollte ich trainieren?',
    answer: 'Für optimale Resultate empfehle ich 2–3 Einheiten pro Woche. Aber auch einmal pro Woche bringt schon deutliche Fortschritte.',
  },
  {
    question: 'Kann ich einen Termin absagen oder verschieben?',
    answer: 'Ja, über dein persönliches Dashboard kannst du Termine jederzeit verwalten. Bitte sage mindestens 24 Stunden vorher ab.',
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-white/10 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-white/50 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-white/60 pb-5 leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  return (
    <section className="section-padding bg-[hsl(0,0%,8%)]" id="faq">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Häufige Fragen zum Personal Training in Zürich
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Hast du noch weitere Fragen? Schreib mir einfach.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
