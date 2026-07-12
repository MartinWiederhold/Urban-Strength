'use client'

import Link from 'next/link'
import { MapPin, Mail } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Oversized call-to-train band */}
      <div className="border-b border-white/10 px-4 py-16 md:px-10 md:py-24">
        <div className="max-w-[1600px] mx-auto">
          <span className="eyebrow mb-6">(07) — Los geht’s</span>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-[2.1rem] leading-[0.95] md:text-[3.75rem] font-black uppercase tracking-[-0.02em] text-white">
              Train with me
            </h2>
            <Link href="/book/probe-training" className="btn-accent h-14 shrink-0 gap-3">
              {t('about.cta')}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-14">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-4 inline-flex flex-col transition-opacity hover:opacity-70">
              <span className="font-display text-[1.15rem] font-black uppercase tracking-tight text-white">
                Personal Training Zurich
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-flame">
                by Martin
              </span>
            </Link>
            <p className="text-sm text-white/45 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-[11px] tracking-[0.2em] mb-5 uppercase text-white/40">{t('footer.navTitle')}</h3>
            <ul className="space-y-3">
              {[
                { href: '/', labelKey: 'footer.navHome' },
                { href: '/services', labelKey: 'footer.navServices' },
                { href: '/kontakt', labelKey: 'footer.navContact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-flame transition-colors">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-[11px] tracking-[0.2em] mb-5 uppercase text-white/40">{t('footer.offersTitle')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/book/probe-training" className="text-sm text-white/60 hover:text-flame transition-colors">
                  {t('footer.offerFree')}
                </Link>
              </li>
              <li>
                <Link href="/book/personal-training" className="text-sm text-white/60 hover:text-flame transition-colors">
                  {t('footer.offer1on1')}
                </Link>
              </li>
              <li>
                <Link href="/personal-training-zuerich" className="text-sm text-white/60 hover:text-flame transition-colors">
                  {t('footer.offerZuerich')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-[11px] tracking-[0.2em] mb-5 uppercase text-white/40">{t('footer.contactTitle')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-flame mt-0.5 shrink-0" />
                <span className="text-sm text-white/60">Oberer Heuelsteig 30-34<br />8032 Zürich</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-flame shrink-0" />
                <a href="mailto:personaltrainingbymartin@gmail.com" className="text-sm text-white/60 hover:text-flame transition-colors">
                  {t('footer.contactMail')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/35">
            {t('footer.copyright').replace('{year}', String(year))}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/impressum" className="text-xs text-white/35 hover:text-flame transition-colors">{t('footer.imprint')}</Link>
            <span className="text-white/20">·</span>
            <Link href="/datenschutz" className="text-xs text-white/35 hover:text-flame transition-colors">{t('footer.privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
