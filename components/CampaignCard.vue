<template>
  <UiCard class="overflow-hidden hover:shadow-lg transition-shadow duration-200">
    <div class="aspect-square bg-gray-100 relative overflow-hidden">
      <img
        v-if="campaign.thumbnailAsset?.storageKey"
        :src="getAssetUrl(campaign.thumbnailAsset.storageKey)"
        :alt="campaign.name"
        class="w-full h-full object-cover"
        @error="onImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z" />
        </svg>
      </div>
      
      <!-- Status Badge -->
      <div class="absolute top-3 right-3">
        <UiBadge
          :variant="campaign.status === 'active' ? 'success' : campaign.status === 'archived' ? 'default' : 'error'"
          size="sm"
        >
          {{ campaign.status }}
        </UiBadge>
      </div>
      
      <!-- Visibility Badge -->
      <div class="absolute top-3 left-3">
        <UiBadge
          :variant="campaign.visibility === 'public' ? 'primary' : 'default'"
          size="sm"
        >
          {{ campaign.visibility }}
        </UiBadge>
      </div>
    </div>
    
    <div class="p-6">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ campaign.name }}
          </h3>
          <p v-if="campaign.description" class="text-sm text-gray-600 mt-1 line-clamp-2">
            {{ campaign.description }}
          </p>
        </div>
      </div>
      
      <!-- Metrics -->
      <div v-if="campaign.metrics" class="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900">{{ campaign.metrics.visits || 0 }}</div>
          <div class="text-xs text-gray-500">Visits</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900">{{ campaign.metrics.renders || 0 }}</div>
          <div class="text-xs text-gray-500">Renders</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900">{{ campaign.metrics.downloads || 0 }}</div>
          <div class="text-xs text-gray-500">Downloads</div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <NuxtLink :to="`/dashboard/campaigns/${campaign.id}`">
            <UiButton variant="secondary" size="sm">
              View Details
            </UiButton>
          </NuxtLink>
          
          <button
            @click="copyShareLink"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy share link"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
            </svg>
          </button>
          
          <button
            @click="showDeleteModal = true"
            class="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete campaign"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
        
        <div class="text-xs text-gray-500">
          {{ formatDate(campaign.createdAt) }}
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showDeleteModal = false">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4" @click.stop>
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.75 0a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm9-3.75h.008v.008H12V9Z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Delete Campaign</h3>
            <p class="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
        </div>
        
        <p class="text-sm text-gray-700 mb-6">
          Are you sure you want to delete "<strong>{{ campaign.name }}</strong>"? This will permanently remove the campaign and all its data.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button
            @click="deleteCampaign"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            :disabled="deleting"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
interface Campaign {
  id: string
  name: string
  slug: string
  description?: string
  visibility: 'public' | 'unlisted'
  status: 'active' | 'archived' | 'suspended'
  aspectRatio: string
  createdAt: string
  updatedAt: string
  thumbnailAsset?: {
    id: string
    width: number
    height: number
    storageKey: string
  }
  metrics?: {
    visits: number
    renders: number
    downloads: number
  }
}

interface Props {
  campaign: Campaign
}

const props = defineProps<Props>()
const toast = useToast()
const { deleteCampaign: apiDeleteCampaign } = useApi()

const showDeleteModal = ref(false)
const deleting = ref(false)

// Emit event to parent to refresh campaigns list
const emit = defineEmits<{
  deleted: [campaignId: string]
}>()

const getAssetUrl = (storageKey: string) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.s3PublicBaseUrl || ''
  return `${baseUrl}${storageKey}`
}

const onImageError = (event: Event) => {
  // Hide broken image
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const copyShareLink = async () => {
  const shareUrl = `${window.location.origin}/c/${props.campaign.slug}`
  
  try {
    await navigator.clipboard.writeText(shareUrl)
    toast.add({
      title: 'Link copied!',
      description: 'Share link has been copied to your clipboard.',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Failed to copy',
      description: 'Please copy the link manually.',
      color: 'error'
    })
  }
}

const deleteCampaign = async () => {
  deleting.value = true
  try {
    await apiDeleteCampaign(props.campaign.id)
    toast.add({
      title: 'Campaign deleted',
      description: 'The campaign has been permanently deleted.',
      color: 'success'
    })
    showDeleteModal.value = false
    emit('deleted', props.campaign.id)
  } catch (error: any) {
    const message = error?.data?.statusMessage || error?.message || 'Failed to delete campaign'
    toast.add({
      title: 'Error',
      description: message,
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>