'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const statusLabel: Record<string, string> = {
  confirmed: 'Bestätigt', cancelled: 'Storniert', completed: 'Abgeschlossen',
  rescheduled: 'Verschoben', no_show: 'Nicht erschienen',
}
const statusColor: Record<string, string> = {
  confirmed: 'text-primary bg-primary/10 border-primary/20',
  cancelled: 'text-destructive bg-destructive/10 border-destructive/20',
  completed: 'text-green-700 bg-green-50 border-green-200',
  rescheduled: 'text-orange-700 bg-orange-50 border-orange-200',
  no_show: 'text-muted-foreground bg-muted border-border',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchBookings = async () => {
    const supabase = createClient()
    let query = supabase
      .from('bookings')
      .select('*, profiles(full_name, email, phone, customer_status), services(title, price)')
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    setBookings((data as Booking[]) ?? [])
    setIsLoading(false)
  }

  useEffect(() => { fetchBookings() }, [statusFilter])

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId)
    const supabase = createClient()
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    await fetchBookings()
    setUpdatingId(null)
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Buchungen</h1>
        <p className="text-muted-foreground mt-1">Alle Buchungen verwalten und Status ändern.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-white">
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Keine Buchungen gefunden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold text-muted-foreground">Kunde</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Angebot</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Datum &amp; Zeit</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => {
                  const profile = (booking as any).profiles
                  const service = (booking as any).services
                  const isNew = profile?.customer_status === 'new'
                  return (
                    <tr key={booking.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium">{profile?.full_name ?? 'Unbekannt'}</p>
                              {isNew && (
                                <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full font-semibold">
                                  Neu
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{profile?.email ?? '–'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium truncate max-w-[180px]">{service?.title ?? '–'}</p>
                        <p className="text-xs text-muted-foreground">{service?.price === 0 ? 'Gratis' : `CHF ${service?.price}`}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{format(new Date(booking.booking_date), 'dd. MMM yyyy', { locale: de })}</p>
                        <p className="text-xs text-muted-foreground">{booking.start_time.slice(0,5)} Uhr</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[booking.status]}`}>
                          {statusLabel[booking.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {updatingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Select onValueChange={(v) => updateStatus(booking.id, v)} value={booking.status}>
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
                          <Link href={`/admin/customers/${(booking as any).profiles?.id ?? ''}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-8">Profil</Button>
                          </Link>
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
    </div>
  )
}
