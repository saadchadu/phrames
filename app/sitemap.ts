import { MetadataRoute } from 'next'
import { getPublicActiveCampaigns } from '@/lib/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://phrames.cleffon.com'
  
  // Fetch all public active campaigns for dynamic URLs
  const campaigns = await getPublicActiveCampaigns()
  
  const campaignUrls = campaigns.map((campaign) => ({
    url: `${baseUrl}/campaign/${campaign.slug}`,
    lastModified: campaign.createdAt?.toDate?.() || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...campaignUrls,
  ]
}
