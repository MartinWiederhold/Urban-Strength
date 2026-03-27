'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Copy, Check, Phone, User, LogOut, LayoutDashboard, Shield, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'

const PHONE_DISPLAY = '+41 77 485 75 35'
const PHONE_TEL     = 'tel:+41774857535'
const WHATSAPP_URL  = 'https://wa.me/41774857535'

/** Auf `true` setzen, um Profil-Icon + Dropdown im Desktop-Header wieder anzuzeigen */
const SHOW_DESKTOP_PROFILE_MENU = false

export default function Navigation() {
  const [isScrolled, setIsScrolled]     = useState(false)
  const [navVisible, setNavVisible]     = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isPhoneOpen, setIsPhoneOpen]   = useState(false)
  const [copied, setCopied]             = useState(false)
  const [profile, setProfile]           = useState<Profile | null>(null)
  const { lang, setLang, t } = useLanguage()
  const pathname  = usePathname()
  const lastScrollYRef        = useRef(0)
  const mobileNavTimeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phoneDropdownRef      = useRef<HTMLDivElement>(null)

  /* ── Scroll hide/show with RAF throttle ─────────────────────────── */
  useEffect(() => {
    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const currentY  = window.scrollY
        const previousY = lastScrollYRef.current
        setIsScrolled(currentY > 20)
        if (currentY <= 8) { setNavVisible(true); lastScrollYRef.current = currentY; return }
        const delta = currentY - previousY
        if (delta > 6 && currentY > 84) setNavVisible(false)
        else if (delta < -6) setNavVisible(true)
        lastScrollYRef.current = currentY
      })
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  /* ── Body scroll lock when mobile menu open ─────────────────────── */
  useEffect(() => {
    if (!isMobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isMobileOpen])

  /* ── Cleanup mobile nav timeout ─────────────────────────────────── */
  useEffect(() => {
    return () => { if (mobileNavTimeoutRef.current) clearTimeout(mobileNavTimeoutRef.current) }
  }, [])

  /* ── Auth ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const supabase = createClient()
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    getProfile()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { getProfile() })
    return () => subscription.unsubscribe()
  }, [])

  /* ── Close phone dropdown on outside click ───────────────────────── */
  useEffect(() => {
    if (!isPhoneOpen) return
    const handler = (e: MouseEvent) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setIsPhoneOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isPhoneOpen])

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    setIsUserMenuOpen(false)
  }

  const navigateFromMobile = (href: string) => {
    setIsMobileOpen(false)
    if (mobileNavTimeoutRef.current) clearTimeout(mobileNavTimeoutRef.current)
    mobileNavTimeoutRef.current = setTimeout(() => { window.location.href = href }, 320)
  }

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(PHONE_DISPLAY)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  /* ── Phone center element (reused desktop + mobile) ─────────────── */
  const PhoneCenter = ({ compact = false }: { compact?: boolean }) => (
    <div ref={phoneDropdownRef} className={`relative flex items-center ${compact ? 'gap-0' : 'gap-1.5'}`}>
      <button
        type="button"
        onClick={() => setIsPhoneOpen(p => !p)}
        aria-label="Kontakt & WhatsApp"
        aria-expanded={isPhoneOpen}
        className={`flex items-center justify-center rounded-full hover:bg-white/8 transition-colors ${compact ? 'w-10 h-10' : 'w-8 h-8'}`}
      >
        <svg className={`text-[#25D366] ${compact ? 'w-5 h-5' : 'w-[18px] h-[18px]'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      {!compact && (
        <button
          type="button"
          onClick={() => setIsPhoneOpen(p => !p)}
          className="font-semibold text-white/85 hover:text-white transition-colors tracking-tight text-[14px]"
        >
          {PHONE_DISPLAY}
        </button>
      )}

      {isPhoneOpen && (
        <div
          className={`animate-slide-up absolute top-[calc(100%+8px)] z-50 w-max min-w-[220px] max-w-[calc(100vw-1.25rem)] rounded-2xl border border-white/10 bg-[#111] py-1.5 shadow-[0_16px_48px_-8px_hsl(0_0%_0%_/0.85)] ${
            compact ? 'right-0 left-auto' : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsPhoneOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/75 hover:text-white hover:bg-white/5 transition-all rounded-xl mx-1"
          >
            <svg className="w-5 h-5 text-[#25D366] shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('nav.whatsapp')}
          </a>
          <div className="mx-4 h-px bg-white/8" />
          <a
            href={PHONE_TEL}
            onClick={() => setIsPhoneOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/75 hover:text-white hover:bg-white/5 transition-all rounded-xl mx-1"
          >
            <Phone className="w-5 h-5 text-white/40 shrink-0" />
            {t('nav.call')}
          </a>
          <div className="mx-4 h-px bg-white/8" />
          <button
            type="button"
            onClick={() => { copyPhone(); setIsPhoneOpen(false) }}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/75 hover:text-white hover:bg-white/5 transition-all rounded-xl mx-1 w-[calc(100%-0.5rem)]"
          >
            {copied
              ? <Check className="w-5 h-5 text-green-400 shrink-0" />
              : <Copy className="w-5 h-5 text-white/40 shrink-0" />
            }
            {copied ? t('nav.numberCopied') : t('nav.copyNumber')}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <header
        style={{
          opacity: navVisible ? 1 : 0,
          transform: navVisible ? 'none' : 'translateY(-8px)',
          transition: 'opacity 0.2s linear, transform 0.2s linear',
          pointerEvents: navVisible ? 'auto' : 'none',
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled ? 'bg-black border-b border-white/[0.08]' : 'bg-black border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="relative flex items-center justify-between" style={{ height: '4.2rem' }}>

            {/* Logo */}
            <Link href="/" className="flex flex-col group">
              <span className="text-[1.1rem] font-semibold uppercase tracking-tight text-white group-hover:text-white/70 transition-colors">
                Personal Training Zurich
              </span>
              <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
                by Martin
              </span>
            </Link>

            {/* Desktop Center – Phone */}
            <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
              <div className="pointer-events-auto">
                <PhoneCenter />
              </div>
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-2">
              {/* Desktop language switcher */}
              <button
                type="button"
                onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
                aria-label={lang === 'de' ? 'Switch to English' : 'Wechsel zu Deutsch'}
                className="flex items-center h-10 px-2.5 rounded-full hover:bg-white/8 transition-colors gap-1.5"
              >
                <Globe className="w-[15px] h-[15px] text-white/40 shrink-0" />
                <div className="flex items-center gap-[3px]">
                  <span className={`text-[11px] font-bold tracking-wider uppercase leading-none ${lang === 'de' ? 'text-white' : 'text-white/30'}`}>DE</span>
                  <span className="text-white/15 text-[9px] leading-none">|</span>
                  <span className={`text-[11px] font-bold tracking-wider uppercase leading-none ${lang === 'en' ? 'text-white' : 'text-white/30'}`}>EN</span>
                </div>
              </button>

              {SHOW_DESKTOP_PROFILE_MENU && profile ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-all"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="animate-slide-up absolute right-0 top-full mt-2 min-w-[180px] bg-[#111] rounded-xl border border-white/10 py-2 z-50 shadow-[0_16px_48px_-8px_hsl(0_0%_0%_/0.8)]">
                      {profile.role === 'admin' && (
                        <Link href="/admin" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                        <LayoutDashboard className="w-4 h-4" /> Mein Dashboard
                      </Link>
                      <div className="border-t border-white/8 my-1" />
                      <button type="button" onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-all w-full text-left">
                        <LogOut className="w-4 h-4" /> Ausloggen
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/#angebote"
                  className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-semibold tracking-tight text-black hover:bg-white/90 transition-colors"
                >
                  {t('nav.bookNow')}
                </Link>
              )}
            </div>

            {/* Mobile: Phone center + language switcher + optional hamburger for logged-in */}
            <div className="flex items-center gap-0.5 md:hidden">
              <PhoneCenter compact />
              {/* Language switcher – vertical DE / EN, no icon */}
              <button
                type="button"
                onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
                aria-label={lang === 'de' ? 'Switch to English' : 'Wechsel zu Deutsch'}
                className="flex flex-col items-center justify-center h-10 w-8 rounded-full hover:bg-white/8 transition-colors"
              >
                <span className={`text-[9px] font-bold tracking-wider uppercase leading-none ${lang === 'de' ? 'text-white' : 'text-white/30'}`}>DE</span>
                <span className={`text-[9px] font-bold tracking-wider uppercase leading-none mt-[2px] ${lang === 'en' ? 'text-white' : 'text-white/30'}`}>EN</span>
              </button>
              {profile && (
                <button type="button" onClick={() => setIsMobileOpen(p => !p)}
                  className="relative flex h-10 w-10 items-center justify-center ml-1"
                  aria-label={isMobileOpen ? 'Menü schliessen' : 'Menü öffnen'}>
                  <span className={`absolute h-[2px] w-5 bg-white transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-[4px]'}`} />
                  <span className={`absolute h-[2px] w-5 bg-white transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[4px]'}`} />
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu – only for logged-in users (Dashboard access) */}
      {isMobileOpen && profile && (
        <div className="animate-from-top fixed inset-0 z-[80] bg-black md:hidden overscroll-none">
          <div className="flex h-full flex-col px-4 pb-8 pt-5">
            <div className="flex items-center justify-between" style={{ height: '4.2rem' }}>
              <button type="button" onClick={() => navigateFromMobile('/')} className="flex flex-col">
                <span className="text-[1.1rem] font-semibold uppercase tracking-tight text-white">Personal Training Zurich</span>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">by Martin</span>
              </button>
              <button onClick={() => setIsMobileOpen(false)} className="relative flex h-10 w-10 items-center justify-center">
                <span className="absolute h-[2px] w-6 bg-white translate-y-0 rotate-45 transition-all" />
                <span className="absolute h-[2px] w-6 bg-white translate-y-0 -rotate-45 transition-all" />
              </button>
            </div>

            <nav className="mt-12 flex flex-col space-y-4">
              <button type="button" onClick={() => navigateFromMobile(profile.role === 'admin' ? '/admin' : '/dashboard')}
                className="text-left text-[2.05rem] font-semibold leading-tight text-white/85 hover:text-white transition-colors">
                Dashboard
              </button>
              <button onClick={() => { handleSignOut(); setIsMobileOpen(false) }}
                className="text-left text-[2.05rem] font-semibold leading-tight text-white/40 hover:text-white/60 transition-colors">
                {t('nav.logout')}
              </button>
            </nav>

            <div className="mt-auto border-t border-white/8 pt-6" />
          </div>
        </div>
      )}
    </>
  )
}
