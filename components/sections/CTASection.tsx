'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CTASection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-[hsl(0,0%,11%)] text-white p-10 md:p-16 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-6">
            Erster Termin komplett gratis
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 max-w-2xl mx-auto text-balance">
            Bereit für dein Personal Training in Zürich?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Starte jetzt mit einem kostenlosen Probetraining. Unverbindlich und ohne Risiko.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/book/probe-training">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Kostenloses Probetraining buchen
              </Button>
            </Link>
            <Link href="/kontakt">
              <Button variant="outline-white" size="xl" className="w-full sm:w-auto">
                Frage stellen
              </Button>
            </Link>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Oberer Heuelsteig 30, 8032 Zürich</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:wiederhold.martin@web.de" className="hover:text-white/70 transition-colors">
                wiederhold.martin@web.de
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
