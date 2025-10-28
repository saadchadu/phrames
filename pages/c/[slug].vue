<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600" />
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow">
        <Icon name="i-heroicons-face-frown" class="w-14 h-14 text-gray-400 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ errorStatus === 410 ? 'Campaign Unavailable' : 'Campaign Not Found' }}
        </h1>
        <p class="text-gray-600 mb-6">
          {{ errorStatus === 410 ? 'The creator has temporarily disabled this campaign. Please check back later.' : 'The campaign you are looking for might have been removed or never existed.' }}
        </p>
        <UButton to="/">Go Home</UButton>
      </div>
    </div>

    <div v-else-if="campaignData" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <header class="text-center space-y-3">
        <UBadge v-if="campaignData.visibility === 'unlisted'" color="yellow" variant="soft">
          Unlisted — share the link directly
        </UBadge>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ campaignData.name }}
        </h1>
        <p v-if="campaignData.description" class="text-lg text-gray-600 max-w-3xl mx-auto">
          {{ campaignData.description }}
        </p>
        <p class="text-sm text-gray-500">Upload a photo, position it beneath the frame, and download your finished image in seconds.</p>
      </header>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Upload & Controls -->
        <div class="space-y-6">
          <UCard class="p-6 space-y-5">
            <h2 class="text-lg font-semibold text-gray-900">Upload Your Photo</h2>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors"
              :class="{ 'border-blue-500 bg-blue-50': isDragging }"
              @drop="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />

              <div v-if="!userImageFile" class="space-y-4">
                <Icon name="i-heroicons-cloud-arrow-up" class="w-14 h-14 text-gray-400 mx-auto" />
                <div class="space-y-2">
                  <p class="text-lg font-medium text-gray-900">Choose Your Photo</p>
                  <p class="text-gray-600">Drag an image here or select one from your device.</p>
                </div>
                <UButton variant="outline" @click="triggerFilePicker">
                  Select Photo
                </UButton>
              </div>

              <div v-else class="space-y-4">
                <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-emerald-500 mx-auto" />
                <div class="space-y-1">
                  <p class="font-medium text-gray-900">Photo ready: {{ userImageFile.name }}</p>
                  <p class="text-sm text-gray-500">Adjust the position and zoom using the controls below.</p>
                </div>
                <div class="flex justify-center space-x-2">
                  <UButton variant="outline" size="sm" @click="triggerFilePicker">
                    Change Photo
                  </UButton>
                  <UButton variant="ghost" size="sm" color="red" @click="clearUserImage">
                    Remove
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard v-if="userImageFile" class="p-6 space-y-4">
            <h2 class="text-lg font-semibold text-gray-900">Fine Tune</h2>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {{ Math.round(composer.state.scale * 100) }}%
              </label>
              <URange v-model="zoomValue" :min="10" :max="300" :step="5" @input="handleZoomChange" />
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton variant="outline" size="sm" class="flex-1" @click="resetImage">
                Reset Position
              </UButton>
              <UButton size="sm" class="flex-1" @click="downloadPng">
                Download PNG
              </UButton>
              <UButton variant="outline" size="sm" class="flex-1" @click="downloadJpeg">
                Download JPEG
              </UButton>
            </div>
          </UCard>

          <UAlert icon="i-heroicons-shield-check" color="gray" variant="soft">
            <template #title>Privacy first</template>
            <template #description>
              Your photo never leaves this browser window. We compose the frame on your device, keep nothing on our servers, and add no watermarks or ads.
            </template>
          </UAlert>
        </div>

        <!-- Preview -->
        <div>
          <UCard class="p-6 space-y-4">
            <h2 class="text-lg font-semibold text-gray-900">Live Preview</h2>
            <div class="relative">
              <canvas
                ref="canvasRef"
                class="w-full border rounded-lg shadow-sm bg-white"
                :class="{ 'cursor-grab': userImageFile, 'cursor-grabbing': isDragging }"
                @mousedown="startDrag"
                @mousemove="drag"
                @mouseup="endDrag"
                @mouseleave="endDrag"
                @touchstart="startDrag"
                @touchmove="drag"
                @touchend="endDrag"
              />
              <div
                v-if="!userImageFile"
                class="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-900/60 text-white"
              >
                <p class="text-sm font-medium">Upload a photo to begin</p>
              </div>
            </div>
            <p class="text-xs text-gray-500 text-center">
              Tip: Drag the image to reposition it under the frame, or pinch/scroll to zoom.
            </p>
          </UCard>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <UCard class="p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Frame Details</h2>
          <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <p class="font-medium text-gray-700">Aspect Ratio</p>
              <p>{{ campaignData.aspectRatio }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">Frame Size</p>
              <p>{{ campaignData.frameAsset.width }} × {{ campaignData.frameAsset.height }} px</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">Visibility</p>
              <p>{{ campaignData.visibility }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">Creator</p>
              <p>Trusted creator on Phrames</p>
            </div>
          </div>
        </UCard>

        <UCard class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Report Campaign</h2>
            <UTooltip text="Flag inappropriate or abusive content">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-gray-400" />
            </UTooltip>
          </div>
          <p class="text-sm text-gray-600">
            We rely on the community to keep Phrames positive. Reports are reviewed quickly and may result in a suspension of the campaign or creator account.
          </p>

          <div class="space-y-3">
            <USelect v-model="reportState.reason" :options="reportReasons" :disabled="reporting || hasReported" />
            <UTextarea
              v-model="reportState.details"
              :disabled="reporting || hasReported"
              placeholder="Share any additional details (optional)"
              rows="3"
            />
            <UInput
              v-model="reportState.reporterEmail"
              :disabled="reporting || hasReported"
              type="email"
              placeholder="Email for follow-up (optional)"
            />
            <UButton
              color="red"
              :loading="reporting"
              :disabled="reporting || hasReported"
              block
              @click="submitReport"
            >
              {{ hasReported ? 'Report submitted' : 'Submit report' }}
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

const route = useRoute()
const toast = useToast()
const { getPublicCampaign, recordMetric, reportCampaign } = useApi()
const composer = useCanvasComposer()

const slug = String(route.params.slug)

const { data: campaign, pending, error } = await useLazyAsyncData(
  `campaign-${slug}`,
  () => getPublicCampaign(slug)
)

const errorStatus = computed(() => (error.value as any)?.statusCode || 0)
const campaignData = computed(() => campaign.value)

const fileInput = ref<HTMLInputElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const userImageFile = ref<File | null>(null)
const zoomValue = ref(100)
const isDragging = ref(false)
const reporting = ref(false)
const hasReported = ref(false)

const dragState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  startOffsetX: 0,
  startOffsetY: 0
})

