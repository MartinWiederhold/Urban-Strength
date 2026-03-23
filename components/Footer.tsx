import Link from 'next/link'
import { MapPin, Mail, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/8 text-white py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-4 inline-flex flex-col transition-opacity hover:opacity-70">
              <span className="text-[1.1rem] font-semibold uppercase tracking-tight text-white">
                Personal Training Zurich
              </span>
              <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
                by Martin
              </span>
            </Link>
            <p className="text-sm text-white/45 font-light leading-relaxed mb-5">
              Professionelles Personal Training in Zürich. Individuelles 1:1 Training für deine Ziele.
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all">
                <Instagram className="w-4 h-4 text-white/50" />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all">
                <Facebook className="w-4 h-4 text-white/50" />
              </a>
            </div>
          </div>

          {/* 3 columns on mobile */}
          <div className="grid grid-cols-3 md:contents gap-4 md:gap-0">

            <div>
              <h3 className="font-semibold text-xs tracking-[0.12em] mb-4 uppercase text-white">Navigation</h3>
              <ul className="space-y-3">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/services', label: 'Angebote' },
                  { href: '/about', label: 'Über Martin' },
                  { href: '/kontakt', label: 'Kontakt' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/45 hover:text-white transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-xs tracking-[0.12em] mb-4 uppercase text-white">Angebote</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/book/probe-training" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    Kostenloses Probetraining
                  </Link>
                </li>
                <li>
                  <Link href="/book/personal-training" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    Personal Training 1:1
                  </Link>
                </li>
                <li>
                  <Link href="/personal-training-zuerich" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    Personal Training Zürich
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-xs tracking-[0.12em] mb-4 uppercase text-white">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/45 font-light">Oberer Heuelsteig 30<br />8032 Zürich</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <a href="mailto:wiederhold.martin@web.de" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    Kontakt per Mail
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom */}
        <div className="pt-4 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30 font-light">
            © {new Date().getFullYear()} Personal Training Zurich – by Martin. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/impressum" className="text-xs text-white/30 hover:text-white/60 transition-colors font-light">Impressum</Link>
            <span className="text-white/15">·</span>
            <Link href="/datenschutz" className="text-xs text-white/30 hover:text-white/60 transition-colors font-light">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
