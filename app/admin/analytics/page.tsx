'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, Users, Calendar, DollarSign, CheckCircle2, XCircle, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'
import { AnimatedNumber } from '@/components/ui/animated-number'

// Lazy-load heavy Recharts bundle — not needed for initial KPI render
const AnalyticsCharts = dynamic(() => import('./AnalyticsCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 h-[300px] animate-pulse" />
      ))}
    </div>
  ),
})

interface Stats {
  totalRevenue: number
  paidRevenue: number
  totalBookings: number
  totalCustomers: number
  paidCount: number
  unpaidCount: number
  avgRevenue: number
  conversionRate: number
}

export interface ChartData {
  monthlyData: Array<{ month: string; bookings: number; revenue: number }>
  weeklyData: Array<{ week: string; revenue: number }>
  statusData: Array<{ name: string; value: number }>
  sourceData: Array<{ name: string; value: number }>
  serviceRevData: Array<{ name: string; revenue: number; count: number }>
  paymentData: Array<{ name: string; value: number }>
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, paidRevenue: 0, totalBookings: 0, totalCustomers: 0,
    paidCount: 0, unpaidCount: 0, avgRevenue: 0, conversionRate: 0,
  })
  const [chartData, setChartData] = useState<ChartData | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      // Bounded query: only last 6 months (max window shown in any chart)
      const sixMonthsAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd')

      const [bookingsRes, customersRes] = await Promise.all([
        supabase.from('bookings')
          .select('booking_date, status, paid, paid_amount, how_found_us, customer_id, services(price, title, duration_minutes)')
          .gte('booking_date', sixMonthsAgo)
          .order('booking_date', { ascending: true }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
      ])

      const bookings       = bookingsRes.data ?? []
      const totalCustomers = customersRes.count ?? 0

      // ── Payment stats ──────────────────────────────────────────────────
      const paidBookings   = bookings.filter((b: any) => b.paid)
      const payableCount   = bookings.filter((b: any) => (b.services?.price ?? 0) > 0).length
      const paidRevenue    = paidBookings.reduce((s: number, b: any) => s + (b.paid_amount ?? 0), 0)
      const avgRevenue     = paidBookings.length > 0 ? paidRevenue / paidBookings.length : 0
      const completedBookings = bookings.filter((b: any) => b.status === 'completed')
      const totalRevenue   = completedBookings.reduce((s: number, b: any) => s + (b.services?.price ?? 0), 0)
      const probeCount     = bookings.filter((b: any) => b.services?.price === 0).length
      const paidCount2     = bookings.filter((b: any) => (b.services?.price ?? 0) > 0).length
      const conv           = probeCount > 0 ? Math.round((paidCount2 / probeCount) * 100) : 0

      setStats({
        totalRevenue:   Math.round(totalRevenue  * 100) / 100,
        paidRevenue:    Math.round(paidRevenue   * 100) / 100,
        totalBookings:  bookings.length,
        totalCustomers,
        paidCount:      paidBookings.length,
        unpaidCount:    Math.max(0, payableCount - paidBookings.length),
        avgRevenue:     Math.round(avgRevenue    * 100) / 100,
        conversionRate: conv,
      })

      // ── Chart aggregations (deferred to after KPIs render) ─────────────
      const monthly = []
      for (let i = 5; i >= 0; i--) {
        const month    = subMonths(new Date(), i)
        const monthStr = format(month, 'yyyy-MM')
        const mb       = bookings.filter((b: any) => b.booking_date?.startsWith(monthStr))
        const mRev     = mb.filter((b: any) => b.paid).reduce((s: number, b: any) => s + (b.paid_amount ?? 0), 0)
        monthly.push({ month: format(month, 'MMM', { locale: de }), bookings: mb.length, revenue: Math.round(mRev * 100) / 100 })
      }

      const weekly = []
      for (let i = 7; i >= 0; i--) {
        const ws   = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 })
        const we   = endOfWeek(ws, { weekStartsOn: 1 })
        const wsStr = format(ws, 'yyyy-MM-dd')
        const weStr = format(we, 'yyyy-MM-dd')
        const wb   = bookings.filter((b: any) => b.booking_date >= wsStr && b.booking_date <= weStr)
        const wRev = wb.filter((b: any) => b.paid).reduce((s: number, b: any) => s + (b.paid_amount ?? 0), 0)
        weekly.push({ week: format(ws, 'dd.MM.', { locale: de }), revenue: Math.round(wRev * 100) / 100 })
      }

      const statusCount: Record<string, number> = {}
      bookings.forEach((b: any) => { statusCount[b.status] = (statusCount[b.status] ?? 0) + 1 })
      const statusNames: Record<string, string> = {
        confirmed: 'Bestätigt', completed: 'Abgeschlossen', cancelled: 'Storniert',
        no_show: 'Nicht erschienen', rescheduled: 'Verschoben',
      }
      const statusArr = Object.entries(statusCount).map(([k, v]) => ({ name: statusNames[k] ?? k, value: v }))

      const sourceCount: Record<string, number> = {}
      bookings.forEach((b: any) => { const src = b.how_found_us ?? 'Unbekannt'; sourceCount[src] = (sourceCount[src] ?? 0) + 1 })
      const sourceArr = Object.entries(sourceCount).map(([k, v]) => ({ name: k, value: v }))

      const serviceMap: Record<string, { revenue: number; count: number }> = {}
      bookings.filter((b: any) => b.paid).forEach((b: any) => {
        const title = b.services?.title ?? 'Unbekannt'
        if (!serviceMap[title]) serviceMap[title] = { revenue: 0, count: 0 }
        serviceMap[title].revenue += b.paid_amount ?? 0
        serviceMap[title].count++
      })
      const serviceRevArr = Object.entries(serviceMap).map(([name, v]) => ({ name, revenue: Math.round(v.revenue * 100) / 100, count: v.count }))

      const payArr = [
        { name: 'Bezahlt', value: paidBookings.length },
        { name: 'Offen',   value: Math.max(0, payableCount - paidBookings.length) },
      ]

      setChartData({ monthlyData: monthly, weeklyData: weekly, statusData: statusArr, sourceData: sourceArr, serviceRevData: serviceRevArr, paymentData: payArr })
      setIsLoading(false)
    }
    load()
  }, [])

  const kpiCards = [
    { label: 'Bezahlter Umsatz', value: stats.paidRevenue,     prefix: 'CHF ', decimals: 2, icon: DollarSign },
    { label: 'Buchungen gesamt', value: stats.totalBookings,    icon: Calendar },
    { label: 'Kunden',           value: stats.totalCustomers,   icon: Users },
    { label: 'Conversion',       value: stats.conversionRate,   suffix: '%',    icon: TrendingUp },
    { label: 'Bezahlt',          value: stats.paidCount,        icon: CheckCircle2 },
    { label: 'Offen',            value: stats.unpaidCount,      icon: XCircle },
    { label: 'Ø pro Buchung',    value: stats.avgRevenue,       prefix: 'CHF ', decimals: 2, icon: BarChart2 },
  ]

  return (
    <div>
      <div className="animate-slide-up mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Buchungen, Kunden und Umsatz im Überblick.</p>
      </div>

      {/* KPI cards — render immediately, charts lazy-load after */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-4 hover:border-foreground/20 transition-all duration-200 card-hover">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
              <div className="p-1.5 bg-secondary rounded-lg shrink-0">
                <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              {isLoading
                ? <span className="animate-pulse text-muted-foreground">–</span>
                : <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix} decimals={card.decimals ?? 0} />
              }
            </p>
          </div>
        ))}
      </div>

      {/* Charts — lazily loaded to keep initial bundle small */}
      {chartData && <AnalyticsCharts data={chartData} />}
    </div>
  )
}
