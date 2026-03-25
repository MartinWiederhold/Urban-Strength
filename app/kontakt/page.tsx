import type { Metadata } from 'next'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { MapPin, Mail, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Kontakt | Personal Training Zürich – Oberer Heuelsteig 30',
  description: 'Kontaktiere deinen Personal Trainer in Zürich. Adresse: Oberer Heuelsteig 30, 8032 Zürich. Kostenloses Probetraining buchen oder Frage stellen.',
  alternates: { canonical: 'https://personaltrainingbymartin.netlify.app/kontakt' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://personaltrainingbymartin.netlify.app' },
    { '@type': 'ListItem', position: 2, name: 'Kontakt', item: 'https://personaltrainingbymartin.netlify.app/kontakt' },
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
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
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
                    <p className="text-muted-foreground text-sm">Mo–Fr: 06:00–23:00 Uhr<br />Sa: 06:00–22:00 Uhr</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/41774857535"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl bg-[#25D366] flex items-center gap-4 hover:bg-[#1ebe5d] transition-colors group"
                >
                  <svg className="w-7 h-7 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-white">Schreib mir auf WhatsApp</p>
                    <p className="text-white/80 text-sm">+41 77 485 75 35 · Chat starten</p>
                  </div>
                </a>
              </div>

              {/* CTA */}
              <div className="rounded-2xl bg-[hsl(0,0%,11%)] text-white p-8 flex flex-col justify-center items-center text-center">
                <div className="relative mb-6 h-36 w-36 shrink-0 overflow-hidden rounded-full border-2 border-white/15 bg-[#181818] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] md:h-44 md:w-44">
                  <Image
                    src="/assets/images/IMG_99828.jpg"
                    alt="Martin – Personal Trainer in Zürich"
                    fill
                    className="object-cover object-[50%_18%]"
                    sizes="(max-width: 768px) 144px, 176px"
                  />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-3">
                  Direkt buchen – kostenlos
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Der schnellste Weg: Buch einfach deinen kostenlosen Probetraining-Termin online. Komplett unverbindlich.
                </p>
                <Link href="/book/probe-training" className="w-full">
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
