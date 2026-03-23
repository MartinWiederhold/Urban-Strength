import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[hsl(0,0%,11%)] text-white/80">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <p className="text-white font-bold text-lg tracking-tight">Personal Training Zurich</p>
              <p className="text-white/60 text-sm">by Martin</p>
            </div>
            <p className="text-sm leading-relaxed text-white/60 mb-4">
              Professionelles Personal Training in Zürich. Individuelles 1:1 Training für deine Ziele.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/services', label: 'Angebote' },
                { href: '/about', label: 'Über Martin' },
                { href: '/kontakt', label: 'Kontakt' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Angebote</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/book/probe-training" className="text-sm hover:text-white transition-colors">
                  Kostenloses Probetraining
                </Link>
              </li>
              <li>
                <Link href="/book/personal-training" className="text-sm hover:text-white transition-colors">
                  Personal Training 1:1
                </Link>
              </li>
              <li>
                <Link href="/personal-training-zuerich" className="text-sm hover:text-white transition-colors">
                  Personal Training Zürich
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">Oberer Heuelsteig 30<br />8032 Zürich, Schweiz</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:wiederhold.martin@web.de" className="text-sm hover:text-white transition-colors">
                  Kontakt per Mail
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Personal Training Zurich – by Martin. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/40">Personal Training Zürich</span>
            <span className="text-white/20">·</span>
            <Link href="/impressum" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Impressum
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/datenschutz" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
