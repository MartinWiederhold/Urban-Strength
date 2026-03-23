import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://personaltraining-zurich.ch', lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: 'https://personaltraining-zurich.ch/services', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://personaltraining-zurich.ch/personal-training-zuerich', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://personaltraining-zurich.ch/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://personaltraining-zurich.ch/kontakt', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
