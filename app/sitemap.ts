import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://personaltrainingbymartin.netlify.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: 'https://personaltrainingbymartin.netlify.app/services', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://personaltrainingbymartin.netlify.app/personal-training-zuerich', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://personaltrainingbymartin.netlify.app/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://personaltrainingbymartin.netlify.app/kontakt', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
