import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, MapPin, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Personal Training Zürich | Nr. 1 für individuelles Fitness Training',
  description: 'Personal Training Zürich von Martin. Individuelles 1:1 Training für Muskelaufbau, Fettabbau & mehr Fitness. Erster Termin gratis! Ab CHF 35/h. Oberer Heuelsteig 30, 8032 Zürich.',
  keywords: [
    'Personal Training Zürich', 'Personaltrainer Zürich', 'Personal Trainer Zürich kostenlos',
    'Personal Training Zürich Preise', 'Personal Training für Anfänger Zürich',
    'Personal Training Zürich Kreis 7', 'Fitness Coaching Zürich', 'Individuelles Training Zürich',
  ],
  alternates: { canonical: 'https://personaltrainingbymartin.netlify.app/personal-training-zuerich' },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://personaltrainingbymartin.netlify.app' },
    { '@type': 'ListItem', position: 2, name: 'Personal Training Zürich', item: 'https://personaltrainingbymartin.netlify.app/personal-training-zuerich' },
  ],
}

export default function PersonalTrainingZuerichPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <main className="pt-20">
        <section className="section-padding bg-secondary/30">
          <div className="container-max max-w-4xl">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
                Personal Training Zürich
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                Individuelles 1:1 Personal Training in Zürich – von Martin Wiederhold. Dein erster Termin ist kostenlos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link href="/book/probe-training">
                  <Button variant="hero" size="xl">Kostenlos starten</Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="xl">Alle Angebote</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-max max-w-4xl prose prose-lg">
            <h2 className="text-3xl font-semibold tracking-tight mb-6">Was ist Personal Training in Zürich?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              <strong>Personal Training in Zürich</strong> bedeutet individuelles, auf dich zugeschnittenes Training mit einem zertifizierten Personal Trainer – einem Experten, der dir bei jedem Schritt deiner Fitness-Reise zur Seite steht. Anders als im regulären Fitnessstudio bekommst du beim Personal Training in Zürich volle Aufmerksamkeit, korrekte Ausführung aller Übungen und einen Plan, der wirklich zu dir und deinen Zielen passt.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Als dein <strong>Personal Trainer in Zürich</strong> helfe ich dir – egal ob du Anfänger bist oder schon Erfahrung hast – deine Ziele zu erreichen: Muskelaufbau, Fettabbau, mehr Kraft, bessere Ausdauer oder einfach mehr Wohlbefinden.
            </p>

            <h2 className="text-3xl font-semibold tracking-tight mb-6">Vorteile von Personal Training in Zürich</h2>
            <ul className="space-y-3 mb-8">
              {[
                'Individueller Trainingsplan für deine spezifischen Ziele',
                'Korrekte Übungsausführung – keine Verletzungen',
                'Maximale Effizienz: Jede Minute zählt',
                'Konstante Motivation und Accountability',
                'Schnellere und nachhaltigere Resultate',
                'Flexibel buchbar über dein Online-Dashboard',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-3xl font-semibold tracking-tight mb-6">Personal Training Zürich – Preise und Angebote</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Das <strong>Personal Training in Zürich</strong> kostet CHF 35 pro Stunde. Es gibt zwei Angebote:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 rounded-xl bg-secondary">
                <p className="font-bold text-lg mb-1">Gratis Start</p>
                <p className="text-2xl font-bold text-primary mb-2">CHF 0</p>
                <p className="text-sm text-muted-foreground">Geräte-Einweisung & Probetraining (60 Min.) – komplett kostenlos und unverbindlich.</p>
              </div>
              <div className="p-6 rounded-xl bg-[hsl(0,0%,11%)] text-white">
                <p className="font-bold text-lg mb-1 text-white">Personal Training 1:1</p>
                <p className="text-2xl font-bold text-primary mb-2">CHF 35/h</p>
                <p className="text-sm text-white/60">Individuelles Training (60 Min.) – bezahlt per Twint nach dem Training.</p>
              </div>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight mb-6">Standort: Personal Training in Zürich Kreis 7</h2>
            <div className="flex items-start gap-3 p-5 rounded-xl bg-secondary mb-8">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Oberer Heuelsteig 30, 8032 Zürich</p>
                <p className="text-sm text-muted-foreground">Gut erreichbar mit ÖV und Auto. Zentral in Zürich gelegen.</p>
              </div>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight mb-6">Häufige Fragen zum Personal Training Zürich</h2>
            {[
              { q: 'Ist Personal Training in Zürich für Anfänger geeignet?', a: 'Absolut! Gerade Anfänger profitieren enorm vom Personal Training, da du von Anfang an die richtigen Techniken lernst und ein auf dich zugeschnittenes Programm bekommst.' },
              { q: 'Wie finde ich einen guten Personal Trainer in Zürich?', a: 'Wichtig sind Erfahrung, Qualifikation, persönliche Chemie und ein klares Konzept. Mit dem kostenlosen Probetraining kannst du mich und meinen Ansatz risikofrei kennenlernen.' },
              { q: 'Günstiges Personal Training in Zürich – gibt es das?', a: 'Mit CHF 35 pro Stunde biete ich Personal Training in Zürich zu einem sehr fairen Preis an. Dazu kommt der erste Termin komplett kostenlos.' },
            ].map((faq, i) => (
              <div key={i} className="mb-5 p-5 rounded-xl bg-secondary">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}

            <div className="mt-10 text-center">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">Personal Training Zürich – Jetzt starten</h2>
              <p className="text-muted-foreground mb-6">Starte mit einem kostenlosen Probetraining. Kein Risiko, keine Verpflichtung.</p>
              <Link href="/book/probe-training">
                <Button variant="hero" size="xl">Kostenloses Probetraining buchen <ChevronRight className="w-5 h-5" /></Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
