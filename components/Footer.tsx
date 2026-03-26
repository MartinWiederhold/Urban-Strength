'use client'

import Link from 'next/link'
import { MapPin, Mail } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

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
            <p className="text-sm text-white/45 font-light leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

            <div>
              <h3 className="font-semibold text-xs tracking-[0.12em] mb-4 uppercase text-white">{t('footer.navTitle')}</h3>
              <ul className="space-y-3">
                {[
                  { href: '/', labelKey: 'footer.navHome' },
                  { href: '/services', labelKey: 'footer.navServices' },
                  { href: '/kontakt', labelKey: 'footer.navContact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/45 hover:text-white transition-colors font-light">
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-xs tracking-[0.12em] mb-4 uppercase text-white">{t('footer.offersTitle')}</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/book/probe-training" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    {t('footer.offerFree')}
                  </Link>
                </li>
                <li>
                  <Link href="/book/personal-training" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    {t('footer.offer1on1')}
                  </Link>
                </li>
                <li>
                  <Link href="/personal-training-zuerich" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    {t('footer.offerZuerich')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-xs tracking-[0.12em] mb-4 uppercase text-white">{t('footer.contactTitle')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/45 font-light">Oberer Heuelsteig 30-34<br />8032 Zürich</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <a href="mailto:personaltrainingbymartin@gmail.com" className="text-sm text-white/45 hover:text-white transition-colors font-light">
                    {t('footer.contactMail')}
                  </a>
                </li>
              </ul>
            </div>
        </div>

        {/* Bottom */}
        <div className="pt-4 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30 font-light">
            {t('footer.copyright').replace('{year}', String(year))}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/impressum" className="text-xs text-white/30 hover:text-white/60 transition-colors font-light">{t('footer.imprint')}</Link>
            <span className="text-white/15">·</span>
            <Link href="/datenschutz" className="text-xs text-white/30 hover:text-white/60 transition-colors font-light">{t('footer.privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
