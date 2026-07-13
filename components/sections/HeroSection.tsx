'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'

export default function HeroSection() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleMusic = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      // Every fresh play starts from the beginning.
      el.currentTime = 0
      const p = el.play()
      if (p && typeof p.then === 'function') {
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      } else {
        setIsPlaying(true)
      }
    } else {
      el.pause()
      setIsPlaying(false)
    }
  }

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#F6A527]">
      {/* Gradient background (stretched full-bleed – smooth, so no visible seams) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/hero-bg.png"
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Athlete cut-out — centered */}
      <div className="animate-hero-athlete absolute inset-x-0 bottom-0 z-10 mx-auto flex h-full max-w-[1500px] items-end justify-center">
        <div className="relative h-[82%] w-full max-w-[440px] sm:h-[86%] md:h-[90%]">
          <Image
            src="/assets/images/Objekt 5.png"
            alt="Personal Training Zürich – Athletin"
            fill
            priority
            quality={92}
            sizes="(max-width: 768px) 80vw, 440px"
            className="object-contain object-bottom"
            style={{ filter: 'drop-shadow(0 26px 40px rgba(90,45,0,0.28))' }}
          />
        </div>
      </div>

      {/* Wordmark — laid ON TOP of the image */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <h1
          className="animate-hero-word whitespace-nowrap select-none text-center font-display font-black uppercase leading-[0.9] tracking-[-0.02em] text-white"
          style={{
            fontSize: 'clamp(1.9rem, 8.4vw, 7.5rem)',
            textShadow: '0 6px 34px rgba(120,55,0,0.3)',
          }}
        >
          Train with me
        </h1>
      </div>

      {/* Music toggle — right side of the hero */}
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Musik pausieren' : 'Musik abspielen'}
        aria-pressed={isPlaying}
        className="group absolute right-5 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md ring-1 ring-white/25 transition-all duration-300 hover:scale-105 hover:bg-black/55 active:scale-95 md:right-8 md:h-16 md:w-16"
      >
        {/* Pulse ring while playing */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/40 transition-opacity duration-300 ${
            isPlaying ? 'animate-ping-slow opacity-100' : 'opacity-0'
          }`}
        />
        {isPlaying ? (
          <Pause className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2.25} fill="currentColor" />
        ) : (
          <Play className="ml-0.5 h-6 w-6 md:h-7 md:w-7" strokeWidth={2.25} fill="currentColor" />
        )}
      </button>

      <audio
        ref={audioRef}
        src="/assets/audio/Momentum_music.m4a"
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </section>
  )
}
