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

  const title = `${campaign.campaignName} - Twibbon Frame | Phrames`
  const description = campaign.description
    ? `${campaign.description} — Add this photo frame to your profile picture on Phrames. Free twibbon frame creator, no watermarks.`
    : `Add the ${campaign.campaignName} frame to your profile picture. Free twibbon-style photo frame on Phrames — no watermarks, no sign-up required.`
  const imageUrl = campaign.frameURL
  const featuredImage = 'https://phrames.app/images/featured-image-phrames.png'

  return {
    title,
    description,
    keywords: [
      campaign.campaignName,
      `${campaign.campaignName} twibbon`,
      `${campaign.campaignName} frame`,
      `${campaign.campaignName} photo frame`,
      'twibbon frame',
      'profile picture frame',
      'photo overlay',
      'campaign frame',
      'twibbonize alternative',
      'free twibbon',
    ],
    openGraph: {
      title,
      description,
      url: `https://phrames.app/campaign/${campaign.slug}`,
      siteName: 'Phrames',
      images: [
        {
          url: campaign.frameURL || featuredImage,
          width: 1200,
          height: 630,
          alt: `${campaign.campaignName} - Twibbon Frame on Phrames`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [campaign.frameURL || featuredImage],
    },
    alternates: {
      canonical: `/campaign/${campaign.slug}`,
    },
  }
}
