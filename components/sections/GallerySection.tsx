'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const ASSET = (filename: string) =>
  `/assets/images/${encodeURIComponent(filename)}`

const galleryImages = [
  {
    file: 'C2DDF947-24DA-4E37-ACFB-8985A7A05132.PNG',
    alt: 'Gym Zürich – Trainingsraum mit Hantelbänken',
  },
  {
    file: 'A2A59CDE-70C5-48D8-8BF3-EBA3D16C8597 2.PNG',
    alt: 'Fitnessstudio Zürich – grosszügige Trainingsfläche',
  },
  {
    file: 'B7FD7888-31E5-4A23-9BB7-C1BC41086077 2.PNG',
    alt: 'Moderne Fitnessgeräte im Gym',
  },
  {
    file: '77FBE617-E6F4-4B95-979F-C221D8D67A8F 2.PNG',
    alt: 'Trainingsumgebung Personal Training Zürich',
  },
  {
    file: '29F71CEA-5BF1-4116-B064-87481458B60C 2.PNG',
    alt: 'Functional Training Bereich Zürich',
  },
  {
    file: 'F977F28C-4CDE-41D6-985F-0C39988109F2 2.PNG',
    alt: 'Krafttraining und Geräte im Studio',
  },
  {
    file: '70F8BB46-223E-4338-9F90-1ABED8D24F32 2.PNG',
    alt: 'Innenansicht Gym Oberer Heuelsteig 30-34, Zürich',
  },
  {
    file: '93A28A90-D70B-463F-9DE1-3D8698EAC531 4.PNG',
    alt: 'Rack und freie Gewichte im Training',
  },
  {
    file: 'A7EDE0A0-51C3-42C7-9AA6-F1606A6C9A36 2.PNG',
    alt: 'Equipment für Personal Training Zürich',
  },
  {
    file: 'spinningroom.PNG',
    alt: 'Spinning- und Cardio-Bereich im Gym Zürich',
  },
].map((item) => ({ ...item, src: ASSET(item.file) }))

function GalleryTile({
  src,
  alt,
  onClick,
}: {
  src: string
  alt: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square w-full rounded-2xl border border-white/8 overflow-hidden cursor-pointer transition-all duration-300 hover:border-white/20 hover:-translate-y-1 text-left"
      aria-label={`${alt} vergrössern`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </button>
  )
}

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useLanguage()

  const open = useCallback((i: number) => {
    setLightboxIndex(i)
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const close = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setLightboxIndex(null), 300)
  }, [])

  const prev = useCallback(() =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null
    ), [])

  const next = useCallback(() =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % galleryImages.length : null)), [])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, close, prev, next])

  return (
    <section className="section-padding bg-[#080808]" id="galerie">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            {t('gallery.title')}
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, i) => (
            <GalleryTile
              key={image.file}
              src={image.src}
              alt={image.alt}
              onClick={() => open(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Premium Lightbox Gallery ─────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className={`fixed inset-0 z-50 flex flex-col transition-all duration-300 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Galerie"
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/95 backdrop-blur-2xl transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={close}
          />

          {/* Top bar: counter + close */}
          <div className="relative z-10 flex items-center justify-between px-4 md:px-8 pt-4 md:pt-6 pb-2">
            <span className="text-white/40 text-sm font-light tracking-wide">
              {lightboxIndex + 1} / {galleryImages.length}
            </span>
            <button
              type="button"
              className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
              onClick={close}
              aria-label="Schliessen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main image area */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-4 md:px-20 min-h-0">
            {/* Prev button */}
            <button
              type="button"
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 text-white/30 hover:text-white p-2 md:p-3 rounded-full hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Vorheriges Bild"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Next button */}
            <button
              type="button"
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 text-white/30 hover:text-white p-2 md:p-3 rounded-full hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Nächstes Bild"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Image container with animation */}
            <div
              className={`relative w-full max-w-5xl h-full max-h-[70vh] md:max-h-[75vh] transition-all duration-300 ease-out ${
                isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                key={lightboxIndex}
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                fill
                className="object-contain drop-shadow-[0_8px_60px_rgba(0,0,0,0.8)] animate-[fadeScale_0.25s_ease-out]"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>
          </div>

          {/* Image caption */}
          <div className="relative z-10 text-center py-2">
            <p className="text-white/30 text-xs md:text-sm font-light tracking-wide">
              {galleryImages[lightboxIndex].alt}
            </p>
          </div>

          {/* Thumbnail strip */}
          <div className="relative z-10 px-4 md:px-8 pb-4 md:pb-6 pt-2">
            <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {galleryImages.map((image, i) => (
                <button
                  key={image.file}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className={`relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                    i === lightboxIndex
                      ? 'ring-2 ring-white/80 ring-offset-1 ring-offset-black scale-105 opacity-100'
                      : 'opacity-35 hover:opacity-70 hover:scale-105'
                  }`}
                  aria-label={`Bild ${i + 1}`}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
