'use client'

import { MapPin, Clock, Car, Train } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MapSection() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

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
        center: [8.57222826678629, 47.36909632806538],
        zoom: 15,
      })

      new mapboxgl.Marker({ color: '#FBBF24' })
        .setLngLat([8.57222826678629, 47.36909632806538])
        .setPopup(
          new mapboxgl.Popup({
            offset: 20,
            maxWidth: '360px',
            className: 'pt-map-popup',
            closeButton: true,
          }).setHTML(
            '<div class="pt-map-popup-inner">' +
              '<div class="pt-map-popup-text">' +
              '<strong>Personal Training Zurich – by Martin</strong>' +
              '<p>Oberer Heuelsteig 30-34<br/>8032 Zürich, Schweiz</p>' +
              '</div>' +
              '<div class="pt-map-popup-avatar">' +
              '<img src="/assets/images/IMG_99828.jpg" alt="Martin – Personal Trainer Zürich" width="80" height="80" loading="lazy" />' +
              '</div>' +
              '</div>'
          )
        )
        .addTo(map)
    }

    initMap()

    return () => {
      if (map) map.remove()
    }
  }, [])

  const hoursLines = t('map.hoursValue').split('\n')
  const transitValue = t('map.transitValue')
  const carValue = t('map.carValue')

  return (
    <section className="section-padding bg-black" id="standort">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
            {t('map.title')}
          </h2>
          <p className="text-white/45 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('map.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Info */}
          <div className="animate-slide-up space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#111] border border-white/8">
              <MapPin className="w-5 h-5 text-white/50 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5 text-white">{t('map.address')}</p>
                <p className="text-sm text-white/45">Oberer Heuelsteig 30-34<br />8032 Zürich, Schweiz</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#111] border border-white/8">
              <Clock className="w-5 h-5 text-white/50 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5 text-white">{t('map.hours')}</p>
                <p className="text-sm text-white/45">
                  {hoursLines[0]}<br />{hoursLines[1]}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#111] border border-white/8">
              <Train className="w-5 h-5 text-white/50 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5 text-white">{t('map.transit')}</p>
                <p className="text-sm text-white/45">{transitValue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#111] border border-white/8">
              <Car className="w-5 h-5 text-white/50 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5 text-white">{t('map.car')}</p>
                <p className="text-sm text-white/45">{carValue}</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="animate-slide-up md:col-span-2">
            <div
              ref={mapContainer}
              className="w-full h-[400px] rounded-3xl overflow-hidden bg-[#111] border border-white/8"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
