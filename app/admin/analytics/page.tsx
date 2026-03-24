'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { TrendingUp, Users, Calendar, DollarSign, CheckCircle2, XCircle, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, subMonths, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'
import { AnimatedNumber } from '@/components/ui/animated-number'

const COLORS = ['hsl(0,0%,90%)', 'hsl(0,0%,60%)', 'hsl(0,0%,40%)', 'hsl(0,0%,25%)', 'hsl(0,84%,60%)']
const GREEN  = '#29C46A'
const RED    = 'hsl(0,84%,60%)'

const chartStyle = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid hsl(0,0%,18%)',
    backgroundColor: 'hsl(0,0%,10%)',
    color: 'hsl(0,0%,97%)',
    fontSize: 12,
  },
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidRevenue:  0,
    totalBookings: 0,
    totalCustomers: 0,
    paidCount: 0,
    unpaidCount: 0,
    avgRevenue: 0,
    conversionRate: 0,
  })
  const [monthlyData, setMonthlyData]   = useState<Array<{ month: string; bookings: number; revenue: number }>>([])
  const [weeklyData, setWeeklyData]     = useState<Array<{ week: string; revenue: number }>>([])
  const [statusData, setStatusData]     = useState<Array<{ name: string; value: number }>>([])
  const [sourceData, setSourceData]     = useState<Array<{ name: string; value: number }>>([])
  const [serviceRevData, setServiceRevData] = useState<Array<{ name: string; revenue: number; count: number }>>([])
  const [paymentData, setPaymentData]   = useState<Array<{ name: string; value: number }>>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const [bookingsRes, customersRes] = await Promise.all([
        supabase.from('bookings')
          .select('*, services(price, title, duration_minutes)')
          .order('booking_date', { ascending: true }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
      ])

      const bookings      = bookingsRes.data ?? []
      const totalCustomers = customersRes.count ?? 0

      // ── Payment stats ───────────────────────────────────────────────────
      const paidBookings   = bookings.filter((b: any) => b.paid)
      const unpaidBookings = bookings.filter((b: any) => !b.paid && (b.services?.price ?? 0) > 0)
      const paidRevenue    = paidBookings.reduce((s: number, b: any) => s + (b.paid_amount ?? 0), 0)
      const avgRevenue     = paidBookings.length > 0 ? paidRevenue / paidBookings.length : 0

      // Legacy revenue (completed × service price)
      const completedBookings = bookings.filter((b: any) => b.status === 'completed')
      const totalRevenue = completedBookings.reduce((s: number, b: any) => s + (b.services?.price ?? 0), 0)

      // ── Monthly data (last 6 months) ────────────────────────────────────
      const monthly = []
      for (let i = 5; i >= 0; i--) {
        const month    = subMonths(new Date(), i)
        const monthStr = format(month, 'yyyy-MM')
        const mb       = bookings.filter((b: any) => b.booking_date?.startsWith(monthStr))
        const mRev     = mb.filter((b: any) => b.paid).reduce((s: number, b: any) => s + (b.paid_amount ?? 0), 0)
        monthly.push({
          month: format(month, 'MMM', { locale: de }),
          bookings: mb.length,
          revenue: Math.round(mRev * 100) / 100,
        })
      }

      // ── Weekly data (last 8 weeks) ──────────────────────────────────────
      const weekly = []
      for (let i = 7; i >= 0; i--) {
        const ws  = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 })
        const we  = endOfWeek(ws, { weekStartsOn: 1 })
        const wsStr = format(ws, 'yyyy-MM-dd')
        const weStr = format(we, 'yyyy-MM-dd')
        const wb  = bookings.filter((b: any) => b.booking_date >= wsStr && b.booking_date <= weStr)
        const wRev = wb.filter((b: any) => b.paid).reduce((s: number, b: any) => s + (b.paid_amount ?? 0), 0)
        weekly.push({
          week: format(ws, 'dd.MM.', { locale: de }),
          revenue: Math.round(wRev * 100) / 100,
        })
      }

      // ── Status distribution ─────────────────────────────────────────────
      const statusCount: Record<string, number> = {}
      bookings.forEach((b: any) => { statusCount[b.status] = (statusCount[b.status] ?? 0) + 1 })
      const statusNames: Record<string, string> = {
        confirmed: 'Bestätigt', completed: 'Abgeschlossen', cancelled: 'Storniert',
        no_show: 'Nicht erschienen', rescheduled: 'Verschoben',
      }
      const statusArr = Object.entries(statusCount).map(([k, v]) => ({ name: statusNames[k] ?? k, value: v }))

      // ── Source distribution ─────────────────────────────────────────────
      const sourceCount: Record<string, number> = {}
      bookings.forEach((b: any) => {
        const src = b.how_found_us ?? 'Unbekannt'
        sourceCount[src] = (sourceCount[src] ?? 0) + 1
      })
      const sourceArr = Object.entries(sourceCount).map(([k, v]) => ({ name: k, value: v }))

      // ── Revenue by service type ─────────────────────────────────────────
      const serviceMap: Record<string, { revenue: number; count: number }> = {}
      bookings.filter((b: any) => b.paid).forEach((b: any) => {
        const title = b.services?.title ?? 'Unbekannt'
        if (!serviceMap[title]) serviceMap[title] = { revenue: 0, count: 0 }
        serviceMap[title].revenue += b.paid_amount ?? 0
        serviceMap[title].count++
      })
      const serviceRevArr = Object.entries(serviceMap).map(([name, v]) => ({
        name, revenue: Math.round(v.revenue * 100) / 100, count: v.count,
      }))

      // ── Payment breakdown (pie) ─────────────────────────────────────────
      const payableCount = bookings.filter((b: any) => (b.services?.price ?? 0) > 0).length
      const payArr = [
        { name: 'Bezahlt', value: paidBookings.length },
        { name: 'Offen',   value: Math.max(0, payableCount - paidBookings.length) },
      ]

      // ── Conversion ──────────────────────────────────────────────────────
      const probeCount = bookings.filter((b: any) => b.services?.price === 0).length
      const paidCount2 = bookings.filter((b: any) => (b.services?.price ?? 0) > 0).length
      const conv = probeCount > 0 ? Math.round((paidCount2 / probeCount) * 100) : 0

      setStats({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        paidRevenue:  Math.round(paidRevenue  * 100) / 100,
        totalBookings: bookings.length,
        totalCustomers,
        paidCount: paidBookings.length,
        unpaidCount: Math.max(0, payableCount - paidBookings.length),
        avgRevenue: Math.round(avgRevenue * 100) / 100,
        conversionRate: conv,
      })
      setMonthlyData(monthly)
      setWeeklyData(weekly)
      setStatusData(statusArr)
      setSourceData(sourceArr)
      setServiceRevData(serviceRevArr)
      setPaymentData(payArr)
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
      <div className="animate-slide-up mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Buchungen, Kunden und Umsatz im Überblick.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, i) => (
          <div
            key={card.label}
            className="bg-card rounded-xl border border-border p-4 hover:border-foreground/20 transition-all duration-200 card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
              <div className="p-1.5 bg-secondary rounded-lg shrink-0">
                <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              {isLoading
                ? <span className="animate-pulse text-muted-foreground">–</span>
                : <AnimatedNumber
                    value={card.value}
                    prefix={card.prefix}
                    suffix={card.suffix}
                    decimals={card.decimals ?? 0}
                  />
              }
            </p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly bookings + revenue */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Buchungen &amp; Umsatz (6 Monate)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
              <Tooltip {...chartStyle}
                formatter={(v: number, name: string) => [
                  name === 'revenue' ? `CHF ${v.toFixed(2)}` : v,
                  name === 'revenue' ? 'Umsatz' : 'Buchungen',
                ]}
              />
              <Bar dataKey="bookings" fill="hsl(0,0%,90%)" radius={[4,4,0,0]} name="bookings" />
              <Bar dataKey="revenue"  fill={GREEN}          radius={[4,4,0,0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly revenue line chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Umsatz (8 Wochen)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
              <Tooltip {...chartStyle}
                formatter={(v: number) => [`CHF ${v.toFixed(2)}`, 'Umsatz']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={GREEN}
                strokeWidth={2}
                dot={{ fill: GREEN, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bezahlt vs Offen */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Bezahltstatus</h2>
          {paymentData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    <Cell fill={GREEN} />
                    <Cell fill={RED} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {paymentData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: i === 0 ? GREEN : RED }} />
                    <span className="text-muted-foreground flex-1">{item.name}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Buchungs-Status</h2>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {statusData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground flex-1 truncate">{item.name}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Revenue by service */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Umsatz nach Service</h2>
          {serviceRevData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">Keine bezahlten Buchungen</div>
          ) : (
            <div className="space-y-3">
              {serviceRevData.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[140px]">{item.name}</span>
                    <span className="font-semibold text-emerald-400 shrink-0">CHF {item.revenue.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${serviceRevData.length > 0 ? (item.revenue / Math.max(...serviceRevData.map(s => s.revenue))) * 100 : 0}%`,
                        background: GREEN,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{item.count} Buchung{item.count !== 1 ? 'en' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Source distribution */}
      {sourceData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Herkunft der Kunden</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sourceData} barSize={36} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} width={90} />
              <Tooltip {...chartStyle} />
              <Bar dataKey="value" fill="hsl(0,0%,90%)" radius={[0,4,4,0]} name="Kunden" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
