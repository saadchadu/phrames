import { Metadata } from 'next'
import { adminDb } from '@/lib/firebase-admin'

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = params

  try {
    // Fetch user profile
    const usersRef = adminDb.collection('users')
    const snapshot = await usersRef.where('username', '==', username.toLowerCase()).limit(1).get()

    if (snapshot.empty) {
      return {
        title: 'User Not Found | Phrames',
        description: 'This user profile does not exist on Phrames.',
      }
    }

    const userData = snapshot.docs[0].data()
    const displayName = userData.displayName || username
    const bio = userData.bio || `View campaigns created by ${displayName} on Phrames.`
    const profileImage = userData.profileImageUrl

    // Fetch user's first campaign for og:image fallback
    let campaignImage = null
    try {
      const campaignsRef = adminDb.collection('campaigns')
      const campaignsSnapshot = await campaignsRef
        .where('createdBy', '==', snapshot.docs[0].id)
        .where('visibility', '==', 'Public')
        .where('isActive', '==', true)
        .limit(1)
        .get()

      if (!campaignsSnapshot.empty) {
        campaignImage = campaignsSnapshot.docs[0].data().frameURL
      }
    } catch (error) {
      console.error('Error fetching campaign image:', error)
    }

    const ogImage = profileImage || campaignImage || 'https://phrames.app/images/featured-image-phrames.png'

    return {
      title: `${displayName} (@${username}) - Campaign Creator | Phrames`,
      description: bio.length > 20 ? bio : `${displayName} creates twibbon-style photo frame campaigns on Phrames. View their public campaigns and add frames to your profile picture.`,
      keywords: [
        displayName,
        `${username} twibbon`,
        `${displayName} campaign`,
        'photo frame creator',
        'twibbon campaign creator',
        'profile picture frame',
      ],
      openGraph: {
        title: `${displayName} (@${username}) - Campaign Creator | Phrames`,
        description: bio.length > 20 ? bio : `${displayName} creates photo frame campaigns on Phrames.`,
        url: `https://phrames.app/user/${username}`,
        siteName: 'Phrames',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${displayName}'s profile on Phrames`,
          },
        ],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} (@${username}) - Campaign Creator | Phrames`,
        description: bio.length > 20 ? bio : `${displayName} creates photo frame campaigns on Phrames.`,
        images: [ogImage],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: `@${username} | Phrames`,
      description: 'View this creator\'s campaigns on Phrames.',
    }
  }
}
