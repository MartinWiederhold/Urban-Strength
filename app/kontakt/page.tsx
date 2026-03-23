import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { MapPin, Mail, Clock, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Kontakt | Personal Training Zürich – Oberer Heuelsteig 30',
  description: 'Kontaktiere deinen Personal Trainer in Zürich. Adresse: Oberer Heuelsteig 30, 8032 Zürich. Kostenloses Probetraining buchen oder Frage stellen.',
  alternates: { canonical: 'https://personaltraining-zurich.ch/kontakt' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://personaltraining-zurich.ch' },
    { '@type': 'ListItem', position: 2, name: 'Kontakt', item: 'https://personaltraining-zurich.ch/kontakt' },
  ],
}

export default function KontaktPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <main className="pt-20">
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                Kontakt
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Hast du Fragen? Ich bin für dich da. Oder buch direkt dein kostenloses Probetraining.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-secondary flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-semibold mb-1">Trainingsstandort</h2>
                    <p className="text-muted-foreground">Oberer Heuelsteig 30<br />8032 Zürich, Schweiz</p>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-secondary flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-semibold mb-1">E-Mail</h2>
                    <a href="mailto:wiederhold.martin@web.de" className="text-primary hover:underline text-sm">
                      wiederhold.martin@web.de
                    </a>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-secondary flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-semibold mb-1">Trainingszeiten</h2>
                    <p className="text-muted-foreground text-sm">Mo–Fr: 07:00–21:00 Uhr<br />Sa: 08:00–18:00 Uhr</p>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-secondary flex items-start gap-4">
                  <MessageCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-semibold mb-1">Chat</h2>
                    <p className="text-muted-foreground text-sm mb-2">Als registrierter Kunde kannst du mir direkt im Dashboard schreiben.</p>
                    <Link href="/dashboard/chat">
                      <Button variant="outline" size="sm">Zum Chat</Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl bg-[hsl(0,0%,11%)] text-white p-8 flex flex-col justify-center">
                <h2 className="text-2xl font-bold tracking-tight mb-3">
                  Direkt buchen – kostenlos
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Der schnellste Weg: Buch einfach deinen kostenlosen Probetraining-Termin online. Komplett unverbindlich.
                </p>
                <Link href="/book/probe-training">
                  <Button variant="hero" size="lg" className="w-full">
                    Kostenloses Probetraining buchen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
