interface Campaign {
  id: string
  name: string
  slug: string
  description?: string
  visibility: 'public' | 'unlisted'
  status: 'active' | 'archived'
  aspectRatio: string
  createdAt: string
  updatedAt: string
  frameAsset: {
    id: string
    width: number
    height: number
    storageKey: string
  }
  statsCount?: number
}

interface CampaignsResponse {
  campaigns: Campaign[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const useApi = () => {
  const { getIdToken } = useAuth()
  
  const getCampaigns = async (page: number = 1, limit: number = 10): Promise<CampaignsResponse> => {
    const token = await getIdToken()
    const options: any = {
      query: { page, limit }
    }
    
    if (token) {
      options.headers = { Authorization: `Bearer ${token}` }
    }
    
    return await $fetch('/api/campaigns', options)
  }
  
  const createCampaign = async (formData: FormData): Promise<{ success: boolean; campaign: Campaign }> => {
    const token = await getIdToken()
    const options: any = {
      method: 'POST',
      body: formData
    }
    
    if (token) {
      options.headers = { Authorization: `Bearer ${token}` }
    }
    
    return await $fetch('/api/campaigns', options)
  }
  
  const getCampaign = async (id: string): Promise<Campaign> => {
    const token = await getIdToken()
    const options: any = {}
    
    if (token) {
      options.headers = { Authorization: `Bearer ${token}` }
    }
    
    return await $fetch(`/api/campaigns/${id}`, options)
  }
  
  const getPublicCampaign = async (slug: string) => {
    return await $fetch(`/api/public/campaigns/${slug}`)
  }
  
  const recordMetric = async (slug: string, event: 'visit' | 'render' | 'download') => {
    return await $fetch(`/api/public/campaigns/${slug}/metrics`, {
      method: 'POST',
      body: { event }
    })
  }
  
  return {
    getCampaigns,
    createCampaign,
    getCampaign,
    getPublicCampaign,
    recordMetric
  }
}