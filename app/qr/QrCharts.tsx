'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import type { QrChartData } from './page'

const FLAME = '#EE8A1E'
const INK   = '#0B0B0B'

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid rgba(11,11,11,0.1)',
    backgroundColor: '#ffffff',
    color: INK,
    fontSize: 12,
    padding: '8px 12px',
    boxShadow: '0 10px 30px -12px rgba(20,20,20,0.18)',
  },
  cursor: { fill: 'rgba(238,138,30,0.08)' },
}

export default function QrCharts({ data }: { data: QrChartData }) {
  const { dailyScans, hourlyScans, weekdayScans, devices, countries, recentScans } = data

  const hourlyMax = Math.max(...hourlyScans.map(h => h.scans), 1)

  return (
    <div className="mt-8 space-y-6">
      {/* Daily line chart */}
      <div className="rounded-2xl border border-ink/12 bg-white p-5 md:p-6">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink">
          Scans pro Tag <span className="text-ink/40">· letzte 30 Tage</span>
        </h2>
        {dailyScans.length === 0 || dailyScans.every(d => d.scans === 0) ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-ink/40">
            Noch keine Scans
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyScans}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,11,11,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(11,11,11,0.5)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(11,11,11,0.5)' }} allowDecimals={false} width={30} />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey="scans"
                name="Scans"
                stroke={FLAME}
                strokeWidth={2.5}
                dot={{ fill: FLAME, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: FLAME }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Hourly + Weekday */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-ink/12 bg-white p-5 md:p-6">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink">
            Nach Uhrzeit
          </h2>
          {hourlyScans.every(h => h.scans === 0) ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-ink/40">
              Noch keine Scans
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyScans} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,11,11,0.08)" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'rgba(11,11,11,0.5)' }} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(11,11,11,0.5)' }} allowDecimals={false} width={30} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="scans" name="Scans" radius={[6, 6, 0, 0]}>
                  {hourlyScans.map((h, i) => (
                    <Cell key={i} fill={FLAME} fillOpacity={0.35 + (h.scans / hourlyMax) * 0.65} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-ink/12 bg-white p-5 md:p-6">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink">
            Nach Wochentag
          </h2>
          {weekdayScans.every(d => d.scans === 0) ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-ink/40">
              Noch keine Scans
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekdayScans} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,11,11,0.08)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgba(11,11,11,0.5)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(11,11,11,0.5)' }} allowDecimals={false} width={30} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="scans" fill={INK} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Devices + Countries */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-ink/12 bg-white p-5 md:p-6">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink">
            Geräte
          </h2>
          {devices.length === 0 ? (
            <div className="flex h-[120px] items-center justify-center text-sm text-ink/40">
              Noch keine Daten
            </div>
          ) : (
            <RankBars items={devices} accent={FLAME} />
          )}
        </div>

        <div className="rounded-2xl border border-ink/12 bg-white p-5 md:p-6">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink">
            Länder <span className="text-ink/40">· Top 8</span>
          </h2>
          {countries.length === 0 ? (
            <div className="flex h-[120px] items-center justify-center text-sm text-ink/40">
              Noch keine Daten
            </div>
          ) : (
            <RankBars items={countries} accent={INK} />
          )}
        </div>
      </div>

      {/* Recent scans table */}
      <div className="rounded-2xl border border-ink/12 bg-white p-5 md:p-6">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink">
          Letzte Scans
        </h2>
        {recentScans.length === 0 ? (
          <div className="flex h-[100px] items-center justify-center text-sm text-ink/40">
            Noch keine Scans
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <div className="mb-2 flex items-center gap-4 border-b border-ink/10 pb-2 text-[10px] font-bold uppercase tracking-wide text-ink/45">
              <span className="w-28 shrink-0">Zeit</span>
              <span className="w-20 shrink-0">Gerät</span>
              <span className="w-24 shrink-0">Browser</span>
              <span className="flex-1 min-w-[8rem]">Ort</span>
            </div>
            <ul className="divide-y divide-ink/10">
              {recentScans.map((s, i) => (
                <li key={i} className="flex items-center gap-4 py-2.5 text-sm">
                  <span className="w-28 shrink-0 font-mono text-xs text-ink/50">{s.time}</span>
                  <span className="w-20 shrink-0 text-ink">{s.device}</span>
                  <span className="w-24 shrink-0 text-ink/70">{s.browser}</span>
                  <span className="flex-1 min-w-[8rem] text-ink/70">
                    {[s.city, s.country].filter(Boolean).join(', ') || '–'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function RankBars({ items, accent }: { items: Array<{ name: string; value: number }>; accent: string }) {
  const max = Math.max(...items.map(i => i.value), 1)
  const total = items.reduce((sum, i) => sum + i.value, 0)
  return (
    <ul className="space-y-3">
      {items.map((it, i) => {
        const pct = (it.value / max) * 100
        const share = ((it.value / total) * 100).toFixed(0)
        return (
          <li key={i}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-ink">{it.name}</span>
              <span className="text-ink/50">
                {it.value} <span className="text-ink/35">· {share}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/8">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
