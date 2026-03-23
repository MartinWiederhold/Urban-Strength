'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, MessageCircle, ClipboardList, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/lib/types'
import { format, isAfter } from 'date-fns'
import { de } from 'date-fns/locale'

const statusLabel: Record<string, string> = {
  confirmed: 'Bestätigt',
  cancelled: 'Storniert',
  completed: 'Abgeschlossen',
  rescheduled: 'Verschoben',
  no_show: 'Nicht erschienen',
}

const statusColor: Record<string, string> = {
  confirmed: 'text-primary bg-primary/10',
  cancelled: 'text-destructive bg-destructive/10',
  completed: 'text-green-600 bg-green-50',
  rescheduled: 'text-orange-600 bg-orange-50',
  no_show: 'text-muted-foreground bg-muted',
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [nextBooking, setNextBooking] = useState<Booking | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [planCount, setPlanCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      const supabase = createClient()
      const today = format(new Date(), 'yyyy-MM-dd')

      const [bookingsRes, unreadRes, plansRes] = await Promise.all([
        supabase.from('bookings').select('*, services(title, price, duration_minutes)')
          .eq('customer_id', profile.id)
          .eq('status', 'confirmed')
          .gte('booking_date', today)
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(1),
        supabase.from('chat_messages').select('id', { count: 'exact' })
          .eq('receiver_id', profile.id)
          .eq('is_read', false),
        supabase.from('training_plans').select('id', { count: 'exact' })
          .eq('customer_id', profile.id)
          .eq('is_active', true),
      ])

      setNextBooking(bookingsRes.data?.[0] ?? null)
      setUnreadCount(unreadRes.count ?? 0)
      setPlanCount(plansRes.count ?? 0)
      setIsLoading(false)
    }
    load()
  }, [profile])

  const quickActions = [
    { href: '/book/probe-training', label: 'Neuen Termin buchen', icon: Calendar, color: 'bg-primary/10 text-primary' },
    { href: '/dashboard/chat', label: 'Chat öffnen', icon: MessageCircle, color: 'bg-blue-50 text-blue-600', badge: unreadCount },
    { href: '/dashboard/plans', label: 'Trainingspläne', icon: ClipboardList, color: 'bg-secondary text-foreground', badge: planCount },
  ]

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Willkommen, {profile?.full_name?.split(' ')[0] ?? 'Kunde'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Hier ist deine Übersicht.</p>
      </motion.div>

      {/* Next Booking */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Nächster Termin</h2>
        {isLoading ? (
          <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        ) : nextBooking ? (
          <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{(nextBooking as any).services?.title ?? 'Training'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(nextBooking.booking_date), 'EEEE, dd. MMMM yyyy', { locale: de })} · {nextBooking.start_time.slice(0, 5)} Uhr
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor[nextBooking.status]}`}>
              {statusLabel[nextBooking.status]}
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-muted-foreground text-sm mb-3">Kein kommender Termin.</p>
            <Link href="/book/probe-training">
              <Button variant="hero" size="sm">Jetzt buchen</Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Schnellaktionen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="rounded-xl border border-border bg-card p-4 hover:shadow-soft transition-all hover:-translate-y-0.5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{action.label}</p>
                  {action.badge ? (
                    <p className="text-xs text-primary">{action.badge} neu</p>
                  ) : null}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
