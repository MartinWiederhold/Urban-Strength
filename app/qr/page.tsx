'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, QrCode, ScanLine, Smartphone, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, subDays, startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

// Recharts (~180 kB) lazy-loaded — KPI cards render immediately.
const QrCharts = dynamic(() => import('./QrCharts'), {
  ssr: false,
  loading: () => (
    <div className="mt-6 space-y-4">
      <div className="h-[260px] animate-pulse rounded-2xl border border-ink/10 bg-white/50" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-[240px] animate-pulse rounded-2xl border border-ink/10 bg-white/50" />
        <div className="h-[240px] animate-pulse rounded-2xl border border-ink/10 bg-white/50" />
      </div>
    </div>
  ),
})

export interface QrChartData {
  dailyScans: Array<{ date: string; scans: number }>
  hourlyScans: Array<{ hour: string; scans: number }>
  weekdayScans: Array<{ day: string; scans: number }>
  devices: Array<{ name: string; value: number }>
  countries: Array<{ name: string; value: number }>
  recentScans: Array<{ time: string; device: string; browser: string; country: string | null; city: string | null }>
}

interface Stats { today: number; week: number; month: number; total: number }
const EMPTY: Stats = { today: 0, week: 0, month: 0, total: 0 }

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export default function QrStatsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>(EMPTY)
  const [chartData, setChartData] = useState<QrChartData | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const now = new Date()
        const todayStart = startOfDay(now).toISOString()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
        const monthStart = startOfMonth(now).toISOString()
        const thirtyDaysAgo = subDays(now, 30).toISOString()

        // Rows from last 30 days for charts
        const { data: rows, error: qErr } = await supabase
          .from('qr_scans')
          .select('visitor_id, device_type, browser, country, city, created_at')
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true })

        if (qErr) throw qErr

        // Total across all time
        const { count: totalCount } = await supabase
          .from('qr_scans')
          .select('*', { count: 'exact', head: true })

        if (!rows || rows.length === 0) {
          setStats({ today: 0, week: 0, month: 0, total: totalCount ?? 0 })
          setChartData({ dailyScans: [], hourlyScans: [], weekdayScans: [], devices: [], countries: [], recentScans: [] })
          setLoading(false)
          return
        }

        setStats({
          today: rows.filter(r => r.created_at >= todayStart).length,
          week: rows.filter(r => r.created_at >= weekStart).length,
          month: rows.filter(r => r.created_at >= monthStart).length,
          total: totalCount ?? rows.length,
        })

        // Daily (30 days)
        const dailyMap = new Map<string, number>()
        for (let i = 29; i >= 0; i--) {
          dailyMap.set(format(subDays(now, i), 'yyyy-MM-dd'), 0)
        }
        for (const r of rows) {
          const d = r.created_at.slice(0, 10)
          if (dailyMap.has(d)) dailyMap.set(d, dailyMap.get(d)! + 1)
        }
        const dailyScans = Array.from(dailyMap.entries()).map(([d, scans]) => ({
          date: format(parseISO(d), 'dd.MM.', { locale: de }),
          scans,
        }))

        // Hourly
        const hourMap = new Map<number, number>()
        for (let h = 0; h < 24; h++) hourMap.set(h, 0)
        for (const r of rows) {
          const h = new Date(r.created_at).getHours()
          hourMap.set(h, hourMap.get(h)! + 1)
        }
        const hourlyScans = Array.from(hourMap.entries()).map(([h, scans]) => ({
          hour: `${h.toString().padStart(2, '0')}h`,
          scans,
        }))

        // Weekday (Mo–So)
        const dayMap = new Map<number, number>()
        for (let d = 0; d < 7; d++) dayMap.set(d, 0)
        for (const r of rows) {
          const d = new Date(r.created_at).getDay()
          dayMap.set(d, dayMap.get(d)! + 1)
        }
        const weekdayScans = [1, 2, 3, 4, 5, 6, 0].map(d => ({
          day: WEEKDAYS[d],
          scans: dayMap.get(d) ?? 0,
        }))

        // Devices
        const deviceMap = new Map<string, number>()
        for (const r of rows) {
          const label = r.device_type === 'desktop' ? 'Desktop' : r.device_type === 'mobile' ? 'Mobile' : 'Tablet'
          deviceMap.set(label, (deviceMap.get(label) ?? 0) + 1)
        }
        const devices = Array.from(deviceMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => ({ name, value }))

        // Countries top 8
        const countryMap = new Map<string, number>()
        for (const r of rows) {
          const c = r.country || 'Unbekannt'
          countryMap.set(c, (countryMap.get(c) ?? 0) + 1)
        }
        const countries = Array.from(countryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }))

        // Recent 20
        const recentScans = [...rows].reverse().slice(0, 20).map(r => ({
          time: format(new Date(r.created_at), 'dd.MM. HH:mm', { locale: de }),
          device: r.device_type === 'desktop' ? 'Desktop' : r.device_type === 'mobile' ? 'Mobile' : 'Tablet',
          browser: r.browser ?? '–',
          country: r.country,
          city: r.city,
        }))

        setChartData({ dailyScans, hourlyScans, weekdayScans, devices, countries, recentScans })
        setLoading(false)
      } catch (e) {
        console.error('[QR stats] load error:', e)
        setError((e as Error).message ?? 'Fehler beim Laden')
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpis = [
    { label: 'Heute', value: stats.today, icon: ScanLine },
    { label: 'Diese Woche', value: stats.week, icon: QrCode },
    { label: 'Diesen Monat', value: stats.month, icon: Smartphone },
    { label: 'Gesamt', value: stats.total, icon: Globe },
  ]

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-ink/60 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Zur Startseite
        </Link>

        {/* Header */}
        <div className="mb-10 border-b border-ink/12 pb-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-flame">
            <QrCode className="h-4 w-4" />
            QR-Code Statistik
          </div>
          <h1 className="mt-3 font-display text-3xl font-black uppercase leading-[1.1] tracking-[-0.01em] text-ink md:text-5xl">
            Deine QR-Scans
          </h1>
          <p className="mt-3 max-w-lg text-ink/60">
            Alle Scans deines QR-Codes im Überblick: Wie oft, wann, von welchem Gerät und aus welchem Land.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-ink/12 bg-white px-4 py-5 md:px-5 md:py-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ink/45">
                  {k.label}
                </span>
                <k.icon className="h-4 w-4 text-flame" strokeWidth={1.75} />
              </div>
              <p className="font-display text-3xl font-black tracking-tight text-ink md:text-4xl">
                {loading ? <span className="animate-pulse text-ink/25">–</span> : k.value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Charts */}
        {chartData && <QrCharts data={chartData} />}

        <p className="mt-10 text-xs text-ink/40">
          Daten aus den letzten 30 Tagen (Charts) · Gesamt-Zahl umfasst alle Zeiten · Aktualisierung bei jedem Seitenaufruf
        </p>
      </div>
    </main>
  )
}
