interface CampaignAsset {
  id: string
  width: number
  height: number
  storageKey?: string
  url?: string
  sizeBytes?: number
}

interface CampaignMetricsSummary {
  visits: number
  renders: number
  downloads: number
}

interface Campaign {
  id: string
  name: string
  slug: string
  description?: string | null
  visibility: 'public' | 'unlisted'
  status: 'active' | 'archived' | 'suspended'
  aspectRatio: string
  createdAt: string
  updatedAt: string
  frameAsset: CampaignAsset
  thumbnailAsset: CampaignAsset | null
  metrics?: CampaignMetricsSummary
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

interface CampaignStatsResponse {
  campaign: {
    id: string
    name: string
    slug: string
  }
  totals: CampaignMetricsSummary
  dailyStats: Array<{
    date: string
    visits: number
    renders: number
    downloads: number
  }>
}

export const useApi = () => {
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { $firebaseAuth } = useNuxtApp()
    if (!$firebaseAuth || !$firebaseAuth.currentUser) {
      return {}
    }
    
    try {
      const token = await $firebaseAuth.currentUser.getIdToken()
      return {
        Authorization: `Bearer ${token}`
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return {}
    }
  }

  const getCampaigns = async (params: { page?: number; limit?: number } = {}): Promise<CampaignsResponse> => {
    const { page = 1, limit = 12 } = params
    const headers = await getAuthHeaders()
    return await $fetch('/api/campaigns', {
      query: { page, limit },
      headers
    })
  }
  
  const createCampaign = async (formData: FormData): Promise<{ success: boolean; campaign: Campaign }> => {
    const headers = await getAuthHeaders()
    return await $fetch('/api/campaigns', {
      method: 'POST',
      body: formData,
      headers
    })
  }
  
  const getCampaign = async (id: string): Promise<Campaign> => {
    const headers = await getAuthHeaders()
    return await $fetch(`/api/campaigns/${id}`, {
      headers
    })
  }

  const updateCampaign = async (id: string, payload: Partial<Pick<Campaign, 'name' | 'description' | 'visibility' | 'slug' | 'status'>>): Promise<{ success: boolean; campaign: Campaign }> => {
    const headers = await getAuthHeaders()
    return await $fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      body: payload,
      headers
    })
  }

  const updateCampaignFrame = async (id: string, file: File): Promise<{ success: boolean; campaign: Campaign }> => {
    const formData = new FormData()
    formData.append('frame', file)
    const headers = await getAuthHeaders()

    return await $fetch(`/api/campaigns/${id}/frame`, {
      method: 'PATCH',
      body: formData,
      headers
    })
  }

  const archiveCampaign = async (id: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders()
    return await $fetch(`/api/campaigns/${id}/archive`, {
      method: 'POST',
      headers
    })
  }

  const unarchiveCampaign = async (id: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders()
    return await $fetch(`/api/campaigns/${id}/unarchive`, {
      method: 'POST',
      headers
    })
  }

  const getCampaignStats = async (id: string): Promise<CampaignStatsResponse> => {
    const headers = await getAuthHeaders()
    return await $fetch(`/api/campaigns/${id}/stats`, {
      headers
    })
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

  const reportCampaign = async (slug: string, payload: { reason: 'spam' | 'inappropriate' | 'copyright' | 'other'; details?: string; reporterEmail?: string }) => {
    return await $fetch(`/api/public/campaigns/${slug}/report`, {
      method: 'POST',
      body: payload
    })
  }

  const deleteCampaign = async (id: string): Promise<{ success: boolean; message: string }> => {
    const headers = await getAuthHeaders()
    return await $fetch(`/api/campaigns/${id}`, {
      method: 'DELETE',
      headers
    })
  }
  
  return {
    getCampaigns,
    createCampaign,
    getCampaign,
    updateCampaign,
    updateCampaignFrame,
    archiveCampaign,
    unarchiveCampaign,
    getCampaignStats,
    getPublicCampaign,
    recordMetric,
    reportCampaign,
    deleteCampaign
  }
}
