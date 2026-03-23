'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Users, TrendingUp, Clock, ChevronRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const statusColor: Record<string, string> = {
  confirmed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rescheduled: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  no_show: 'text-white/40 bg-white/5 border-white/10',
}
const statusLabel: Record<string, string> = {
  confirmed: 'Bestätigt', cancelled: 'Storniert', completed: 'Abgeschlossen',
  rescheduled: 'Verschoben', no_show: 'Nicht erschienen',
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ totalBookings: 0, todayBookings: 0, totalCustomers: 0, newCustomers: 0 })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const today = format(new Date(), 'yyyy-MM-dd')

      const [totalB, todayB, totalC, newC, recent] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('booking_date', today),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer').eq('customer_status', 'new'),
        supabase.from('bookings')
          .select('*, profiles(full_name, email), services(title)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setStats({
        totalBookings: totalB.count ?? 0,
        todayBookings: todayB.count ?? 0,
        totalCustomers: totalC.count ?? 0,
        newCustomers: newC.count ?? 0,
      })
      setRecentBookings((recent.data as Booking[]) ?? [])
      setIsLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Buchungen gesamt', value: stats.totalBookings, icon: Calendar, href: '/admin/bookings' },
    { label: 'Heute', value: stats.todayBookings, icon: Clock, href: '/admin/bookings' },
    { label: 'Kunden gesamt', value: stats.totalCustomers, icon: Users, href: '/admin/customers' },
    { label: 'Neue Kunden', value: stats.newCustomers, icon: Star, href: '/admin/customers' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Übersicht</h1>
        <p className="text-muted-foreground mt-1">{format(new Date(), 'EEEE, dd. MMMM yyyy', { locale: de })}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
            <Link href={card.href}>
              <div className="bg-card rounded-xl border border-border p-4 hover:border-foreground/20 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
                  <div className="p-1.5 bg-secondary rounded-lg">
                    <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-2xl font-semibold tracking-tight">
                  {isLoading ? <span className="animate-pulse text-muted-foreground">–</span> : card.value}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Neue Buchungen</h2>
          <Link href="/admin/bookings" className="text-sm text-primary hover:underline flex items-center gap-1">
            Alle ansehen <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Noch keine Buchungen.</div>
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 gap-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{(booking as any).profiles?.full_name ?? 'Unbekannt'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(booking as any).services?.title ?? '–'} · {format(new Date(booking.booking_date), 'dd. MMM', { locale: de })} {booking.start_time.slice(0,5)} Uhr
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColor[booking.status]}`}>
                      {statusLabel[booking.status]}
                    </span>
                    <Link href={`/admin/bookings`} className="text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
