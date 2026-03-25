'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * Web Vitals reporter — measures LCP, INP, CLS, FCP, TTFB.
 *
 * In development: logs to console for quick inspection.
 * In production:  ready to forward to any analytics endpoint.
 *
 * To enable production reporting, replace the console.log below with:
 *   navigator.sendBeacon('/api/web-vitals', JSON.stringify(metric))
 * or connect to Vercel Analytics, Plausible, PostHog, etc.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const rounded = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value)
    const unit    = metric.name === 'CLS' ? '' : 'ms'

    if (process.env.NODE_ENV === 'development') {
      const color = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
      console.log(`[WebVitals] ${color} ${metric.name}: ${rounded}${unit} (${metric.rating})`)
    }

    // Production reporting hook — uncomment and configure your endpoint:
    // if (process.env.NODE_ENV === 'production') {
    //   const body = JSON.stringify({
    //     name:           metric.name,
    //     value:          rounded,
    //     rating:         metric.rating,
    //     id:             metric.id,
    //     navigationType: metric.navigationType,
    //     url:            window.location.pathname,
    //   })
    //   if (navigator.sendBeacon) navigator.sendBeacon('/api/web-vitals', body)
    // }
  })

  return null
}
