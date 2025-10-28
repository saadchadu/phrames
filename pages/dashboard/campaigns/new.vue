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
            Back
          </UButton>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Create New Campaign</h1>
            <p class="text-gray-600">Upload a PNG frame and set up your campaign</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Form -->
        <div>
          <UCard class="p-6">
            <UForm 
              :schema="campaignSchema" 
              :state="form" 
              @submit="handleSubmit"
              class="space-y-6"
            >
              <UFormGroup label="Campaign Name" name="name" required>
                <UInput 
                  v-model="form.name" 
                  placeholder="Enter campaign name"
                  :disabled="loading"
                  @input="generateSlug"
                />
              </UFormGroup>
              
              <UFormGroup label="URL Slug" name="slug" required>
                <UInput 
                  v-model="form.slug" 
                  placeholder="campaign-url-slug"
                  :disabled="loading"
                  @blur="normaliseSlug"
                />
                <template #help>
                  {{ slugHelp }}
                </template>
              </UFormGroup>
              
              <UFormGroup label="Description" name="description">
                <UTextarea 
                  v-model="form.description" 
                  placeholder="Optional description for your campaign"
                  :disabled="loading"
                  rows="3"
                />
              </UFormGroup>
              
              <UFormGroup label="Visibility" name="visibility" required>
                <URadioGroup 
                  v-model="form.visibility" 
                  :options="visibilityOptions"
                  :disabled="loading"
                />
              </UFormGroup>
              
              <FrameUpload 
                @file-selected="handleFrameSelected"
                :loading="loading"
              />
              
              <UButton 
                type="submit" 
                block 
                size="lg"
                :loading="loading"
                :disabled="loading || !frameFile"
              >
                Create Campaign
              </UButton>
            </UForm>
          </UCard>
        </div>
        
        <!-- Preview -->
        <div>
          <UCard class="p-6">
            <h3 class="text-lg font-semibold mb-4">Preview</h3>
            
            <div v-if="!framePreview" class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <Icon name="i-heroicons-photo" class="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-600">Upload a PNG frame to see preview</p>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  :src="framePreview" 
                  alt="Frame preview"
                  class="w-full h-full object-contain"
                />
              </div>
              
              <div class="text-sm space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Dimensions:</span>
                  <span>{{ frameInfo?.width }} × {{ frameInfo?.height }}px</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Aspect Ratio:</span>
                  <span>{{ aspectRatio }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Has Transparency:</span>
                  <span class="text-green-600">✓ Yes</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

// Auth protection handled by global middleware

const { createCampaign } = useApi()
const toast = useToast()
const router = useRouter()

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'unlisted'])
})

const visibilityOptions = [
  { value: 'public', label: 'Public', help: 'Anyone can find and use this campaign' },
  { value: 'unlisted', label: 'Unlisted', help: 'Only people with the link can access' }
]

const form = reactive({
  name: '',
  slug: '',
  description: '',
  visibility: 'public'
})

const loading = ref(false)
const frameFile = ref<File | null>(null)
const framePreview = ref<string | null>(null)
const frameInfo = ref<{ width: number; height: number } | null>(null)
const slugHelp = ref('Your campaign will be available at: /c/your-slug')

const aspectRatio = computed(() => {
  if (!frameInfo.value) return ''
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(frameInfo.value.width, frameInfo.value.height)
  return `${frameInfo.value.width / divisor}:${frameInfo.value.height / divisor}`
})

const generateSlug = () => {
  if (!form.name) return
  if (!form.slug) {
    form.slug = slugify(form.name)
  }
  updateSlugHelp()
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const normaliseSlug = () => {
  form.slug = slugify(form.slug)
  updateSlugHelp()
}

const updateSlugHelp = () => {
  slugHelp.value = `Your campaign will be available at: /c/${form.slug || 'your-slug'}`
}

const handleFrameSelected = (file: File, preview: string, info: { width: number; height: number }) => {
  frameFile.value = file
  framePreview.value = preview
  frameInfo.value = info
}

const handleSubmit = async () => {
  if (!frameFile.value) {
    toast.add({
      title: 'Error',
      description: 'Please select a frame image',
      color: 'red'
    })
    return
  }
  
  loading.value = true
  
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('slug', form.slug)
    formData.append('visibility', form.visibility)
    if (form.description) {
      formData.append('description', form.description)
    }
    formData.append('frame', frameFile.value)
    
    const result = await createCampaign(formData)
    
    toast.add({
      title: 'Success',
      description: 'Campaign created successfully!',
      color: 'green'
    })
    
    await router.push(`/dashboard/campaigns/${result.campaign.id}`)
  } catch (error: unknown) {
    const apiMessage =
      typeof error === 'object' && error !== null && 'data' in error && (error as any).data?.statusMessage
        ? (error as any).data.statusMessage
        : null
    const message = apiMessage || (error instanceof Error ? error.message : 'Failed to create campaign')

    if (message.toLowerCase().includes('slug') && message.toLowerCase().includes('exists')) {
      const suggestion = suggestSlug(form.slug || form.name)
      form.slug = suggestion
      updateSlugHelp()
      toast.add({
        title: 'Slug already in use',
        description: `Try this available slug instead: ${suggestion}`,
        color: 'yellow'
      })
      return
    }

    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Create Campaign - Phrames',
  description: 'Create a new photo frame campaign.'
})

const suggestSlug = (base: string) => {
  const baseSlug = slugify(base || 'campaign')
  const suffix = Math.floor(Math.random() * 900 + 100)
  return `${baseSlug}-${suffix}`
}

watch(() => form.slug, () => {
  updateSlugHelp()
})

onMounted(() => {
  updateSlugHelp()
})
</script>
