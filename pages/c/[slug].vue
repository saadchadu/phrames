<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
    </div>
    
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
        <p class="text-gray-600 mb-4">The campaign you're looking for doesn't exist or has been removed.</p>
        <UButton to="/">Go Home</UButton>
      </div>
    </div>
    
    <div v-else class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ campaign.name }}
        </h1>
        <p v-if="campaign.description" class="text-lg text-gray-600 mb-4">
          {{ campaign.description }}
        </p>
        <p class="text-sm text-gray-500">
          Upload your photo and create a personalized image with this frame
        </p>
      </div>
      
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Upload & Controls -->
        <div class="space-y-6">
          <UCard class="p-6">
            <h3 class="text-lg font-semibold mb-4">Upload Your Photo</h3>
            
            <div 
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
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
              
              <div v-if="!userImageFile">
                <Icon name="i-heroicons-cloud-arrow-up" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-lg font-medium text-gray-900 mb-2">
                  Choose Your Photo
                </p>
                <p class="text-gray-600 mb-4">
                  Drag and drop or click to browse
                </p>
                <UButton @click="$refs.fileInput.click()" variant="outline">
                  Select Photo
                </UButton>
              </div>
              
              <div v-else class="space-y-4">
                <p class="text-green-600 font-medium">
                  ✓ Photo uploaded: {{ userImageFile.name }}
                </p>
                <UButton @click="$refs.fileInput.click()" variant="outline" size="sm">
                  Change Photo
                </UButton>
              </div>
            </div>
          </UCard>
          
          <!-- Controls -->
          <UCard v-if="userImageFile" class="p-6">
            <h3 class="text-lg font-semibold mb-4">Adjust Your Photo</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Zoom: {{ Math.round(composer.state.scale * 100) }}%
                </label>
                <URange 
                  v-model="zoomValue"
                  :min="10"
                  :max="300"
                  :step="5"
                  @input="handleZoomChange"
                />
              </div>
              
              <div class="flex space-x-2">
                <UButton @click="resetImage" variant="outline" size="sm" class="flex-1">
                  Reset
                </UButton>
                <UButton @click="downloadPng" size="sm" class="flex-1">
                  Download PNG
                </UButton>
                <UButton @click="downloadJpeg" variant="outline" size="sm" class="flex-1">
                  Download JPEG
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
        
        <!-- Preview -->
        <div>
          <UCard class="p-6">
            <h3 class="text-lg font-semibold mb-4">Preview</h3>
            
            <div class="relative">
              <canvas
                ref="canvasRef"
                class="w-full border rounded-lg shadow-sm cursor-move"
                :class="{ 'cursor-grabbing': isDragging }"
                @mousedown="startDrag"
                @mousemove="drag"
                @mouseup="endDrag"
                @mouseleave="endDrag"
                @touchstart="startDrag"
                @touchmove="drag"
                @touchend="endDrag"
              />
              
              <div v-if="!userImageFile" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <p class="text-white text-lg font-medium">
                  Upload a photo to see preview
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getPublicCampaign, recordMetric } = useApi()
const composer = useCanvasComposer()

const slug = String(route.params.slug);

// Fetch campaign data
const { data: campaign, pending, error } = await useLazyAsyncData(
  `campaign-${slug}`,
  () => getPublicCampaign(slug)
)

// Record visit metric
if (campaign.value && !error.value) {
  recordMetric(slug, 'visit').catch(() => {})
}

// Reactive state
const isDragging = ref(false)
const userImageFile = ref(null)
const canvasRef = ref()
const zoomValue = ref(100)

// Drag state
const dragState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  startOffsetX: 0,
  startOffsetY: 0
})

// Initialize canvas when component mounts
onMounted(async () => {
  if (canvasRef.value && campaign.value) {
    const aspectParts = campaign.value.aspectRatio.split(':')
    const aspectRatio = parseInt(aspectParts[0]) / parseInt(aspectParts[1])
    
    let canvasWidth = 600
    let canvasHeight = canvasWidth / aspectRatio
    
    // Adjust for mobile
    if (window.innerWidth < 768) {
      canvasWidth = Math.min(400, window.innerWidth - 64)
      canvasHeight = canvasWidth / aspectRatio
    }
    
    composer.initCanvas(canvasRef.value, canvasWidth, canvasHeight)
    await composer.loadFrameImage(campaign.value.frameAsset.url)
    composer.render()
  }
})

const handleFileSelect = async (event) => {
  const target = event.target
  const file = target.files?.[0]
  if (file) {
    await processFile(file)
  }
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const file = event.dataTransfer?.files[0]
  if (file) {
    await processFile(file)
  }
}

const processFile = async (file) => {
  try {
    userImageFile.value = file
    await composer.loadUserImage(file)
    zoomValue.value = Math.round(composer.state.scale * 100)
    
    // Record render metric
    if (campaign.value) {
      recordMetric(slug, 'render').catch(() => {})
    }
  } catch (error) {
    console.error('Error processing file:', error)
  }
}

const handleZoomChange = (value) => {
  composer.setScale(value / 100)
}

const resetImage = () => {
  composer.resetTransform()
  zoomValue.value = Math.round(composer.state.scale * 100)
}

const downloadPng = () => {
  if (campaign.value) {
    composer.downloadImage(`${campaign.value.name}-frame.png`, 'png')
    recordMetric(slug, 'download').catch(() => {})
  }
}

const downloadJpeg = () => {
  if (campaign.value) {
    composer.downloadImage(`${campaign.value.name}-frame.jpg`, 'jpeg')
    recordMetric(slug, 'download').catch(() => {})
  }
}

// Drag functionality
const getEventPos = (event) => {
  if ('touches' in event) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

const startDrag = (event) => {
  if (!userImageFile.value) return
  
  event.preventDefault()
  const pos = getEventPos(event)
  
  dragState.isDragging = true
  dragState.startX = pos.x
  dragState.startY = pos.y
  dragState.startOffsetX = composer.state.offsetX
  dragState.startOffsetY = composer.state.offsetY
}

const drag = (event) => {
  if (!dragState.isDragging || !userImageFile.value) return
  
  event.preventDefault()
  const pos = getEventPos(event)
  
  const deltaX = pos.x - dragState.startX
  const deltaY = pos.y - dragState.startY
  
  composer.setOffset(
    dragState.startOffsetX + deltaX,
    dragState.startOffsetY + deltaY
  )
}

const endDrag = () => {
  dragState.isDragging = false
}

// SEO
useSeoMeta({
  title: computed(() => campaign.value ? `${campaign.value.name} - Phrames` : 'Campaign - Phrames'),
  description: computed(() => campaign.value?.description || 'Create a personalized image with this photo frame'),
  ogTitle: computed(() => campaign.value?.name),
  ogDescription: computed(() => campaign.value?.description || 'Create a personalized image with this photo frame'),
  ogImage: computed(() => campaign.value?.frameAsset.url)
})
</script>