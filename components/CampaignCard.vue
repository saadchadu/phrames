<template>
  <UCard class="overflow-hidden hover:shadow-lg transition-shadow">
    <div class="aspect-square bg-gray-100 relative overflow-hidden">
      <img 
        v-if="thumbnailUrl"
        :src="thumbnailUrl" 
        :alt="campaign.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="i-heroicons-photo" class="w-12 h-12 text-gray-400" />
      </div>
      
      <div class="absolute top-2 right-2">
        <UBadge 
          :color="campaign.status === 'active' ? 'green' : 'gray'"
          variant="solid"
        >
          {{ campaign.status }}
        </UBadge>
      </div>
    </div>
    
    <template #header>
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ campaign.name }}
          </h3>
          <p v-if="campaign.description" class="text-sm text-gray-600 mt-1 line-clamp-2">
            {{ campaign.description }}
          </p>
        </div>
        
        <UDropdown :items="menuItems">
          <UButton 
            icon="i-heroicons-ellipsis-vertical" 
            variant="ghost" 
            size="sm"
          />
        </UDropdown>
      </div>
    </template>
    
    <div class="space-y-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Public Link:</span>
        <div class="flex items-center space-x-2">
          <code class="text-xs bg-gray-100 px-2 py-1 rounded">
            /c/{{ campaign.slug }}
          </code>
          <UButton 
            icon="i-heroicons-clipboard-document" 
            variant="ghost" 
            size="xs"
            @click="copyLink"
          />
        </div>
      </div>
      
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Visibility:</span>
        <UBadge 
          :color="campaign.visibility === 'public' ? 'blue' : 'yellow'"
          variant="soft"
        >
          {{ campaign.visibility }}
        </UBadge>
      </div>
      
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Created:</span>
        <span class="text-gray-900">
          {{ formatDate(campaign.createdAt) }}
        </span>
      </div>
    </div>
    
    <template #footer>
      <div class="flex space-x-2">
        <UButton 
          :to="`/c/${campaign.slug}`" 
          variant="outline" 
          size="sm"
          class="flex-1"
          target="_blank"
        >
          Preview
        </UButton>
        <UButton 
          :to="`/dashboard/campaigns/${campaign.id}`" 
          size="sm"
          class="flex-1"
        >
          Manage
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
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

interface Props {
  campaign: Campaign
}

const props = defineProps<Props>()
const toast = useToast()
const config = useRuntimeConfig()

const thumbnailUrl = computed(() => {
  // In a real app, you'd have thumbnail URLs from the API
  return `${config.public.siteUrl}/api/assets/${props.campaign.frameAsset.storageKey}`
})

const menuItems = [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil-square',
    to: `/dashboard/campaigns/${props.campaign.id}`
  }],
  [{
    label: 'Archive',
    icon: 'i-heroicons-archive-box',
    click: () => archiveCampaign()
  }]
]

const copyLink = async () => {
  const url = `${config.public.siteUrl}/c/${props.campaign.slug}`
  try {
    await navigator.clipboard.writeText(url)
    toast.add({
      title: 'Copied!',
      description: 'Link copied to clipboard',
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to copy link',
      color: 'red'
    })
  }
}

const archiveCampaign = async () => {
  // TODO: Implement archive functionality
  toast.add({
    title: 'Coming Soon',
    description: 'Archive functionality will be available soon',
    color: 'blue'
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>