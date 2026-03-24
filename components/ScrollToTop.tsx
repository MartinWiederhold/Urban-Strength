'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {visible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary text-white shadow-medium flex items-center justify-center hover:bg-[hsl(140,26%,45%)] transition-colors"
          aria-label="Nach oben scrollen"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