const reportState = reactive({
  reason: 'spam',
  details: '',
  reporterEmail: ''
})

const reportReasons = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'copyright', label: 'Copyright infringement' },
  { value: 'other', label: 'Something else' }
]

const initializeCanvas = async () => {
  if (!process.client || !canvasRef.value || !campaignData.value) {
    return
  }

  try {
    const { frameAsset } = campaignData.value
    composer.initCanvas(canvasRef.value, frameAsset.width, frameAsset.height)
    
    // Ensure absolute URL for frame image
    const frameUrl = frameAsset.url.startsWith('http') 
      ? frameAsset.url 
      : `${window.location.origin}${frameAsset.url}`
    
    console.log('Loading frame image:', frameUrl)
    await composer.loadFrameImage(frameUrl)
    composer.render()
    console.log('Canvas initialized successfully')
  } catch (error) {
    console.error('Failed to initialize canvas:', error)
  }
}

if (process.client) {
  watch(
    campaign,
    async (value) => {
      if (value) {
        recordMetric(slug, 'visit').catch(() => {})
        await nextTick()
        await initializeCanvas()
      }
    },
    { immediate: true }
  )
}

const triggerFilePicker = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (file) {
    await processFile(file)
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    await processFile(file)
  }
}

const processFile = async (file: File) => {
  try {
    userImageFile.value = file
    await composer.loadUserImage(file)
    zoomValue.value = Math.round(composer.state.scale * 100)
    recordMetric(slug, 'render').catch(() => {})
  } catch (err) {
    console.error('Error processing file:', err)
    toast.add({
      title: 'Unsupported image',
      description: 'Please try a different photo (JPG, PNG, or HEIC).',
      color: 'red'
    })
  }
}

