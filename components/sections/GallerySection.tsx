'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'

const images = [
  { alt: 'Personal Training Gym Zürich', label: 'Trainingsraum' },
  { alt: 'Fitnessgeräte im Gym Zürich', label: 'Fitnessgeräte' },
  { alt: 'Personal Training Session in Zürich', label: 'Training Session' },
  { alt: 'Trainingsraum Personal Training Zürich', label: 'Gym Atmosphäre' },
  { alt: 'Personal Training Zürich Martin', label: 'Personal Training' },
  { alt: 'Krafttraining Zürich', label: 'Krafttraining' },
]

function PlaceholderImage({ alt, label, onClick }: { alt: string; label: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="aspect-square rounded-2xl bg-[#111] border border-white/8 overflow-hidden relative cursor-pointer group transition-all duration-300 hover:border-white/20 hover:-translate-y-1"
      role="button"
      aria-label={alt}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/20">
        <ImageIcon className="w-8 h-8" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/4 transition-colors rounded-2xl" />
    </div>
  )
}

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null))
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null))

  return (
    <section className="section-padding bg-[#080808]" id="galerie">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            Trainingsumgebung in Zürich
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Modernes Equipment in zentraler Lage – perfekte Bedingungen für dein Training.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <PlaceholderImage
                alt={image.alt}
                label={image.label}
                onClick={() => setLightboxIndex(i)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxIndex(null)}
            aria-label="Schliessen"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div
            className="max-w-2xl w-full aspect-square bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-2 text-white/20">
              <ImageIcon className="w-16 h-16" />
              <span>{images[lightboxIndex].label}</span>
            </div>
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </motion.div>
      )}
    </section>
  )
}
