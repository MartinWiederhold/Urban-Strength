import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Personal Training Zurich – by Martin',
    short_name: 'PT Zurich',
    description: 'Personal Training in Zürich – Individuelles 1:1 Training',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f6f3',
    theme_color: '#4a7c59',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
