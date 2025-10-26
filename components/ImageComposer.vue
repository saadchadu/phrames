<template>
  <div class="space-y-4">
    <!-- Canvas -->
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
      
      <div v-if="!hasUserImage" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
        <p class="text-white text-lg font-medium">
          Upload a photo to see preview
        </p>
      </div>
    </div>
    
    <!-- Controls -->
    <div v-if="hasUserImage" class="space-y-4">
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
          Reset Position
        </UButton>
        <UButton @click="$emit('download', 'png')" size="sm" class="flex-1">
          Download PNG
        </UButton>
        <UButton @click="$emit('download', 'jpeg')" variant="outline" size="sm" class="flex-1">
          Download JPEG
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  frameUrl: string
  userImageFile?: File | null
  canvasWidth?: number
  canvasHeight?: number
}

interface Emits {
  (e: 'download', format: 'png' | 'jpeg'): void
  (e: 'render'): void
}

const props = withDefaults(defineProps<Props>(), {
  userImageFile: null,
  canvasWidth: 600,
  canvasHeight: 600
})

const emit = defineEmits<Emits>()

const composer = useCanvasComposer()
const canvasRef = ref()
const zoomValue = ref(100)
const isDragging = ref(false)

// Drag state
const dragState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  startOffsetX: 0,
  startOffsetY: 0
})

const hasUserImage = computed(() => !!props.userImageFile)

// Initialize canvas
onMounted(async () => {
  if (canvasRef.value) {
    composer.initCanvas(canvasRef.value, props.canvasWidth, props.canvasHeight)
    await composer.loadFrameImage(props.frameUrl)
    composer.render()
  }
})

// Watch for user image changes
watch(() => props.userImageFile, async (newFile) => {
  if (newFile) {
    try {
      await composer.loadUserImage(newFile)
      zoomValue.value = Math.round(composer.state.scale * 100)
      emit('render')
    } catch (error) {
      console.error('Error loading user image:', error)
    }
  }
})

const handleZoomChange = (value) => {
  composer.setScale(value / 100)
}

const resetImage = () => {
  composer.resetTransform()
  zoomValue.value = Math.round(composer.state.scale * 100)
}

// Drag functionality
const getEventPos = (event) => {
  if ('touches' in event) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

const startDrag = (event) => {
  if (!hasUserImage.value) return
  
  event.preventDefault()
  const pos = getEventPos(event)
  
  dragState.isDragging = true
  isDragging.value = true
  dragState.startX = pos.x
  dragState.startY = pos.y
  dragState.startOffsetX = composer.state.offsetX
  dragState.startOffsetY = composer.state.offsetY
}

const drag = (event) => {
  if (!dragState.isDragging || !hasUserImage.value) return
  
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
  isDragging.value = false
}

// Expose composer methods
defineExpose({
  exportImage: composer.exportImage,
  downloadImage: composer.downloadImage
})
</script>