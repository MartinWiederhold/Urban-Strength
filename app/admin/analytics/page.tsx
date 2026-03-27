'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, Users, Calendar, DollarSign, CheckCircle2, XCircle, BarChart2, Globe, Eye, UserCheck, MonitorSmartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, subDays, startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import { AnimatedNumber } from '@/components/ui/animated-number'
import type { AnalyticsStats, AnalyticsChartData } from '@/lib/types'
import type { VisitorChartData } from './VisitorCharts'

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

const VisitorCharts = dynamic(() => import('./VisitorCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {[1, 2].map(i => (
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

interface VisitorStats {
  today: number
  todayUnique: number
  week: number
  weekUnique: number
  month: number
  monthUnique: number
}

const EMPTY_VISITOR: VisitorStats = { today: 0, todayUnique: 0, week: 0, weekUnique: 0, month: 0, monthUnique: 0 }

/** Parse referrer into a readable source name */
function parseReferrer(ref: string | null): string {
  if (!ref) return 'Direkt'
  try {
    const host = new URL(ref).hostname.replace('www.', '')
    if (host.includes('google')) return 'Google'
    if (host.includes('instagram')) return 'Instagram'
    if (host.includes('facebook') || host.includes('fb.')) return 'Facebook'
    if (host.includes('tiktok')) return 'TikTok'
    if (host.includes('linkedin')) return 'LinkedIn'
    if (host.includes('twitter') || host.includes('x.com')) return 'X / Twitter'
    if (host.includes('whatsapp') || host.includes('wa.me')) return 'WhatsApp'
    if (host.includes('bing')) return 'Bing'
    if (host.includes('personaltrainingbymartin')) return 'Direkt'
    return host
  } catch {
    return ref.slice(0, 40)
  }
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [stats, setStats] = useState<AnalyticsStats>(EMPTY_STATS)
  const [chartData, setChartData] = useState<AnalyticsChartData | null>(null)

  const [visitorLoading, setVisitorLoading] = useState(true)
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(EMPTY_VISITOR)
  const [visitorChartData, setVisitorChartData] = useState<VisitorChartData | null>(null)

  // ── Load booking analytics (existing) ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const t0 = performance.now()
      const supabase = createClient()

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

      const monthly = (r.monthly as any[]).map((m: any) => ({
        month:    format(parseISO(m.month_iso + '-01'), 'MMM', { locale: de }),
        bookings: Number(m.bookings),
        revenue:  Number(m.revenue),
      }))

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

  // ── Load visitor analytics ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const now = new Date()
      const todayStart = startOfDay(now).toISOString()
      const weekStart  = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
      const monthStart = startOfMonth(now).toISOString()
      const thirtyDaysAgo = subDays(now, 30).toISOString()

      // Fetch all page_views from last 30 days
      const { data: rows, error } = await supabase
        .from('page_views')
        .select('visitor_id, page_path, country, device_type, browser, referrer, created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[Visitors] query error:', error)
        setVisitorLoading(false)
        return
      }

      if (!rows || rows.length === 0) {
        setVisitorLoading(false)
        return
      }

      // ── KPI stats ──
      const todayRows = rows.filter(r => r.created_at >= todayStart)
      const weekRows  = rows.filter(r => r.created_at >= weekStart)
      const monthRows = rows.filter(r => r.created_at >= monthStart)
      const unique = (arr: typeof rows) => new Set(arr.map(r => r.visitor_id)).size

      setVisitorStats({
        today: todayRows.length,
        todayUnique: unique(todayRows),
        week: weekRows.length,
        weekUnique: unique(weekRows),
        month: monthRows.length,
        monthUnique: unique(monthRows),
      })

      // ── Daily visitors (30 days) ──
      const dailyMap = new Map<string, { total: number; visitors: Set<string> }>()
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(now, i), 'yyyy-MM-dd')
        dailyMap.set(d, { total: 0, visitors: new Set() })
      }
      for (const r of rows) {
        const d = r.created_at.slice(0, 10)
        const entry = dailyMap.get(d)
        if (entry) {
          entry.total++
          entry.visitors.add(r.visitor_id)
        }
      }
      const dailyVisitors = Array.from(dailyMap.entries()).map(([d, v]) => ({
        date: format(parseISO(d), 'dd.MM.', { locale: de }),
        unique: v.visitors.size,
        total: v.total,
      }))

      // ── Countries (top 10) ──
      const countryMap = new Map<string, number>()
      for (const r of rows) {
        const c = r.country || 'Unbekannt'
        countryMap.set(c, (countryMap.get(c) ?? 0) + 1)
      }
      const countries = Array.from(countryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }))

      // ── Devices ──
      const deviceMap = new Map<string, number>()
      for (const r of rows) {
        const d = r.device_type === 'desktop' ? 'Desktop' : r.device_type === 'mobile' ? 'Mobile' : 'Tablet'
        deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1)
      }
      const devices = Array.from(deviceMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))

      // ── Browsers ──
      const browserMap = new Map<string, number>()
      for (const r of rows) {
        const b = r.browser || 'Other'
        browserMap.set(b, (browserMap.get(b) ?? 0) + 1)
      }
      const browsers = Array.from(browserMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))

      // ── Returning vs New ──
      const visitorCounts = new Map<string, number>()
      for (const r of rows) {
        visitorCounts.set(r.visitor_id, (visitorCounts.get(r.visitor_id) ?? 0) + 1)
      }
      let returning = 0
      let newVisitors = 0
      visitorCounts.forEach((count) => {
        if (count > 1) returning++
        else newVisitors++
      })
      const returningVsNew = [
        { name: 'Neue Besucher', value: newVisitors },
        { name: 'Wiederkehrend', value: returning },
      ]

      // ── Top pages ──
      const pageMap = new Map<string, { views: number; visitors: Set<string> }>()
      for (const r of rows) {
        const entry = pageMap.get(r.page_path) ?? { views: 0, visitors: new Set<string>() }
        entry.views++
        entry.visitors.add(r.visitor_id)
        pageMap.set(r.page_path, entry)
      }
      const topPages = Array.from(pageMap.entries())
        .sort((a, b) => b[1].views - a[1].views)
        .slice(0, 10)
        .map(([path, v]) => ({ path, views: v.views, unique: v.visitors.size }))

      // ── Referrers ──
      const refMap = new Map<string, number>()
      for (const r of rows) {
        const src = parseReferrer(r.referrer)
        refMap.set(src, (refMap.get(src) ?? 0) + 1)
      }
      const referrers = Array.from(refMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([source, count]) => ({ source, count }))

      setVisitorChartData({
        dailyVisitors, countries, devices, browsers, returningVsNew, topPages, referrers,
      })
      setVisitorLoading(false)
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

  const visitorCards = [
    { label: 'Besucher heute',        value: visitorStats.todayUnique, icon: Eye },
    { label: 'Aufrufe heute',         value: visitorStats.today,       icon: Globe },
    { label: 'Besucher diese Woche',  value: visitorStats.weekUnique,  icon: UserCheck },
    { label: 'Aufrufe diese Woche',   value: visitorStats.week,        icon: MonitorSmartphone },
    { label: 'Besucher diesen Monat', value: visitorStats.monthUnique, icon: Users },
    { label: 'Aufrufe diesen Monat',  value: visitorStats.month,       icon: Eye },
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

      {/* ── Website Besucher Section ──────────────────────────────────── */}
      <div className="mt-12 mb-8 border-t border-border pt-10">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">Website Besucher</h2>
        <p className="text-muted-foreground text-sm mb-6">Seitenaufrufe, Geräte und Herkunft der Besucher.</p>

        {/* Visitor KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {visitorCards.map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border p-4 hover:border-foreground/20 transition-all duration-200 card-hover">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-tight">{card.label}</p>
                <div className="p-1.5 bg-secondary rounded-lg shrink-0">
                  <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {visitorLoading
                  ? <span className="animate-pulse text-muted-foreground">–</span>
                  : <AnimatedNumber value={card.value} />
                }
              </p>
            </div>
          ))}
        </div>

        {visitorChartData && <VisitorCharts data={visitorChartData} />}
      </div>
    </div>
  )
}
