'use client'

import { MapPin, Clock, Car, TramFront, ArrowUpRight } from 'lucide-react'
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
              '<strong>Personal Training Zürich<span class="pt-map-popup-by">by Martin</span></strong>' +
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
    { icon: TramFront, label: t('map.transit'), value: transitValue },
    { icon: Car, label: t('map.car'), value: carValue },
  ]

  return (
    <section className="section-padding bg-paper" id="standort">
      <div className="container-max">
        <div className="animate-slide-up mb-12 flex flex-col items-start gap-5 border-b border-ink/12 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-black uppercase tracking-[-0.01em] leading-[1.15] text-ink">
              {t('map.title')}
            </h2>
          </div>
          <p className="text-ink/55 text-base max-w-sm md:text-right leading-relaxed">
            {t('map.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Info — single editorial card with hairline dividers */}
          <div className="animate-slide-up overflow-hidden rounded-3xl border border-ink/10 bg-white">
            <ul className="divide-y divide-ink/10">
              {infoCards.map((c, i) => (
                <li key={i} className="group flex items-start gap-4 px-5 py-5">
                  <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-flame" strokeWidth={1.75} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">
                      {c.label}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{c.value}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Oberer+Heuelsteig+30-34%2C+8032+Z%C3%BCrich"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 border-t border-ink/10 bg-ink px-5 py-4 text-white transition-colors hover:bg-flame"
            >
              <span className="font-display text-xs font-bold uppercase tracking-[0.18em]">
                {t('map.route')}
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
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
