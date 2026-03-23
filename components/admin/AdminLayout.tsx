'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Users, Clock,
  MessageCircle, BarChart2, LogOut, ChevronRight,
  Menu, X, Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { href: '/admin', label: 'Übersicht', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Buchungen', icon: Calendar },
  { href: '/admin/customers', label: 'Kunden (CRM)', icon: Users },
  { href: '/admin/availability', label: 'Verfügbarkeit', icon: Clock },
  { href: '/admin/chat', label: 'Chat', icon: MessageCircle },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) return
    if (!isLoading) {
      if (!profile) router.push('/admin/login')
      else if (profile.role !== 'admin') router.push('/dashboard')
    }
  }, [isLoading, profile, router, isLoginPage])

  useEffect(() => {
    if (isLoginPage) return
    const t = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(t)
  }, [isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (isLoading || !profile || profile.role !== 'admin') {
    if (timedOut) {
      window.location.href = '/admin/login'
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-background" />
          </div>
          <div>
            <p className="font-semibold text-sm tracking-tight text-foreground">Personal Training</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-secondary/50">
          <div className="w-8 h-8 rounded-full bg-foreground/10 border border-border flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{profile.full_name ?? 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{profile.email}</p>
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

      {/* Footer */}
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
        <p className="font-semibold text-sm tracking-tight">Admin Dashboard</p>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col shadow-strong"
          >
            <NavContent />
          </motion.div>
          <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
        </>
      )}

      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
