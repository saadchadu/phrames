<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-6">
          <div class="flex items-center">
            <UButton to="/dashboard" variant="ghost" icon="i-heroicons-arrow-left" class="mr-4">
              Back to Dashboard
            </UButton>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Campaign Management</h1>
              <p class="text-gray-600">Update campaign details, frame assets, and review engagement.</p>
            </div>
          </div>
          <UBadge :color="statusBadge.color" variant="solid">
            {{ statusBadge.label }}
          </UBadge>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-blue-600" />
      </div>

      <div v-else-if="error" class="text-center py-12">
        <Icon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Unable to load campaign</h3>
        <p class="text-gray-600 mb-6">Please refresh the page or return to the dashboard.</p>
        <UButton @click="refresh()" size="lg">Retry</UButton>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-8">
        <!-- Primary column -->
        <div class="lg:col-span-2 space-y-6">
          <UCard class="p-6 space-y-6">
            <header class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Campaign Settings</h2>
                <p class="text-gray-600 text-sm">
                  Edit the campaign details that appear on the public page and dashboard.
                </p>
              </div>
              <UButton size="sm" variant="ghost" icon="i-heroicons-clipboard-document" @click="copyLink">
                Copy Link
              </UButton>
            </header>

            <UAlert
              v-if="isSuspended"
              icon="i-heroicons-shield-exclamation"
              color="red"
              variant="soft"
              title="Campaign Suspended"
              description="This campaign is currently suspended due to reports. Updates are locked until reviewed."
            />

            <UForm :state="formState" @submit="handleSave" class="space-y-5">
              <UFormGroup label="Campaign Name" name="name" required>
                <UInput
                  v-model="formState.name"
                  placeholder="Spring Launch Photo Booth"
                  :disabled="saving || isSuspended"
                />
              </UFormGroup>

              <UFormGroup label="Public URL Slug" name="slug" required>
                <UInput
                  v-model="formState.slug"
                  placeholder="spring-launch"
                  :disabled="saving || isSuspended"
                  @blur="normaliseSlug"
                />
                <template #help>
                  {{ slugHelp }}
                </template>
              </UFormGroup>

              <UFormGroup label="Description" name="description">
                <UTextarea
                  v-model="formState.description"
                  placeholder="Optional description shown on the public page."
                  :disabled="saving || isSuspended"
                  rows="3"
                />
              </UFormGroup>

              <div class="grid md:grid-cols-2 gap-4">
                <UFormGroup label="Visibility" name="visibility" required>
                  <USelect
                    v-model="formState.visibility"
                    :options="visibilityOptions"
                    :disabled="saving || isSuspended"
                  />
                </UFormGroup>

                <UFormGroup label="Status" name="status" required>
                  <USelect
                    v-model="formState.status"
                    :options="statusOptions"
                    :disabled="saving || isSuspended"
                  />
                </UFormGroup>
              </div>

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  Last updated {{ formatDateTime(campaign?.value?.updatedAt) }}
                </div>
                <UButton
                  type="submit"
                  size="lg"
                  :loading="saving"
                  :disabled="isSuspended || saving"
                >
                  Save changes
                </UButton>
              </div>
            </UForm>
          </UCard>

          <UCard class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Performance (last 30 days)</h3>
                <p class="text-sm text-gray-600">Engagement across visits, renders, and downloads.</p>
              </div>
              <UButton variant="ghost" size="sm" icon="i-heroicons-arrow-path" @click="refreshStats()" :loading="statsPending">
                Refresh
              </UButton>
            </div>

            <div v-if="statsPending" class="flex items-center justify-center h-24 text-gray-500">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
            </div>
            <div v-else-if="!statsData?.value?.dailyStats?.length" class="text-center py-8 text-gray-500">
              <Icon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-2" />
              <p>No metrics yet. Share the campaign link to start collecting data.</p>
            </div>
            <div v-else class="space-y-6">
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-blue-50 text-blue-700 rounded-lg p-4 text-center">
                  <p class="text-xs uppercase tracking-wide">Visits</p>
                  <p class="text-2xl font-semibold">{{ statsSummary.visits }}</p>
                </div>
                <div class="bg-emerald-50 text-emerald-700 rounded-lg p-4 text-center">
                  <p class="text-xs uppercase tracking-wide">Renders</p>
                  <p class="text-2xl font-semibold">{{ statsSummary.renders }}</p>
                </div>
                <div class="bg-purple-50 text-purple-700 rounded-lg p-4 text-center">
                  <p class="text-xs uppercase tracking-wide">Downloads</p>
                  <p class="text-2xl font-semibold">{{ statsSummary.downloads }}</p>
                </div>
              </div>

              <UTable :rows="statsRows" :columns="statsColumns" :ui="{ td: { base: 'text-sm' } }" />
            </div>
          </UCard>
        </div>

        <!-- Secondary column -->
        <div class="space-y-6">
          <UCard class="p-6 space-y-4">
            <header class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Frame Asset</h3>
              <UBadge variant="soft">{{ campaign?.value?.aspectRatio }}</UBadge>
            </header>

            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                v-if="frameUrl"
                :src="frameUrl"
                :alt="campaign?.value?.name"
                class="w-full h-full object-contain"
              />
              <Icon v-else name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
            </div>

            <div class="text-sm text-gray-600 space-y-1">
              <p><span class="font-medium text-gray-700">Dimensions:</span> {{ campaign?.value?.frameAsset.width }} × {{ campaign?.value?.frameAsset.height }}px</p>
              <p><span class="font-medium text-gray-700">File Size:</span> {{ formatFileSize(campaign?.value?.frameAsset.sizeBytes || 0) }}</p>
            </div>

            <div class="space-y-2">
              <input
                ref="frameInput"
                type="file"
                accept="image/png"
                class="hidden"
                @change="handleFrameReplacement"
              />
              <UButton
                variant="outline"
                block
                icon="i-heroicons-photo"
                :loading="replacingFrame"
                :disabled="replacingFrame || isSuspended"
                @click="triggerFramePicker"
              >
                Replace Frame PNG
              </UButton>
              <p class="text-xs text-gray-500">
                Upload a PNG frame (≥1080px, with transparency). The existing frame will remain available until the new one is uploaded.
              </p>
            </div>
          </UCard>

          <UCard class="p-6 space-y-3">
            <h3 class="text-lg font-semibold text-gray-900">Campaign Metadata</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <p><span class="font-medium text-gray-700">Created:</span> {{ formatDateTime(campaign?.value?.createdAt) }}</p>
              <p><span class="font-medium text-gray-700">Last Updated:</span> {{ formatDateTime(campaign?.value?.updatedAt) }}</p>
              <p><span class="font-medium text-gray-700">Visibility:</span> {{ campaign?.value?.visibility }}</p>
              <p><span class="font-medium text-gray-700">Share Link:</span> <code class="bg-gray-100 px-2 py-1 rounded text-xs">/c/{{ campaign?.value?.slug }}</code></p>
            </div>
          </UCard>

          <UCard class="p-6 space-y-3">
            <h3 class="text-lg font-semibold text-red-900">Danger Zone</h3>
            <p class="text-sm text-gray-600">
              Permanently delete this campaign. This action cannot be undone.
            </p>
            <UButton
              color="red"
              variant="outline"
              block
              icon="i-heroicons-trash"
              :loading="deleting"
              :disabled="deleting || isSuspended"
              @click="confirmDelete"
            >
              Delete Campaign
            </UButton>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { getCampaign, updateCampaign, updateCampaignFrame, getCampaignStats, deleteCampaign } = useApi()