const handleZoomChange = (value: number) => {
  composer.setScale(value / 100)
}

const resetImage = () => {
  composer.resetTransform()
  zoomValue.value = Math.round(composer.state.scale * 100)
}

const clearUserImage = () => {
  userImageFile.value = null
  composer.clearUserImage()
  zoomValue.value = 100
}

const downloadPng = () => {
  if (!campaignData.value || !userImageFile.value) return
  composer.downloadImage(`${campaignData.value.name}-phrames.png`, 'png')
  recordMetric(slug, 'download').catch(() => {})
}

const downloadJpeg = () => {
  if (!campaignData.value || !userImageFile.value) return
  composer.downloadImage(`${campaignData.value.name}-phrames.jpg`, 'jpeg')
  recordMetric(slug, 'download').catch(() => {})
}

const getEventPos = (event: MouseEvent | TouchEvent) => {
  if ('touches' in event) {
    const touch = event.touches[0]
    return { x: touch.clientX, y: touch.clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

const startDrag = (event: MouseEvent | TouchEvent) => {
  if (!userImageFile.value) return
  event.preventDefault()

  const pos = getEventPos(event)
  dragState.isDragging = true
  isDragging.value = true
  dragState.startX = pos.x
  dragState.startY = pos.y
  dragState.startOffsetX = composer.state.offsetX
  dragState.startOffsetY = composer.state.offsetY
}

const drag = (event: MouseEvent | TouchEvent) => {
  if (!dragState.isDragging || !userImageFile.value) return
  event.preventDefault()

  const pos = getEventPos(event)
  const deltaX = pos.x - dragState.startX
  const deltaY = pos.y - dragState.startY
  composer.setOffset(dragState.startOffsetX + deltaX, dragState.startOffsetY + deltaY)
}

const endDrag = () => {
  dragState.isDragging = false
  isDragging.value = false
}

const submitReport = async () => {
  if (reporting.value || hasReported.value) return
  reporting.value = true
  try {
    await reportCampaign(slug, {
      reason: reportState.reason as 'spam' | 'inappropriate' | 'copyright' | 'other',
      details: reportState.details || undefined,
      reporterEmail: reportState.reporterEmail || undefined
    })
    hasReported.value = true
    reportState.details = ''
    reportState.reporterEmail = ''
    toast.add({
      title: 'Report submitted',
      description: 'Thank you for helping keep Phrames safe. Our team will review it shortly.',
      color: 'green'
    })
  } catch (err: any) {
    const message = err?.data?.statusMessage || err?.message || 'Could not send report. Please try again later.'
    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
  } finally {
    reporting.value = false
  }
}

onMounted(async () => {
  if (campaignData.value) {
    await initializeCanvas()
  }
})

useSeoMeta({
  title: computed(() => campaignData.value ? `${campaignData.value.name} • Phrames` : 'Phrames Campaign'),
  description: computed(() => campaignData.value?.description || 'Create a personalized photo with this frame on Phrames.'),
  ogTitle: computed(() => campaignData.value?.name),
  ogDescription: computed(() => campaignData.value?.description || 'Create a personalized photo with this frame on Phrames.'),
  ogImage: computed(() => campaignData.value?.frameAsset.url)
})
</script>
