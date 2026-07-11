'use client'

import Link from 'next/link'
import { MapPin, Mail } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#fdf4e9] border-t border-orange-200/60 text-neutral-800 py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-4 inline-flex flex-col transition-opacity hover:opacity-70">
              <span className="font-display text-[1.15rem] font-extrabold uppercase tracking-tight text-neutral-900">
                Personal Training Zurich
              </span>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-orange-500">
                by Martin
              </span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

            <div>
              <h3 className="font-bold text-xs tracking-[0.12em] mb-4 uppercase text-neutral-900">{t('footer.navTitle')}</h3>
              <ul className="space-y-3">
                {[
                  { href: '/', labelKey: 'footer.navHome' },
                  { href: '/services', labelKey: 'footer.navServices' },
                  { href: '/kontakt', labelKey: 'footer.navContact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-neutral-500 hover:text-orange-600 transition-colors">
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs tracking-[0.12em] mb-4 uppercase text-neutral-900">{t('footer.offersTitle')}</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/book/probe-training" className="text-sm text-neutral-500 hover:text-orange-600 transition-colors">
                    {t('footer.offerFree')}
                  </Link>
                </li>
                <li>
                  <Link href="/book/personal-training" className="text-sm text-neutral-500 hover:text-orange-600 transition-colors">
                    {t('footer.offer1on1')}
                  </Link>
                </li>
                <li>
                  <Link href="/personal-training-zuerich" className="text-sm text-neutral-500 hover:text-orange-600 transition-colors">
                    {t('footer.offerZuerich')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs tracking-[0.12em] mb-4 uppercase text-neutral-900">{t('footer.contactTitle')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-neutral-500">Oberer Heuelsteig 30-34<br />8032 Zürich</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <a href="mailto:personaltrainingbymartin@gmail.com" className="text-sm text-neutral-500 hover:text-orange-600 transition-colors">
                    {t('footer.contactMail')}
                  </a>
                </li>
              </ul>
            </div>
        </div>

        {/* Bottom */}
        <div className="pt-4 border-t border-orange-200/60 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-neutral-400">
            {t('footer.copyright').replace('{year}', String(year))}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/impressum" className="text-xs text-neutral-400 hover:text-orange-600 transition-colors">{t('footer.imprint')}</Link>
            <span className="text-neutral-300">·</span>
            <Link href="/datenschutz" className="text-xs text-neutral-400 hover:text-orange-600 transition-colors">{t('footer.privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
