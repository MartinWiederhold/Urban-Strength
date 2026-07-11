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
        style: 'mapbox://styles/mapbox/light-v11',
        center: [8.57222826678629, 47.36909632806538],
        zoom: 15,
      })

      new mapboxgl.Marker({ color: '#F5810F' })
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
              '<img src="/assets/images/ChatGPT%20Image%2011.%20Juli%202026,%2021_51_45.png" alt="Martin – Personal Trainer Zürich" width="80" height="80" loading="lazy" />' +
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

  const infoCards = [
    { icon: MapPin, label: t('map.address'), value: <>Oberer Heuelsteig 30-34<br />8032 Zürich, Schweiz</> },
    { icon: Clock, label: t('map.hours'), value: <>{hoursLines[0]}<br />{hoursLines[1]}</> },
    { icon: Train, label: t('map.transit'), value: transitValue },
    { icon: Car, label: t('map.car'), value: carValue },
  ]

  return (
    <section className="section-padding bg-white" id="standort">
      <div className="container-max">
        <div className="animate-slide-up text-center mb-12">
          <span className="eyebrow mb-4">{t('map.title')}</span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-neutral-900">
            {t('map.title')}
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('map.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Info */}
          <div className="animate-slide-up space-y-3">
            {infoCards.map((c, i) => (
              <div key={i} className="card-light flex items-start gap-3 p-4">
                <span className="icon-chip h-10 w-10 shrink-0"><c.icon className="w-5 h-5" /></span>
                <div>
                  <p className="font-semibold mb-0.5 text-neutral-900">{c.label}</p>
                  <p className="text-sm text-neutral-500">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="animate-slide-up md:col-span-2">
            <div
              ref={mapContainer}
              className="w-full h-[400px] rounded-3xl overflow-hidden bg-orange-50 border border-black/[0.07] shadow-[0_10px_40px_-16px_rgba(20,20,20,0.14)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
