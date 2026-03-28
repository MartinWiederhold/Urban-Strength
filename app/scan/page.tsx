'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPad|Android(?!.*Mobile)/i.test(ua)) return 'tablet'
  if (/Mobile|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getBrowser(): string {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua = navigator.userAgent
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  return 'Other'
}

function getVisitorId(): string {
  const KEY = 'pt_vid'
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) return existing
  } catch {}
  const id = crypto.randomUUID()
  try { localStorage.setItem(KEY, id) } catch {}
  return id
}

async function getGeoInfo(): Promise<{ country: string | null; city: string | null }> {
  const KEY = 'pt_geo'
  try {
    const cached = sessionStorage.getItem(KEY)
    if (cached) return JSON.parse(cached)
  } catch {}
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return { country: null, city: null }
    const data = await res.json()
    const geo = { country: data.country_name ?? null, city: data.city ?? null }
    try { sessionStorage.setItem(KEY, JSON.stringify(geo)) } catch {}
    return geo
  } catch {
    return { country: null, city: null }
  }
}

export default function ScanPage() {
  const router = useRouter()

  useEffect(() => {
    const track = async () => {
      try {
        const [geo, visitorId, deviceType, browser] = await Promise.all([
          getGeoInfo(),
          Promise.resolve(getVisitorId()),
          Promise.resolve(getDeviceType()),
          Promise.resolve(getBrowser()),
        ])

        const supabase = createClient()
        await supabase.from('qr_scans').insert({
          visitor_id: visitorId,
          device_type: deviceType,
          browser,
          country: geo.country,
          city: geo.city,
          referrer: document.referrer || null,
        })
      } catch {
        // Silent fail — tracking must never block the redirect
      }
    }

    track().finally(() => {
      router.replace('/')
    })
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm">Weiterleitung...</p>
      </div>
    </div>
  )
}
