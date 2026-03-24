'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const ASSET = (filename: string) =>
  `/assets/images/${encodeURIComponent(filename)}`

const galleryImages = [
  {
    file: 'C2DDF947-24DA-4E37-ACFB-8985A7A05132.PNG',
    alt: 'Gym Zürich – Trainingsraum mit Hantelbänken',
    label: 'Trainingsraum',
  },
  {
    file: 'A2A59CDE-70C5-48D8-8BF3-EBA3D16C8597 2.PNG',
    alt: 'Fitnessstudio Zürich – grosszügige Trainingsfläche',
    label: 'Trainingsfläche',
  },
  {
    file: 'B7FD7888-31E5-4A23-9BB7-C1BC41086077 2.PNG',
    alt: 'Moderne Fitnessgeräte im Gym',
    label: 'Fitnessgeräte',
  },
  {
    file: '77FBE617-E6F4-4B95-979F-C221D8D67A8F 2.PNG',
    alt: 'Trainingsumgebung Personal Training Zürich',
    label: 'Gym Bereich',
  },
  {
    file: '29F71CEA-5BF1-4116-B064-87481458B60C 2.PNG',
    alt: 'Functional Training Bereich Zürich',
    label: 'Functional Area',
  },
  {
    file: 'F977F28C-4CDE-41D6-985F-0C39988109F2 2.PNG',
    alt: 'Krafttraining und Geräte im Studio',
    label: 'Kraftbereich',
  },
  {
    file: '70F8BB46-223E-4338-9F90-1ABED8D24F32 2.PNG',
    alt: 'Innenansicht Gym Oberer Heuelsteig Zürich',
    label: 'Studio',
  },
  {
    file: '93A28A90-D70B-463F-9DE1-3D8698EAC531 4.PNG',
    alt: 'Rack und freie Gewichte im Training',
    label: 'Freihantelbereich',
  },
  {
    file: 'A7EDE0A0-51C3-42C7-9AA6-F1606A6C9A36 2.PNG',
    alt: 'Equipment für Personal Training Zürich',
    label: 'Training',
  },
].map((item) => ({ ...item, src: ASSET(item.file) }))

function GalleryTile({
  src,
  alt,
  label,
  onClick,
}: {
  src: string
  alt: string
  label: string
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
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pt-12 pb-3 px-3">
        <span className="text-xs font-medium text-white/90 drop-shadow-sm">{label}</span>
      </div>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
    </button>
  )
}

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const prev = () =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null
    )
  const next = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % galleryImages.length : null))

  return (
    <section className="section-padding bg-[#080808]" id="galerie">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Trainingsumgebung in Zürich
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Modernes Equipment in zentraler Lage – perfekte Bedingungen für dein Training.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, i) => (
            <GalleryTile
              key={image.file}
              src={image.src}
              alt={image.alt}
              label={image.label}
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Galerie"
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setLightboxIndex(null)}
            aria-label="Schliessen"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            type="button"
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
          </button>
          <button
            type="button"
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <div
            className="relative w-full max-w-5xl h-[min(85vh,900px)] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/50 pointer-events-none">
            {galleryImages[lightboxIndex].label}
          </p>
        </div>
      )}
    </section>
  )
}
