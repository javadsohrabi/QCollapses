import { MetadataRoute } from 'next'
import exhibitsData from '../content/exhibits.json'
import papersData from '../content/papers.json'

const exhibits = exhibitsData as { id: string }[]
const papers   = papersData   as { id: string }[]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://qcollapses.com'

  const staticPages = [
    { url: base,                    lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 1.0 },
    { url: base + '/misconceptions',lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.9 },
    { url: base + '/papers',        lastModified: new Date(), changeFrequency: 'daily'   as const, priority: 0.9 },
    { url: base + '/simulator',     lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: base + '/search',        lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.7 },
    { url: base + '/about',         lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  const casePages = exhibits.map(e => ({
    url: base + '/misconceptions/' + e.id,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...casePages]
}
