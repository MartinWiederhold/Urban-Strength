'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/** Detect device type from user agent */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPad|Android(?!.*Mobile)/i.test(ua)) return 'tablet'
  if (/Mobile|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile'
  return 'desktop'
}

/** Extract browser name from user agent */
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

/** Get or create a persistent visitor ID */
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

/** Fetch geo info once per session, cache in sessionStorage */
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

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip admin, dashboard, login, register, api paths
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/reset-password')
    ) return

    // Fire async, non-blocking
    const track = async () => {
      try {
        const [geo, visitorId, deviceType, browser] = await Promise.all([
          getGeoInfo(),
          Promise.resolve(getVisitorId()),
          Promise.resolve(getDeviceType()),
          Promise.resolve(getBrowser()),
        ])

        const supabase = createClient()
        await supabase.from('page_views').insert({
          page_path: pathname,
          visitor_id: visitorId,
          country: geo.country,
          city: geo.city,
          device_type: deviceType,
          browser,
          referrer: document.referrer || null,
        })
      } catch {
        // Silent fail — tracking must never break the app
      }
    }

    // Delay tracking so it doesn't compete with page rendering
    const id = setTimeout(track, 800)
    return () => clearTimeout(id)
  }, [pathname])

  return null
}
