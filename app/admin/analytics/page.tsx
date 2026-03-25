'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, Users, Calendar, DollarSign, CheckCircle2, XCircle, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { AnimatedNumber } from '@/components/ui/animated-number'
import type { AnalyticsStats, AnalyticsChartData } from '@/lib/types'

// Recharts (~180 kB) deferred — KPI cards render immediately
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

const STATUS_NAMES: Record<string, string> = {
  confirmed: 'Bestätigt', completed: 'Abgeschlossen', cancelled: 'Storniert',
  no_show: 'Nicht erschienen', rescheduled: 'Verschoben',
}

const EMPTY_STATS: AnalyticsStats = {
  totalRevenue: 0, paidRevenue: 0, totalBookings: 0, totalCustomers: 0,
  paidCount: 0, unpaidCount: 0, avgRevenue: 0, conversionRate: 0,
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [stats, setStats] = useState<AnalyticsStats>(EMPTY_STATS)
  const [chartData, setChartData] = useState<AnalyticsChartData | null>(null)

  useEffect(() => {
    const load = async () => {
      const t0 = performance.now()
      const supabase = createClient()

      // Single RPC call — DB does all aggregation server-side
      const { data, error } = await supabase.rpc('get_analytics_summary')

      if (error) {
        console.error('[Analytics] RPC error:', error)
        setLoadError(`Fehler beim Laden: ${error.message}`)
        setIsLoading(false)
        return
      }

      const r    = data as Record<string, any>
      const kpis = r.kpis as Record<string, number>

      const conv = kpis.probe_count > 0
        ? Math.round((kpis.paid_service_count / kpis.probe_count) * 100)
        : 0

      setStats({
        totalRevenue:   Number(kpis.total_revenue),
        paidRevenue:    Number(kpis.paid_revenue),
        totalBookings:  Number(kpis.total_bookings),
        totalCustomers: Number(kpis.total_customers),
        paidCount:      Number(kpis.paid_count),
        unpaidCount:    Math.max(0, Number(kpis.payable_count) - Number(kpis.paid_count)),
        avgRevenue:     Number(kpis.avg_revenue),
        conversionRate: conv,
      })

      // Month labels: ISO string 'YYYY-MM' → German abbreviation
      const monthly = (r.monthly as any[]).map((m: any) => ({
        month:    format(parseISO(m.month_iso + '-01'), 'MMM', { locale: de }),
        bookings: Number(m.bookings),
        revenue:  Number(m.revenue),
      }))

      // Week labels: ISO string 'YYYY-MM-DD' → German short date
      const weekly = (r.weekly as any[]).map((w: any) => ({
        week:    format(parseISO(w.week_iso), 'dd.MM.', { locale: de }),
        revenue: Number(w.revenue),
      }))

      const statusArr = Object.entries(r.status_dist as Record<string, number>).map(([k, v]) => ({
        name: STATUS_NAMES[k] ?? k, value: v,
      }))

      const sourceArr = Object.entries(r.source_dist as Record<string, number>).map(([k, v]) => ({
        name: k, value: v,
      }))

      const serviceRevArr = (r.service_rev as any[]).map((s: any) => ({
        name: s.name, revenue: Number(s.revenue), count: Number(s.count),
      }))

      const payArr = [
        { name: 'Bezahlt', value: Number(kpis.paid_count) },
        { name: 'Offen',   value: Math.max(0, Number(kpis.payable_count) - Number(kpis.paid_count)) },
      ]

      setChartData({
        monthlyData: monthly, weeklyData: weekly, statusData: statusArr,
        sourceData: sourceArr, serviceRevData: serviceRevArr, paymentData: payArr,
      })

      console.debug(`[Analytics] loaded in ${Math.round(performance.now() - t0)}ms`)
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

      {loadError && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          ⚠ {loadError}
        </div>
      )}

      {/* KPI cards — render immediately; charts deferred */}
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

      {chartData && <AnalyticsCharts data={chartData} />}
    </div>
  )
}
