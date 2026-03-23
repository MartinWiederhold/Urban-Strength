'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 1600,
  decimals = 0,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    startRef.current = null

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.floor(display).toLocaleString('de-CH')

  return <span className="animate-count-up">{prefix}{formatted}{suffix}</span>
}
