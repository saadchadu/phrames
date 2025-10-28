<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600">Manage your photo frame campaigns</p>
      </div>
      <NuxtLink to="/dashboard/campaigns/new">
        <UiButton size="lg">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Campaign
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <UiCard class="p-8 max-w-md mx-auto">
        <div class="text-error-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Unable to load campaigns</h3>
        <p class="text-gray-600 mb-4">{{ error.message || 'Something went wrong' }}</p>
        <UiButton @click="refresh()" variant="secondary">
          Try again
        </UiButton>
      </UiCard>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data?.campaigns?.length" class="text-center py-12">
      <UiCard class="p-12 max-w-lg mx-auto">
        <div class="text-gray-400 mb-6">
          <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
        <p class="text-gray-600 mb-6">
          Create your first photo frame campaign to get started. Upload a PNG frame and share it with your audience.
        </p>
        <NuxtLink to="/dashboard/campaigns/new">
          <UiButton size="lg">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Your First Campaign
          </UiButton>
        </NuxtLink>
      </UiCard>
    </div>

    <!-- Campaigns Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CampaignCard
        v-for="campaign in data.campaigns"
        :key="campaign.id"
        :campaign="campaign"
        @deleted="refresh"
      />
    </div>

    <!-- Pagination -->
    <div v-if="data?.pagination && data.pagination.pages > 1" class="mt-8 flex justify-center">
      <nav class="flex items-center space-x-2">
        <UiButton
          v-if="data.pagination.page > 1"
          variant="secondary"
          size="sm"
          @click="goToPage(data.pagination.page - 1)"
        >
          Previous
        </UiButton>
        
        <span class="px-4 py-2 text-sm text-gray-700">
          Page {{ data.pagination.page }} of {{ data.pagination.pages }}
        </span>
        
        <UiButton
          v-if="data.pagination.page < data.pagination.pages"
          variant="secondary"
          size="sm"
          @click="goToPage(data.pagination.page + 1)"
        >
          Next
        </UiButton>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth protection handled by global middleware

const { getCampaigns } = useApi()

const page = ref(1)
const { data, pending, error, refresh } = await useLazyAsyncData(
  'campaigns',
  () => getCampaigns({ page: page.value }),
  {
    watch: [page]
  }
)

const goToPage = (newPage: number) => {
  page.value = newPage
}

useSeoMeta({
  title: 'Dashboard - Phrames',
  description: 'Manage your photo frame campaigns and view analytics.'
})
</script>