'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
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

      if (currentY <= 8) {
        setNavVisible(true)
        lastScrollYRef.current = currentY
        return
      }
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
    if (!window.matchMedia('(max-width: 767px)').matches) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
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
    mobileNavTimeoutRef.current = setTimeout(() => {
      window.location.href = href
    }, 620)
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={{ opacity: navVisible ? 1 : 0, y: navVisible ? 0 : -8 }}
        transition={{ duration: 0.2, ease: 'linear' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-250 ${
          navVisible ? 'pointer-events-auto' : 'pointer-events-none'
        } ${
          isScrolled
            ? 'bg-[#F6F5F1] border-b border-black/10'
            : 'bg-[#F6F5F1] border-b border-black/[0.04]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="relative flex items-center justify-between" style={{ height: '4.2rem' }}>

            {/* Logo */}
            <Link href="/" className="flex flex-col group">
              <span className="text-[1.1rem] font-semibold uppercase tracking-tight text-[#161616] group-hover:opacity-70 transition-opacity">
                Personal Training Zurich
              </span>
              <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-black/50">
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
                        ? 'bg-black text-white'
                        : 'text-black/70 hover:text-black'
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
                    className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black/10 hover:border-black/20 transition-all relative"
                  >
                    <User className="w-4 h-4 text-black/70" />
                  </button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 min-w-[180px] bg-white rounded-xl shadow-lg border border-black/5 py-2 z-50"
                      >
                        {profile.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-black/70 hover:text-black hover:bg-[#F7F7F7] transition-all duration-200"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-black/70 hover:text-black hover:bg-[#F7F7F7] transition-all duration-200"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Mein Dashboard
                        </Link>
                        <div className="border-t border-black/5 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-[#F7F7F7] transition-all duration-200 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Ausloggen
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-black/70 hover:text-black transition-colors"
                  >
                    Einloggen
                  </Link>
                  <Link
                    href="/book/probe-training"
                    className="inline-flex h-10 items-center rounded-full bg-black px-5 text-[13px] font-semibold tracking-tight text-white hover:bg-black/80 transition-colors"
                  >
                    Kostenlos buchen
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Right: Kontakt + Hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/kontakt"
                className="inline-flex h-10 items-center rounded-full bg-black px-5 text-[14px] font-semibold tracking-tight text-white"
              >
                Kontakt
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center"
                aria-label={isMobileOpen ? 'Menü schliessen' : 'Menü öffnen'}
              >
                <span
                  className={`absolute h-[2px] w-6 bg-black transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isMobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-[5px]'
                  }`}
                />
                <span
                  className={`absolute h-[2px] w-6 bg-black transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isMobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[5px]'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[80] bg-black md:hidden overscroll-none"
          >
            <div className="flex h-full flex-col px-4 pb-8 pt-5">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between" style={{ height: '4.2rem' }}>
                <button
                  type="button"
                  onClick={() => navigateFromMobile('/')}
                  className="flex flex-col"
                >
                  <span className="text-[1.1rem] font-semibold uppercase tracking-tight text-white">
                    Personal Training Zurich
                  </span>
                  <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/50">
                    by Martin
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateFromMobile('/kontakt')}
                    className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[14px] font-semibold tracking-tight text-black"
                  >
                    Kontakt
                  </button>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="relative flex h-10 w-10 items-center justify-center"
                    aria-label="Menü schliessen"
                  >
                    <span className="absolute h-[2px] w-6 bg-white translate-y-0 rotate-45 transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
                    <span className="absolute h-[2px] w-6 bg-white translate-y-0 -rotate-45 transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  </button>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="mt-12 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => navigateFromMobile(link.href)}
                    className="text-left text-[2.05rem] font-semibold leading-tight text-white/90 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                ))}

                {profile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigateFromMobile(profile.role === 'admin' ? '/admin' : '/dashboard')}
                      className="text-left text-[2.05rem] font-semibold leading-tight text-white/90"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { handleSignOut(); setIsMobileOpen(false) }}
                      className="text-left text-[2.05rem] font-semibold leading-tight text-white/50"
                    >
                      Ausloggen
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigateFromMobile('/login')}
                    className="text-left text-[2.05rem] font-semibold leading-tight text-white/90"
                  >
                    Einloggen
                  </button>
                )}
              </nav>

              <div className="mt-auto border-t border-white/10 pt-6" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
