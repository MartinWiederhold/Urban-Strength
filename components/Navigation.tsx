'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Angebote' },
  { href: '/about', label: 'Über Martin' },
  { href: '/kontakt', label: 'Kontakt' },
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const pathname = usePathname()
  const lastScrollYRef = useRef(0)
  const mobileNavTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const previousY = lastScrollYRef.current
      setIsScrolled(currentY > 20)
      if (currentY <= 8) { setNavVisible(true); lastScrollYRef.current = currentY; return }
      const delta = currentY - previousY
      if (delta > 6 && currentY > 84) setNavVisible(false)
      else if (delta < -6) setNavVisible(true)
      lastScrollYRef.current = currentY
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isMobileOpen])

  useEffect(() => {
    return () => { if (mobileNavTimeoutRef.current) clearTimeout(mobileNavTimeoutRef.current) }
  }, [])

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

  const goToLandingAngebote = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (pathname === '/') {
      document.getElementById('angebote')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.location.href = '/#angebote'
    }
  }

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

            {/* Desktop Center Nav */}
            <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
              <div className="pointer-events-auto flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] transition-all duration-200 ${
                      pathname === link.href
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-2">
              {profile ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-all"
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
                      <button onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-all w-full text-left">
                        <LogOut className="w-4 h-4" /> Ausloggen
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/#angebote"
                  onClick={goToLandingAngebote}
                  className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-semibold tracking-tight text-black hover:bg-white/90 transition-colors"
                >
                  Jetzt buchen
                </a>
              )}
            </div>

            {/* Mobile: Kontakt + Hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/kontakt"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[14px] font-semibold tracking-tight text-black">
                Kontakt
              </Link>
              <button type="button" onClick={() => setIsMobileOpen(p => !p)}
                className="relative flex h-10 w-10 items-center justify-center"
                aria-label={isMobileOpen ? 'Menü schliessen' : 'Menü öffnen'}>
                <span className={`absolute h-[2px] w-6 bg-white transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-[5px]'}`} />
                <span className={`absolute h-[2px] w-6 bg-white transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[5px]'}`} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {isMobileOpen && (
        <div className="animate-from-top fixed inset-0 z-[80] bg-black md:hidden overscroll-none">
          <div className="flex h-full flex-col px-4 pb-8 pt-5">
            <div className="flex items-center justify-between" style={{ height: '4.2rem' }}>
              <button type="button" onClick={() => navigateFromMobile('/')} className="flex flex-col">
                <span className="text-[1.1rem] font-semibold uppercase tracking-tight text-white">Personal Training Zurich</span>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">by Martin</span>
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => navigateFromMobile('/kontakt')}
                  className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[14px] font-semibold tracking-tight text-black">
                  Kontakt
                </button>
                <button onClick={() => setIsMobileOpen(false)} className="relative flex h-10 w-10 items-center justify-center">
                  <span className="absolute h-[2px] w-6 bg-white translate-y-0 rotate-45 transition-all" />
                  <span className="absolute h-[2px] w-6 bg-white translate-y-0 -rotate-45 transition-all" />
                </button>
              </div>
            </div>

            <nav className="mt-12 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <button key={link.href} type="button" onClick={() => navigateFromMobile(link.href)}
                  className="text-left text-[2.05rem] font-semibold leading-tight text-white/85 hover:text-white transition-colors">
                  {link.label}
                </button>
              ))}
              {profile ? (
                <>
                  <button type="button" onClick={() => navigateFromMobile(profile.role === 'admin' ? '/admin' : '/dashboard')}
                    className="text-left text-[2.05rem] font-semibold leading-tight text-white/85">
                    Dashboard
                  </button>
                  <button onClick={() => { handleSignOut(); setIsMobileOpen(false) }}
                    className="text-left text-[2.05rem] font-semibold leading-tight text-white/40">
                    Ausloggen
                  </button>
                </>
              ) : null}
            </nav>

            <div className="mt-auto border-t border-white/8 pt-6" />
          </div>
        </div>
      )}
    </>
  )
}
