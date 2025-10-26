<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600">Manage your photo frame campaigns</p>
          </div>
          <div class="flex items-center space-x-4">
            <UButton to="/dashboard/campaigns/new" icon="i-heroicons-plus">
              New Campaign
            </UButton>
            <UButton variant="ghost" @click="handleLogout" icon="i-heroicons-arrow-right-on-rectangle">
              Sign Out
            </UButton>
          </div>
        </div>
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="pending" class="flex justify-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p class="text-gray-600">Loading your campaigns...</p>
        </div>
      </div>
      
      <div v-else-if="error" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <Icon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load campaigns</h3>
          <p class="text-gray-600 mb-6">
            There was an error loading your campaigns. Please check your connection and try again.
          </p>
          <UButton @click="refresh()" size="lg">Try Again</UButton>
        </div>
      </div>
      
      <div v-else-if="!data?.campaigns?.length" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <Icon name="i-heroicons-photo" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
          <p class="text-gray-600 mb-6">
            Create your first photo frame campaign to get started.
          </p>
          <UButton to="/dashboard/campaigns/new" size="lg">
            Create Your First Campaign
          </UButton>
        </div>
      </div>
      
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CampaignCard 
            v-for="campaign in data.campaigns" 
            :key="campaign.id"
            :campaign="campaign"
          />
        </div>
        
        <!-- Pagination -->
        <div v-if="data.pagination.pages > 1" class="mt-8 flex justify-center">
          <UPagination 
            v-model="currentPage"
            :page-count="data.pagination.limit"
            :total="data.pagination.total"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { logout, initAuth } = useAuth()
const { getCampaigns } = useApi()
const toast = useToast()

// Initialize Firebase auth
onMounted(() => {
  initAuth()
})

const currentPage = ref(1)

const { data, pending, error, refresh } = await useLazyAsyncData(
  'campaigns',
  () => getCampaigns(currentPage.value),
  {
    watch: [currentPage]
  }
)

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to sign out',
      color: 'red'
    })
  }
}

useSeoMeta({
  title: 'Dashboard - Phrames',
  description: 'Manage your photo frame campaigns and view analytics.'
})
</script>