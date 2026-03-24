import type { Metadata } from 'next'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import CTASection from '@/components/sections/CTASection'
import { Award, Users, Clock, Target, Heart, Dumbbell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Über Martin – Dein Personal Trainer in Zürich',
  description: 'Lerne Martin kennen – zertifizierter Personal Trainer in Zürich mit 12+ Jahren Erfahrung. Spezialisiert auf Muskelaufbau, Fettabbau und individuelles 1:1 Training.',
  alternates: { canonical: 'https://personaltrainingbymartin.netlify.app/about' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://personaltrainingbymartin.netlify.app' },
    { '@type': 'ListItem', position: 2, name: 'Über Martin', item: 'https://personaltrainingbymartin.netlify.app/about' },
  ],
}

const values = [
  { icon: Target, title: 'Individuelle Betreuung', description: 'Kein Standard-Programm. Jedes Training ist auf dich zugeschnitten.' },
  { icon: Heart, title: 'Nachhaltige Resultate', description: 'Ich setze auf langfristige Veränderungen, keine kurzfristigen Tricks.' },
  { icon: Dumbbell, title: 'Spass am Training', description: 'Training soll Freude machen – so bleibst du motiviert.' },
]

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <main className="pt-20">
        {/* Hero */}
        <section className="section-padding bg-[hsl(0,0%,11%)] text-white">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-6">
                  Über mich
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
                  Dein Personal Trainer in Zürich – Martin
                </h1>
                <p className="text-white/70 leading-relaxed mb-4">
                  Als zertifizierter Personal Trainer helfe ich Menschen in Zürich, ihre Fitnessziele zu erreichen. Mein Ansatz: individuell, effizient und nachhaltig.
                </p>
                <p className="text-white/70 leading-relaxed">
                  Ich glaube, dass jeder das Potenzial hat, seinen Körper zu transformieren – wenn er die richtige Unterstützung und einen Plan bekommt, der wirklich funktioniert.
                </p>
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <Image
                  src="/assets/images/IMG_9928.jpg"
                  alt="Martin – Personal Trainer in Zürich"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section-padding bg-secondary/30">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { icon: Award, value: '12+', label: 'Jahre Erfahrung als Personal Trainer' },
                { icon: Users, value: '100+', label: 'Kunden erfolgreich trainiert' },
                { icon: Clock, value: '1000+', label: 'Trainingsstunden durchgeführt' },
              ].map((stat, i) => (
                <div key={i} className="p-8 rounded-2xl bg-background border border-border">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-4xl font-semibold tracking-tight mb-1">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-background">
          <div className="container-max text-center">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Meine Werte</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
              Was mich als Personal Trainer auszeichnet.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, i) => (
                <div key={i} className="p-8 rounded-2xl bg-secondary">
                  <value.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  )
}