const campaignId = String(route.params.id)

const { data: campaign, pending, error, refresh } = await useLazyAsyncData(
  `campaign-${campaignId}`,
  () => getCampaign(campaignId)
)

const { data: statsData, pending: statsPending, refresh: refreshStats } = await useLazyAsyncData(
  `campaign-${campaignId}-stats`,
  () => getCampaignStats(campaignId)
)

const formState = reactive({
  name: '',
  slug: '',
  description: '',
  visibility: 'public',
  status: 'active'
})

const saving = ref(false)
const replacingFrame = ref(false)
const deleting = ref(false)
const frameInput = ref<HTMLInputElement | null>(null)
const slugHelp = ref('Your campaign will be available at: /c/your-slug')

const isSuspended = computed(() => campaign.value?.status === 'suspended')

watch(
  campaign,
  (value) => {
    if (!value) return
    formState.name = value.name
    formState.slug = value.slug
    formState.description = value.description || ''
    formState.visibility = value.visibility
    formState.status = value.status
    updateSlugHelp()
  },
  { immediate: true }
)

const frameUrl = computed(() => {
  if (!campaign.value?.frameAsset?.storageKey) return ''
  return `/api/assets/${campaign.value.frameAsset.storageKey}`
})

const visibilityOptions = [
  { label: 'Public', value: 'public' },
  { label: 'Unlisted', value: 'unlisted' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Suspended', value: 'suspended', disabled: true }
]

const statusBadge = computed(() => {
  switch (campaign.value?.status) {
    case 'archived':
      return { color: 'gray', label: 'Archived' }
    case 'suspended':
      return { color: 'red', label: 'Suspended' }
    default:
      return { color: 'green', label: 'Active' }
  }
})

const statsSummary = computed(() => {
  if (!statsData.value) {
    return { visits: 0, renders: 0, downloads: 0 }
  }
  return statsData.value.totals
})

const statsRows = computed(() => {
  return (statsData.value?.dailyStats || []).map((entry) => ({
    date: entry.date,
    visits: entry.visits,
    renders: entry.renders,
    downloads: entry.downloads
  }))
})

const statsColumns = [
  { key: 'date', label: 'Date' },
  { key: 'visits', label: 'Visits' },
  { key: 'renders', label: 'Renders' },
  { key: 'downloads', label: 'Downloads' }
]

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const updateSlugHelp = () => {
  slugHelp.value = `Your campaign will be available at: /c/${formState.slug || 'your-slug'}`
}

const normaliseSlug = () => {
  formState.slug = slugify(formState.slug)
  updateSlugHelp()
}

const handleSave = async () => {
  if (!campaign.value) return
  if (isSuspended.value) return

  const payload: Record<string, any> = {}

  if (formState.name !== campaign.value.name) {
    payload.name = formState.name
  }
  if (formState.slug !== campaign.value.slug) {
    payload.slug = formState.slug
  }
  if ((formState.description || null) !== (campaign.value.description || null)) {
    payload.description = formState.description
  }
  if (formState.visibility !== campaign.value.visibility) {
    payload.visibility = formState.visibility
  }
  if (
    formState.status !== campaign.value.status &&
    campaign.value.status !== 'suspended' &&
    formState.status !== 'suspended'
  ) {
    payload.status = formState.status
  }

  if (Object.keys(payload).length === 0) {
    toast.add({
      title: 'No changes',
      description: 'Update some fields before saving.',
      color: 'gray'
    })
    return
  }

  saving.value = true
  try {
    await updateCampaign(campaignId, payload)
    toast.add({
      title: 'Campaign updated',
      description: 'Your changes are live.',
      color: 'green'
    })
    await refresh()
  } catch (error: any) {
    const message = error?.data?.statusMessage || error?.message || 'Failed to update campaign'
    if (message.toLowerCase().includes('slug') && message.toLowerCase().includes('exists')) {
      const suggestion = suggestSlug(formState.slug || formState.name)
      formState.slug = suggestion
      updateSlugHelp()
      toast.add({
        title: 'Slug already in use',
        description: `Try this available slug instead: ${suggestion}`,
        color: 'yellow'
      })
    } else {
      toast.add({
        title: 'Error',
        description: message,
        color: 'red'
      })
    }
  } finally {
    saving.value = false
  }
}

const triggerFramePicker = () => {
  if (isSuspended.value) return
  frameInput.value?.click()
}

const handleFrameReplacement = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  replacingFrame.value = true
  try {
    await updateCampaignFrame(campaignId, file)
    toast.add({
      title: 'Frame updated',
      description: 'The new frame is now live.',
      color: 'green'
    })
    await refresh()
  } catch (error: any) {
    const message = error?.data?.statusMessage || error?.message || 'Failed to update frame'
    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
  } finally {
    replacingFrame.value = false
  }
}

