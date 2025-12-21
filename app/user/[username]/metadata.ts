import { Metadata } from 'next'
import { getUserByUsername } from '@/lib/auth'
import { getUserCampaigns } from '@/lib/firestore'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  try {
    const { username } = await params
    const user = await getUserByUsername(username)
    
    if (!user) {
      return {
        title: 'User Not Found | Phrames',
        description: 'The user profile you are looking for does not exist.',
      }
    }

    const campaigns = await getUserCampaigns(user.uid)
    const publicCampaigns = campaigns.filter(c => c.visibility === 'Public')
    const totalDownloads = user.totalDownloads || 0

    const title = `${user.displayName || username} (@${username}) | Phrames`
    const description = user.bio 
      ? `${user.bio} - ${publicCampaigns.length} campaigns, ${totalDownloads} downloads`
      : `View ${user.displayName || username}'s profile on Phrames. ${publicCampaigns.length} campaigns, ${totalDownloads} downloads.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        url: `https://phrames.cleffon.com/user/${username}`,
        images: user.avatarURL || user.photoURL ? [
          {
            url: user.avatarURL || user.photoURL || '',
            width: 400,
            height: 400,
            alt: `${user.displayName || username}'s profile picture`,
          }
        ] : [],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: user.avatarURL || user.photoURL ? [user.avatarURL || user.photoURL || ''] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'User Profile | Phrames',
      description: 'View creator profiles and campaigns on Phrames',
    }
  }
}
