import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://personal-training-zurich.vercel.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
{ url: 'https://personal-training-zurich.vercel.app/personal-training-zuerich', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://personal-training-zurich.vercel.app/kontakt', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
