'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Car, Train } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function MapSection() {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    let map: mapboxgl.Map | null = null

    const initMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default

      mapboxgl.accessToken = token

      map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [8.5555, 47.3580],
        zoom: 14,
      })

      new mapboxgl.Marker({ color: 'hsl(140, 26%, 39%)' })
        .setLngLat([8.5555, 47.3580])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Personal Training Zurich</strong><br/>Oberer Heuelsteig 30, 8032 Zürich'))
        .addTo(map)
    }

    initMap()

    return () => {
      if (map) map.remove()
    }
  }, [])

  return (
    <section className="section-padding bg-background" id="standort">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
            Trainingsstandort in Zürich
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Zentral gelegen – einfach erreichbar mit ÖV und Auto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">Adresse</p>
                <p className="text-sm text-muted-foreground">Oberer Heuelsteig 30<br />8032 Zürich, Schweiz</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">Trainingszeiten</p>
                <p className="text-sm text-muted-foreground">Mo–Fr: 07:00–21:00 Uhr<br />Sa: 08:00–18:00 Uhr</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
              <Train className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">Mit ÖV</p>
                <p className="text-sm text-muted-foreground">Bus & Tram gut erreichbar</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
              <Car className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">Mit Auto</p>
                <p className="text-sm text-muted-foreground">Parkplätze in der Nähe verfügbar</p>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-2"
          >
            <div
              ref={mapContainer}
              className="w-full h-[400px] rounded-2xl overflow-hidden bg-muted"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
