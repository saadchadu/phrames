<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center py-6">
          <UButton 
            to="/dashboard" 
            variant="ghost" 
            icon="i-heroicons-arrow-left"
            class="mr-4"
          >
            Back to Dashboard
          </UButton>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900">Campaign Management</h1>
            <p class="text-gray-600">Manage your campaign settings and view analytics</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
      </div>
      
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">Failed to load campaign</p>
        <UButton @click="refresh()" class="mt-4">Try Again</UButton>
      </div>
      
      <div v-else class="grid lg:grid-cols-3 gap-8">
        <!-- Campaign Info -->
        <div class="lg:col-span-2 space-y-6">
          <UCard class="p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ data.name }}</h2>
                <p v-if="data.description" class="text-gray-600 mt-1">{{ data.description }}</p>
              </div>
              <UBadge 
                :color="data.status === 'active' ? 'green' : 'gray'"
                variant="solid"
              >
                {{ data.status }}
              </UBadge>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Public Link</h3>
                <div class="flex items-center space-x-2">
                  <UInput 
                    :value="`${$config.public.siteUrl}/c/${data.slug}`"
                    readonly
                    class="flex-1"
                  />
                  <UButton 
                    icon="i-heroicons-clipboard-document" 
                    variant="outline"
                    @click="copyLink"
                  />
                  <UButton 
                    icon="i-heroicons-arrow-top-right-on-square" 
                    variant="outline"
                    :to="`/c/${data.slug}`"
                    target="_blank"
                  />
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Settings</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Visibility:</span>
                    <UBadge 
                      :color="data.visibility === 'public' ? 'blue' : 'yellow'"
                      variant="soft"
                    >
                      {{ data.visibility }}
                    </UBadge>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Aspect Ratio:</span>
                    <span>{{ data.aspectRatio }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Created:</span>
                    <span>{{ formatDate(data.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
          
          <!-- Quick Stats -->
          <UCard class="p-6">
            <h3 class="text-lg font-semibold mb-4">Quick Stats</h3>
            <div class="text-center py-8 text-gray-500">
              <Icon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-2" />
              <p>Analytics coming soon</p>
            </div>
          </UCard>
        </div>
        
        <!-- Frame Preview -->
        <div>
          <UCard class="p-6">
            <h3 class="text-lg font-semibold mb-4">Frame Preview</h3>
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                :src="frameUrl" 
                :alt="data.name"
                class="w-full h-full object-contain"
              />
            </div>
            
            <div class="text-sm space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Dimensions:</span>
                <span>{{ data.frameAsset.width }} × {{ data.frameAsset.height }}px</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">File Size:</span>
                <span>{{ formatFileSize(data.frameAsset.sizeBytes || 0) }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()

const campaignId = String(route.params.id)

const { getCampaign } = useApi()

const { data, pending, error, refresh } = await useLazyAsyncData(
  `campaign-${campaignId}`,
  () => getCampaign(campaignId)
)

const frameUrl = computed(() => {
  if (!data.value) return ''
  return `${config.public.siteUrl}/api/assets/${data.value.frameAsset.storageKey}`
})

const copyLink = async () => {
  if (!data.value) return
  
  const url = `${config.public.siteUrl}/c/${data.value.slug}`
  try {
    await navigator.clipboard.writeText(url)
    toast.add({
      title: 'Copied!',
      description: 'Campaign link copied to clipboard',
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

useSeoMeta({
  title: computed(() => data.value ? `${data.value.name} - Campaign Management` : 'Campaign Management'),
  description: 'Manage your campaign settings and view analytics.'
})
</script>