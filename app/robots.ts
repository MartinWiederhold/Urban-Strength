import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/qrcode'],
      },
    ],
    sitemap: 'https://personal-training-zurich.vercel.app/sitemap.xml',
  }
}
