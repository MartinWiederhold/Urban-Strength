'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from '@/lib/translations'
import type { Lang } from '@/lib/translations'

export type { Lang }

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ui_lang') as Lang | null
      if (saved === 'de' || saved === 'en') setLangState(saved)
    } catch {}
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    try { localStorage.setItem('ui_lang', newLang) } catch {}
  }

  const t = (key: string): string =>
    translations[lang]?.[key] ?? translations.de?.[key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