const confirmDelete = async () => {
  if (!campaign.value) return
  
  const confirmed = confirm(
    `Are you sure you want to delete "${campaign.value.name}"?\n\n` +
    'This action cannot be undone.'
  )
  
  if (!confirmed) return
  
  deleting.value = true
  try {
    await deleteCampaign(campaignId)
    toast.add({
      title: 'Campaign deleted',
      description: 'The campaign has been permanently deleted.',
      color: 'green'
    })
    await router.push('/dashboard')
  } catch (error: any) {
    const message = error?.data?.statusMessage || error?.message || 'Failed to delete campaign'
    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
  } finally {
    deleting.value = false
  }
}

const copyLink = async () => {
  if (!campaign.value) return
  if (!process.client) return
  const link = `${window.location.origin}/c/${campaign.value.slug}`
  try {
    await navigator.clipboard.writeText(link)
    toast.add({
      title: 'Copied',
      description: 'Campaign link copied to clipboard.',
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Unable to copy link. Try copying manually.',
      color: 'red'
    })
  }
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString()
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const suggestSlug = (base: string) => {
  const baseSlug = slugify(base || 'campaign')
  const suffix = Math.floor(Math.random() * 900 + 100)
  return `${baseSlug}-${suffix}`
}

useSeoMeta({
  title: computed(() => campaign.value ? `${campaign.value.name} • Manage Campaign` : 'Manage Campaign'),
  description: 'Manage campaign settings, assets, and engagement analytics.'
})
</script>
