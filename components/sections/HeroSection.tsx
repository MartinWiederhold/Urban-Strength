'use client'

import Image from 'next/image'

export default function HeroSection() {
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

    </section>
  )
}
