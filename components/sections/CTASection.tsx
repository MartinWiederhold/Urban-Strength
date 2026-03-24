'use client'

import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="section-padding bg-black">
      <div className="container-max">
        <div className="animate-slide-up rounded-3xl bg-white text-black p-10 md:p-16 text-center"
        >
          <div className="inline-block rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-black/60 mb-6 md:px-5 md:py-2 md:text-xs">
            Erster Termin komplett gratis
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 max-w-2xl mx-auto text-balance text-black">
            Bereit für dein Personal Training in Zürich?
          </h2>
          <p className="text-black/55 text-lg mb-10 max-w-xl mx-auto">
            Starte jetzt mit einem kostenlosen Probetraining. Unverbindlich und ohne Risiko.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/book/probe-training"
              className="inline-flex h-14 items-center justify-center rounded-full bg-black text-white px-10 text-[15px] font-semibold hover:bg-black/80 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
            >
              Kostenloses Probetraining buchen
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex h-14 items-center justify-center rounded-full border border-black/15 bg-black/5 text-black px-10 text-[15px] font-semibold hover:bg-black/10 transition-all duration-300 w-full sm:w-auto"
            >
              Frage stellen
            </Link>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-black/40">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-black/30" />
              <span>Oberer Heuelsteig 30, 8032 Zürich</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-black/10" />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-black/30" />
              <a href="mailto:wiederhold.martin@web.de" className="hover:text-black/70 transition-colors">
                wiederhold.martin@web.de
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
