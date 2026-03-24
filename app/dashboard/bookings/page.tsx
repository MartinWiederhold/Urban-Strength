'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, X, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/lib/types'
import { format, isAfter, startOfDay } from 'date-fns'
import { de } from 'date-fns/locale'

const statusLabel: Record<string, string> = {
  confirmed: 'Bestätigt', cancelled: 'Storniert', completed: 'Abgeschlossen',
  rescheduled: 'Verschoben', no_show: 'Nicht erschienen',
}
const statusColor: Record<string, string> = {
  confirmed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rescheduled: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  no_show: 'text-white/40 bg-white/5 border-white/10',
}

export default function BookingsPage() {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchBookings = async () => {
    if (!profile) return
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('*, services(title, price, duration_minutes)')
      .eq('customer_id', profile.id)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false })
    setBookings((data as Booking[]) ?? [])
    setIsLoading(false)
  }

  useEffect(() => { fetchBookings() }, [profile])

  const today = startOfDay(new Date())
  const filtered = bookings.filter(b => {
    const bookingDate = startOfDay(new Date(b.booking_date))
    if (filter === 'upcoming') return isAfter(bookingDate, today) || bookingDate.getTime() === today.getTime()
    if (filter === 'past') return bookingDate < today
    return true
  })

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Möchtest du diesen Termin wirklich stornieren?')) return
    setCancellingId(bookingId)
    const supabase = createClient()

    // Booking-Details für E-Mail holen
    const booking = bookings.find(b => b.id === bookingId)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)

    // Admin + Kunde benachrichtigen (fire & forget)
    if (booking && profile) {
      const service = (booking as any).services?.title ?? 'Training'
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking_cancelled_admin',
          to: profile.email,
          customerEmail: profile.email,
          name: profile.full_name ?? profile.email,
          service,
          date: booking.booking_date,
          time: booking.start_time,
        }),
      }).catch(() => {})
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking_cancelled_customer',
          to: profile.email,
          name: profile.full_name ?? profile.email,
          service,
          date: booking.booking_date,
          time: booking.start_time,
        }),
      }).catch(() => {})
    }

    await fetchBookings()
    setCancellingId(null)
  }

  return (
    <div>
      <div className="animate-slide-up mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meine Buchungen</h1>
        <p className="text-muted-foreground mt-1">Verwalte deine Trainings-Termine.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['upcoming', 'past', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}
          >
            {f === 'upcoming' ? 'Kommend' : f === 'past' ? 'Vergangen' : 'Alle'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Keine Buchungen gefunden.</p>
          <Link href="/book/probe-training">
            <Button variant="hero" size="sm">Termin buchen</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => {
            const isPast = startOfDay(new Date(booking.booking_date)) < today
            const isCancellable = booking.status === 'confirmed' && !isPast
            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[booking.status]}`}>
                        {statusLabel[booking.status]}
                      </span>
                    </div>
                    <p className="font-semibold">{(booking as any).services?.title ?? 'Training'}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(booking.booking_date), 'EEE, dd. MMM yyyy', { locale: de })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.start_time.slice(0, 5)} Uhr
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Oberer Heuelsteig 30, 8032 Zürich
                      </span>
                    </div>
                  </div>
                  {isCancellable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      Stornieren
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
