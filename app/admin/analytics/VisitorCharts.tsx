'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'

export interface VisitorChartData {
  dailyVisitors: Array<{ date: string; unique: number; total: number }>
  countries: Array<{ name: string; value: number }>
  devices: Array<{ name: string; value: number }>
  browsers: Array<{ name: string; value: number }>
  returningVsNew: Array<{ name: string; value: number }>
  topPages: Array<{ path: string; views: number; unique: number }>
  referrers: Array<{ source: string; count: number }>
}

const BLUE    = '#3B82F6'
const CYAN    = '#06B6D4'
const COLORS  = ['#3B82F6', '#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#F97316', '#6366F1', '#14B8A6']
const DEVICE_COLORS = { Desktop: '#3B82F6', Mobile: '#8B5CF6', Tablet: '#06B6D4' }

const chartStyle = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid hsl(0,0%,18%)',
    backgroundColor: 'hsl(0,0%,10%)',
    color: 'hsl(0,0%,97%)',
    fontSize: 12,
  },
}

function LegendDots({ data, colors }: { data: Array<{ name: string; value: number }>; colors: string[] }) {
  return (
    <div className="space-y-2 flex-1">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
          <span className="text-muted-foreground flex-1 truncate">{item.name}</span>
          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function VisitorCharts({ data }: { data: VisitorChartData }) {
  const { dailyVisitors, countries, devices, browsers, returningVsNew, topPages, referrers } = data

  return (
    <>
      {/* Daily visitors line chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold mb-5">Besucher pro Tag (30 Tage)</h2>
        {dailyVisitors.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">Keine Daten</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyVisitors}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(0,0%,55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} allowDecimals={false} />
              <Tooltip {...chartStyle} />
              <Line type="monotone" dataKey="unique" stroke={BLUE} strokeWidth={2} name="Einzigartige"
                dot={{ fill: BLUE, strokeWidth: 2, r: 2.5 }} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="total" stroke={CYAN} strokeWidth={1.5} strokeDasharray="4 4" name="Gesamt"
                dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row: Devices, Browsers, Returning vs New */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Devices */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Geräte</h2>
          {devices.length === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={devices} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {devices.map((d, i) => (
                      <Cell key={i} fill={(DEVICE_COLORS as Record<string, string>)[d.name] ?? COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <LegendDots data={devices} colors={devices.map((d, i) => (DEVICE_COLORS as Record<string, string>)[d.name] ?? COLORS[i % COLORS.length])} />
            </div>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Browser</h2>
          {browsers.length === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={browsers} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {browsers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <LegendDots data={browsers} colors={COLORS} />
            </div>
          )}
        </div>

        {/* Returning vs New */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Neu vs. Wiederkehrend</h2>
          {returningVsNew.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={returningVsNew} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    <Cell fill={BLUE} />
                    <Cell fill="#8B5CF6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <LegendDots data={returningVsNew} colors={[BLUE, '#8B5CF6']} />
            </div>
          )}
        </div>
      </div>

      {/* Countries bar chart */}
      {countries.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold mb-5">Top Länder</h2>
          <ResponsiveContainer width="100%" height={Math.max(160, countries.length * 32)}>
            <BarChart data={countries} barSize={20} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} width={110} />
              <Tooltip {...chartStyle} />
              <Bar dataKey="value" fill={BLUE} radius={[0, 4, 4, 0]} name="Besucher" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Row: Top pages + Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top pages table */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Beliebteste Seiten</h2>
          {topPages.length === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="space-y-0">
              <div className="flex items-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border mb-1">
                <span className="flex-1">Seite</span>
                <span className="w-16 text-right">Aufrufe</span>
                <span className="w-16 text-right">Unique</span>
              </div>
              {topPages.map((p, i) => (
                <div key={i} className="flex items-center py-2 text-sm border-b border-border/50 last:border-0">
                  <span className="flex-1 truncate text-muted-foreground font-mono text-xs">{p.path}</span>
                  <span className="w-16 text-right font-semibold">{p.views}</span>
                  <span className="w-16 text-right text-muted-foreground">{p.unique}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referrers table */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Herkunft (Referrer)</h2>
          {referrers.length === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <div className="space-y-0">
              <div className="flex items-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border mb-1">
                <span className="flex-1">Quelle</span>
                <span className="w-16 text-right">Aufrufe</span>
              </div>
              {referrers.map((r, i) => (
                <div key={i} className="flex items-center py-2 text-sm border-b border-border/50 last:border-0">
                  <span className="flex-1 truncate text-muted-foreground text-xs">{r.source}</span>
                  <span className="w-16 text-right font-semibold">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
