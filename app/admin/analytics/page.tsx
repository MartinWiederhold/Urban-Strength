'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'

const COLORS = ['hsl(140,26%,39%)', 'hsl(36,18%,75%)', 'hsl(0,0%,40%)', 'hsl(210,54%,65%)', 'hsl(0,84%,60%)']

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalCustomers: 0,
    conversionRate: 0,
  })
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; bookings: number; revenue: number }>>([])
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number }>>([])
  const [sourceData, setSourceData] = useState<Array<{ name: string; value: number }>>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const [bookingsRes, customersRes] = await Promise.all([
        supabase.from('bookings').select('*, services(price)').order('booking_date', { ascending: true }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
      ])

      const bookings = bookingsRes.data ?? []
      const totalCustomers = customersRes.count ?? 0

      // Revenue & total
      const completedBookings = bookings.filter((b: any) => b.status === 'completed')
      const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.services?.price ?? 0), 0)

      // Monthly data (last 6 months)
      const monthly = []
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(new Date(), i)
        const monthStr = format(month, 'yyyy-MM')
        const monthBookings = bookings.filter((b: any) => b.booking_date?.startsWith(monthStr))
        const monthRevenue = monthBookings.filter((b: any) => b.status === 'completed').reduce((sum: number, b: any) => sum + (b.services?.price ?? 0), 0)
        monthly.push({
          month: format(month, 'MMM', { locale: de }),
          bookings: monthBookings.length,
          revenue: monthRevenue,
        })
      }

      // Status distribution
      const statusCount: Record<string, number> = {}
      bookings.forEach((b: any) => {
        statusCount[b.status] = (statusCount[b.status] ?? 0) + 1
      })
      const statusNames: Record<string, string> = {
        confirmed: 'Bestätigt', completed: 'Abgeschlossen', cancelled: 'Storniert',
        no_show: 'Nicht erschienen', rescheduled: 'Verschoben',
      }
      const statusArr = Object.entries(statusCount).map(([k, v]) => ({ name: statusNames[k] ?? k, value: v }))

      // Source distribution
      const sourceCount: Record<string, number> = {}
      bookings.forEach((b: any) => {
        const src = b.how_found_us ?? 'Unbekannt'
        sourceCount[src] = (sourceCount[src] ?? 0) + 1
      })
      const sourceArr = Object.entries(sourceCount).map(([k, v]) => ({ name: k, value: v }))

      // Conversion: probe -> paid
      const probeBookings = bookings.filter((b: any) => b.services?.price === 0).length
      const paidBookings = bookings.filter((b: any) => (b.services?.price ?? 0) > 0).length
      const conversionRate = probeBookings > 0 ? Math.round((paidBookings / probeBookings) * 100) : 0

      setStats({ totalRevenue, totalBookings: bookings.length, totalCustomers, conversionRate })
      setMonthlyData(monthly)
      setStatusData(statusArr)
      setSourceData(sourceArr)
      setIsLoading(false)
    }
    load()
  }, [])

  const kpiCards = [
    { label: 'Umsatz gesamt', value: `CHF ${stats.totalRevenue}`, icon: DollarSign, color: 'text-primary bg-primary/10' },
    { label: 'Buchungen gesamt', value: stats.totalBookings, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { label: 'Kunden', value: stats.totalCustomers, icon: Users, color: 'text-orange-600 bg-orange-50' },
    { label: 'Conversion', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Übersicht über Buchungen, Kunden und Umsatz.</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold tracking-tighter">
              {isLoading ? <span className="animate-pulse text-muted-foreground">–</span> : card.value}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-bold mb-5">Buchungen &amp; Umsatz (6 Monate)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(36,15%,88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid hsl(36,15%,88%)', fontSize: 12 }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `CHF ${value}` : value,
                  name === 'revenue' ? 'Umsatz' : 'Buchungen',
                ]}
              />
              <Bar dataKey="bookings" fill="hsl(140,26%,39%)" radius={[4,4,0,0]} name="bookings" />
              <Bar dataKey="revenue" fill="hsl(36,18%,75%)" radius={[4,4,0,0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-bold mb-5">Buchungs-Status</h2>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {statusData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground flex-1">{item.name}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Source Distribution */}
        {sourceData.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2">
            <h2 className="font-bold mb-5">Herkunft der Kunden</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sourceData} barSize={36} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(36,15%,88%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(36,15%,88%)', fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(140,26%,39%)" radius={[0,4,4,0]} name="Kunden" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
