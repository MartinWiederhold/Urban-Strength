'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

export interface QrScanChartData {
  dailyScans: Array<{ date: string; scans: number }>
  hourlyScans: Array<{ hour: string; scans: number }>
  weekdayScans: Array<{ day: string; scans: number }>
  devices: Array<{ name: string; value: number }>
  recentScans: Array<{ time: string; device: string; browser: string; country: string | null }>
}

const AMBER   = '#F59E0B'
const COLORS  = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#EC4899']

const chartStyle = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid hsl(0,0%,18%)',
    backgroundColor: 'hsl(0,0%,10%)',
    color: 'hsl(0,0%,97%)',
    fontSize: 12,
  },
}

export default function QrScanCharts({ data }: { data: QrScanChartData }) {
  const { dailyScans, hourlyScans, weekdayScans, recentScans } = data

  return (
    <>
      {/* Daily scans line chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold mb-5">QR-Scans pro Tag (30 Tage)</h2>
        {dailyScans.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">Keine Daten</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyScans}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(0,0%,55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} allowDecimals={false} />
              <Tooltip {...chartStyle} />
              <Line type="monotone" dataKey="scans" stroke={AMBER} strokeWidth={2} name="Scans"
                dot={{ fill: AMBER, strokeWidth: 2, r: 2.5 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row: Hourly + Weekday */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Scans by hour */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Scans nach Uhrzeit</h2>
          {hourlyScans.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyScans} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(0,0%,55%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} allowDecimals={false} />
                <Tooltip {...chartStyle} />
                <Bar dataKey="scans" name="Scans" radius={[4, 4, 0, 0]}>
                  {hourlyScans.map((_, i) => (
                    <Cell key={i} fill={AMBER} fillOpacity={0.7 + (hourlyScans[i].scans / Math.max(...hourlyScans.map(h => h.scans), 1)) * 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Scans by weekday */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-5">Scans nach Wochentag</h2>
          {weekdayScans.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">Keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekdayScans} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,55%)' }} allowDecimals={false} />
                <Tooltip {...chartStyle} />
                <Bar dataKey="scans" name="Scans" radius={[4, 4, 0, 0]}>
                  {weekdayScans.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent scans table */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold mb-5">Letzte QR-Scans</h2>
        {recentScans.length === 0 ? (
          <div className="flex items-center justify-center h-[120px] text-muted-foreground text-sm">Keine Scans vorhanden</div>
        ) : (
          <div className="space-y-0">
            <div className="flex items-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border mb-1">
              <span className="flex-1">Zeitpunkt</span>
              <span className="w-20 text-right">Gerät</span>
              <span className="w-20 text-right">Browser</span>
              <span className="w-24 text-right">Land</span>
            </div>
            {recentScans.map((s, i) => (
              <div key={i} className="flex items-center py-2 text-sm border-b border-border/50 last:border-0">
                <span className="flex-1 text-muted-foreground text-xs font-mono">{s.time}</span>
                <span className="w-20 text-right text-xs">{s.device}</span>
                <span className="w-20 text-right text-xs text-muted-foreground">{s.browser}</span>
                <span className="w-24 text-right text-xs text-muted-foreground">{s.country ?? '–'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
