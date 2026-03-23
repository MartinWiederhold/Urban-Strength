'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getProfile()
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    setIsUserMenuOpen(false)
  }

  const isHeroPage = pathname === '/'

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || !isHeroPage
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-soft'
            : 'bg-transparent'
        }`}
      >
        <div className="container-max px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex flex-col group">
              <span className={`text-lg font-bold tracking-tight transition-colors ${
                isScrolled || !isHeroPage ? 'text-foreground' : 'text-white'
              } group-hover:text-primary`}>
                Personal Training Zurich
              </span>
              <span className={`text-xs font-medium tracking-wide transition-colors ${
                isScrolled || !isHeroPage ? 'text-muted-foreground' : 'text-white/70'
              }`}>
                by Martin
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : isScrolled || !isHeroPage
                        ? 'text-foreground/80 hover:text-foreground hover:bg-muted'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-3">
              {profile ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isScrolled || !isHeroPage
                        ? 'text-foreground hover:bg-muted'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{profile.full_name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-52 bg-background border border-border rounded-lg shadow-medium overflow-hidden"
                      >
                        {profile.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors"
                          >
                            <Shield className="w-4 h-4 text-primary" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-primary" />
                          Mein Dashboard
                        </Link>
                        <div className="border-t border-border" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors w-full text-left"
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
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={isScrolled || !isHeroPage ? '' : 'text-white hover:bg-white/10 hover:text-white'}
                    >
                      Einloggen
                    </Button>
                  </Link>
                  <Link href="/book/probe-training">
                    <Button size="sm" variant="hero">
                      Kostenlos buchen
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-md transition-colors ${
                isScrolled || !isHeroPage ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Menü öffnen"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background flex flex-col pt-20"
          >
            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                      pathname === link.href ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-6 flex flex-col gap-3">
                {profile ? (
                  <>
                    {profile.role === 'admin' && (
                      <Link href="/admin" onClick={() => setIsMobileOpen(false)}>
                        <Button variant="outline" className="w-full" size="lg">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Link href="/dashboard" onClick={() => setIsMobileOpen(false)}>
                      <Button variant="outline" className="w-full" size="lg">
                        <LayoutDashboard className="w-4 h-4" />
                        Mein Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full text-destructive" size="lg">
                      <LogOut className="w-4 h-4" />
                      Ausloggen
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                      <Button variant="outline" className="w-full" size="lg">
                        Einloggen
                      </Button>
                    </Link>
                    <Link href="/book/probe-training" onClick={() => setIsMobileOpen(false)}>
                      <Button variant="hero" className="w-full" size="lg">
                        Kostenlos buchen
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
