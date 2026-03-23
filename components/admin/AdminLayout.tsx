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

  useEffect(() => {
    if (!isLoading) {
      if (!profile) router.push('/admin/login')
      else if (profile.role !== 'admin') router.push('/dashboard')
    }
  }, [isLoading, profile, router])

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(t)
  }, [])

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
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Admin</span>
        </div>
        <p className="font-bold text-white text-base tracking-tight">Personal Training Zurich</p>
        <p className="text-xs text-white/50">by Martin</p>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile.full_name ?? 'Admin'}</p>
            <p className="text-xs text-white/40 truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors mb-1">
          ← Zur Website
        </Link>
        <button
          onClick={() => { signOut(); router.push('/') }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Ausloggen
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[hsl(0,0%,97%)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[hsl(0,0%,11%)] fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[hsl(0,0%,11%)] px-4 h-14 flex items-center justify-between">
        <p className="font-bold text-sm text-white">Admin Dashboard</p>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
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
            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[hsl(0,0%,11%)] flex flex-col shadow-strong"
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
