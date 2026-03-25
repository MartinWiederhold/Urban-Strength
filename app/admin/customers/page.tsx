'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, Users, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const statusLabel: Record<string, string> = {
  new: 'Neu', active: 'Aktiv', inactive: 'Inaktiv', vip: 'VIP',
}
const statusColor: Record<string, string> = {
  new: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  inactive: 'text-white/40 bg-white/5 border-white/10',
  vip: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, customer_status, created_at, role')
          .eq('role', 'customer')
          .order('created_at', { ascending: false })
        if (error) {
          console.error('[Admin Customers] fetch error:', error)
          setLoadError(`Fehler: ${error.message}`)
        } else {
          setCustomers((data as Profile[]) ?? [])
        }
      } catch (err) {
        console.error('[Admin Customers] unexpected error:', err)
        setLoadError('Verbindungsfehler. Prüfe die Supabase-Verbindung.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => customers.filter(c =>
    !search ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  ), [customers, search])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of customers) {
      counts[c.customer_status] = (counts[c.customer_status] ?? 0) + 1
    }
    return counts
  }, [customers])

  return (
    <div>
      <div className="animate-slide-up mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kunden (CRM)</h1>
        <p className="text-muted-foreground mt-1">Alle Kunden verwalten und einsehen.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, E-Mail oder Telefon..." className="pl-9" />
      </div>

      {loadError && (
        <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          ⚠ {loadError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['new', 'active', 'inactive', 'vip'] as const).map(s => {
          const count = statusCounts[s] ?? 0
          return (
            <div key={s} className="bg-card rounded-xl border border-border p-4 text-center hover:border-foreground/20 transition-all duration-200">
              <p className="text-2xl font-semibold tracking-tight mb-1">{count}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor[s]}`}>{statusLabel[s]}</span>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Keine Kunden gefunden.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Kunde</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Telefon</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Registriert</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{customer.full_name ?? '–'}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{customer.phone ?? '–'}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[customer.customer_status]}`}>
                        {statusLabel[customer.customer_status]}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">
                      {format(new Date(customer.created_at), 'dd. MMM yyyy', { locale: de })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs">Detail</Button>
                        </Link>
                        <Link href={`/admin/chat/${customer.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
