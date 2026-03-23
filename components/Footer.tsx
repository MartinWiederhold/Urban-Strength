import Link from 'next/link'
import { MapPin, Mail, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#F8F6F1] text-black py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-3 md:mb-4 inline-flex flex-col transition-opacity hover:opacity-80">
              <span className="text-[1.1rem] font-semibold uppercase tracking-tight text-[#161616]">
                Personal Training Zurich
              </span>
              <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-black/50">
                by Martin
              </span>
            </Link>
            <p className="text-xs md:text-sm text-black/70 font-light leading-relaxed mb-4">
              Professionelles Personal Training in Zürich. Individuelles 1:1 Training für deine Ziele.
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <Instagram className="w-4 h-4 text-black/70" />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <Facebook className="w-4 h-4 text-black/70" />
              </a>
            </div>
          </div>

          {/* Navigation, Angebote, Kontakt – 3-column on mobile */}
          <div className="grid grid-cols-3 md:contents gap-4 md:gap-0">

            {/* Navigation */}
            <div>
              <h3 className="font-semibold text-xs md:text-sm tracking-tight mb-3 md:mb-4 uppercase text-black">
                Navigation
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/services', label: 'Angebote' },
                  { href: '/about', label: 'Über Martin' },
                  { href: '/kontakt', label: 'Kontakt' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs md:text-sm text-black/70 hover:text-black transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Angebote */}
            <div>
              <h3 className="font-semibold text-xs md:text-sm tracking-tight mb-3 md:mb-4 uppercase text-black">
                Angebote
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link href="/book/probe-training" className="text-xs md:text-sm text-black/70 hover:text-black transition-colors font-light">
                    Kostenloses Probetraining
                  </Link>
                </li>
                <li>
                  <Link href="/book/personal-training" className="text-xs md:text-sm text-black/70 hover:text-black transition-colors font-light">
                    Personal Training 1:1
                  </Link>
                </li>
                <li>
                  <Link href="/personal-training-zuerich" className="text-xs md:text-sm text-black/70 hover:text-black transition-colors font-light">
                    Personal Training Zürich
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kontakt */}
            <div>
              <h3 className="font-semibold text-xs md:text-sm tracking-tight mb-3 md:mb-4 uppercase text-black">
                Kontakt
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-black/50 mt-0.5 shrink-0" />
                  <span className="text-xs md:text-sm text-black/70 font-light">Oberer Heuelsteig 30<br />8032 Zürich</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-black/50 shrink-0" />
                  <a href="mailto:wiederhold.martin@web.de" className="text-xs md:text-sm text-black/70 hover:text-black transition-colors font-light">
                    Kontakt per Mail
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-3 md:pt-4 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[10px] md:text-xs text-black/60 font-light">
            © {new Date().getFullYear()} Personal Training Zurich – by Martin. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/impressum" className="text-[10px] md:text-xs text-black/60 hover:text-black transition-colors font-light">
              Impressum
            </Link>
            <span className="text-black/20">·</span>
            <Link href="/datenschutz" className="text-[10px] md:text-xs text-black/60 hover:text-black transition-colors font-light">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
