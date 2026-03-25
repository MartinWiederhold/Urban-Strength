'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/lib/types'
import { getBookingAgeLabel, getBookingCustomerDisplayName } from '@/lib/booking-display'
import { format } from 'date-fns'
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

function calcAmount(service: any): number {
  if (!service || service.price === 0) return 0
  return Number(service.price)
}

export default function AdminBookingsPage() {
  const PAGE_SIZE = 25

  const [bookings, setBookings]     = useState<Booking[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [loadError, setLoadError]   = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [page, setPage]             = useState(0)
  const [hasMore, setHasMore]       = useState(false)

  const fetchBookings = async (pageNum = 0, filter = statusFilter) => {
    try {
      const supabase = createClient()
      let query = supabase
        .from('bookings')
        .select('*, profiles(id, full_name, email, phone, customer_status), services(title, price, duration_minutes)')
        .order('booking_date', { ascending: false })
        .order('start_time',   { ascending: false })
        .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE)
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) {
        console.error('[Admin Bookings] fetch error:', error)
        setLoadError(`Fehler: ${error.message}`)
      } else {
        setLoadError(null)
        const rows = (data as Booking[]) ?? []
        const hasMoreItems = rows.length === PAGE_SIZE + 1
        // Slice before setState — never mutate after passing to React
        const displayRows = hasMoreItems ? rows.slice(0, PAGE_SIZE) : rows
        setHasMore(hasMoreItems)
        setBookings(prev => pageNum === 0 ? displayRows : [...prev, ...displayRows])
      }
    } catch (err) {
      console.error('[Admin Bookings] unexpected error:', err)
      setLoadError('Verbindungsfehler. Prüfe die Supabase-Verbindung.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { setPage(0); fetchBookings(0, statusFilter) }, [statusFilter])

  const updateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    setUpdatingId(bookingId)
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))

      // Send customer email for every status change except no_show
      if (newStatus !== 'no_show') {
        const booking = bookings.find(b => b.id === bookingId)
        if (booking) {
          const profile  = (booking as any).profiles
          const service  = (booking as any).services
          const customerEmail = booking.customer_email ?? profile?.email
          const firstName = booking.first_name ?? profile?.full_name?.split(' ')[0] ?? 'du'

          const emailTypeMap: Partial<Record<Booking['status'], string>> = {
            confirmed:   'status_confirmed_customer',
            completed:   'status_completed_customer',
            cancelled:   'status_cancelled_customer',
            rescheduled: 'status_rescheduled_customer',
          }
          const emailType = emailTypeMap[newStatus]

          if (emailType && customerEmail) {
            fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: emailType,
                to: customerEmail,
                name: firstName,
                service: service?.title ?? 'Personal Training',
                date: booking.booking_date,
                time: booking.start_time,
              }),
            }).catch(err => console.error('[Bookings] status email error:', err))
          }
        }
      }
    }
    setUpdatingId(null)
  }

  const togglePaid = async (booking: Booking) => {
    setTogglingId(booking.id)
    const supabase = createClient()
    const service = (booking as any).services
    const nowPaid = !(booking.paid ?? false)
    const updates = { paid: nowPaid, paid_amount: nowPaid ? calcAmount(service) : 0 }
    const { error } = await supabase.from('bookings').update(updates).eq('id', booking.id)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, ...updates } : b))
    }
    setTogglingId(null)
  }

  return (
    <div>
      <div className="animate-slide-up mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Buchungen</h1>
        <p className="text-muted-foreground mt-1">Buchungen verwalten, Status und Bezahlung tracken.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="confirmed">Bestätigt</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="cancelled">Storniert</SelectItem>
            <SelectItem value="no_show">Nicht erschienen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loadError && (
        <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          ⚠ {loadError}
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Keine Buchungen gefunden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Kunde</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Angebot</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Datum &amp; Zeit</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Bezahlung</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking, i) => {
                  const profile  = (booking as any).profiles
                  const service  = (booking as any).services
                  const isNew    = profile?.customer_status === 'new'
                  const isPaid   = booking.paid ?? false
                  const amount   = booking.paid_amount ?? calcAmount(service)
                  const isFree   = service?.price === 0

                  const displayName = getBookingCustomerDisplayName(booking as Booking)
                  const ageLabel = getBookingAgeLabel(booking)
                  const displayEmail = profile?.email ?? booking.customer_email ?? '–'
                  const isAnon = !booking.customer_id

                  return (
                    <tr key={booking.id} className="hover:bg-secondary/30 transition-colors animate-in" style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      {/* Kunde */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium">
                            {displayName}
                            {ageLabel && (
                              <span className="text-muted-foreground font-normal"> · {ageLabel}</span>
                            )}
                          </p>
                          {isNew && (
                            <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-semibold">Neu</span>
                          )}
                          {isAnon && (
                            <span className="text-xs bg-secondary text-muted-foreground border border-border px-1.5 py-0.5 rounded-full font-semibold">Gast</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{displayEmail}</p>
                        {booking.customer_phone && <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>}
                      </td>

                      {/* Angebot */}
                      <td className="p-4">
                        <p className="font-medium truncate max-w-[160px]">{service?.title ?? '–'}</p>
                        <p className="text-xs text-muted-foreground">
                          {isFree ? 'Gratis' : `CHF ${calcAmount(service).toFixed(2)}`} · {service?.duration_minutes ?? '?'} Min.
                        </p>
                      </td>

                      {/* Datum */}
                      <td className="p-4">
                        <p className="font-medium">{format(new Date(booking.booking_date), 'dd. MMM yyyy', { locale: de })}</p>
                        <p className="text-xs text-muted-foreground">{booking.start_time.slice(0,5)} Uhr</p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[booking.status]}`}>
                          {statusLabel[booking.status]}
                        </span>
                      </td>

                      {/* Bezahlung */}
                      <td className="p-4">
                        {isFree ? (
                          <span className="text-xs text-muted-foreground/50">Gratis</span>
                        ) : togglingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <button
                            onClick={() => togglePaid(booking)}
                            className={[
                              'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all',
                              isPaid
                                ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20'
                                : 'text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20',
                            ].join(' ')}
                          >
                            {isPaid
                              ? <><CheckCircle2 className="w-3 h-3" /> CHF {(booking.paid_amount ?? calcAmount(service)).toFixed(2)}</>
                              : <><XCircle className="w-3 h-3" /> Offen</>
                            }
                          </button>
                        )}
                      </td>

                      {/* Aktionen */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {updatingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Select onValueChange={(v) => updateStatus(booking.id, v as Booking['status'])} value={booking.status}>
                              <SelectTrigger className="h-8 text-xs w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Bestätigt</SelectItem>
                                <SelectItem value="completed">Abgeschlossen</SelectItem>
                                <SelectItem value="cancelled">Storniert</SelectItem>
                                <SelectItem value="rescheduled">Verschoben</SelectItem>
                                <SelectItem value="no_show">Nicht erschienen</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {profile?.id && (
                            <Link href={`/admin/customers/${profile.id}`}>
                              <Button variant="ghost" size="sm" className="text-xs h-8">Profil</Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => { const next = page + 1; setPage(next); fetchBookings(next) }}>
            Mehr laden
          </Button>
        </div>
      )}
    </div>
  )
}
