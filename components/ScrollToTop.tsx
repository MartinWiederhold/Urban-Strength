'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

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
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary shadow-medium transition-transform hover:bg-white/90 hover:scale-105 active:scale-95"
          aria-label="Nach oben scrollen"
        >
          <Image
            src="/assets/images/transparent.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
          />
        </button>
      )}
    </>
  )
}
