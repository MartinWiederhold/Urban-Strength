'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import type { AnalyticsChartData } from '@/lib/types'

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

export default function AnalyticsCharts({ data }: { data: AnalyticsChartData }) {
  const { monthlyData, weeklyData, statusData, sourceData, serviceRevData, paymentData } = data

  return (
    <>
      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Umsatz (8 Wochen)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
              <Tooltip {...chartStyle} formatter={(v: number) => [`CHF ${v.toFixed(2)}`, 'Umsatz']} />
              <Line type="monotone" dataKey="revenue" stroke={GREEN} strokeWidth={2}
                dot={{ fill: GREEN, strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                    <div className="h-full rounded-full transition-all duration-1000" style={{
                      width: `${serviceRevData.length > 0 ? (item.revenue / Math.max(...serviceRevData.map(s => s.revenue))) * 100 : 0}%`,
                      background: GREEN,
                    }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{item.count} Buchung{item.count !== 1 ? 'en' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </>
  )
}
