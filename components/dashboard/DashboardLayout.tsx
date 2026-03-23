'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, User, MessageCircle,
  ClipboardList, LogOut, ChevronRight, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Übersicht', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings', label: 'Meine Buchungen', icon: Calendar },
  { href: '/dashboard/profile', label: 'Mein Profil', icon: User },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
  { href: '/dashboard/plans', label: 'Meine Pläne', icon: ClipboardList },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading && !profile) router.push('/login')
  }, [isLoading, profile, router])

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(t)
  }, [])

  if (isLoading) {
    if (timedOut) {
      window.location.href = '/login'
      return null
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-background" />
          </div>
          <div>
            <p className="font-semibold text-sm tracking-tight">Personal Training</p>
            <p className="text-xs text-muted-foreground">by Martin</p>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-secondary/50">
          <div className="w-8 h-8 rounded-full bg-foreground/10 border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{profile?.full_name ?? 'Kein Name'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.12em] px-3 mb-3">Navigation</p>
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
          ← Zur Website
        </Link>
        <button
          onClick={() => { signOut(); router.push('/') }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          Ausloggen
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <p className="font-semibold text-sm tracking-tight">Personal Training</p>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="md:hidden fixed inset-0 z-50 bg-card flex flex-col w-72 border-r border-border shadow-strong"
        >
          <NavContent />
        </motion.div>
      )}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="p-6 md:p-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  )
}
