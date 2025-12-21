import { Metadata } from 'next'
import { getCampaignBySlug } from '@/lib/firestore'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  
  if (!campaign) {
    return {
      title: 'Campaign Not Found | Phrames',
      description: 'The campaign you are looking for does not exist.',
    }
  }

  const title = `${campaign.campaignName} | Phrames`
  const description = campaign.description || `Create your personalized photo with the ${campaign.campaignName} frame on Phrames.`
  const imageUrl = campaign.frameURL

  return {
    title,
    description,
    keywords: ['photo frame', campaign.campaignName, 'campaign', 'photo editor', 'frame generator'],
    openGraph: {
      title,
      description,
      url: `https://phrames.cleffon.com/campaign/${campaign.slug}`,
      siteName: 'Phrames',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: campaign.campaignName,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/campaign/${campaign.slug}`,
    },
  }
}
