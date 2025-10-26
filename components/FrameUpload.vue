<template>
  <UFormGroup label="Frame Image" name="frame" required>
    <div class="space-y-4">
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
          accept="image/png"
          class="hidden"
          @change="handleFileSelect"
          :disabled="loading"
        />
        
        <div v-if="!preview">
          <Icon name="i-heroicons-cloud-arrow-up" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-lg font-medium text-gray-900 mb-2">
            Upload PNG Frame
          </p>
          <p class="text-gray-600 mb-4">
            Drag and drop your PNG file here, or click to browse
          </p>
          <UButton 
            @click="$refs.fileInput.click()" 
            variant="outline"
            :disabled="loading"
          >
            Choose File
          </UButton>
        </div>
        
        <div v-else class="space-y-4">
          <div class="relative inline-block">
            <img 
              :src="preview" 
              alt="Frame preview"
              class="max-w-full max-h-48 rounded-lg shadow-sm"
            />
            <UButton 
              @click="clearFile"
              icon="i-heroicons-x-mark"
              variant="solid"
              color="red"
              size="xs"
              class="absolute -top-2 -right-2"
              :disabled="loading"
            />
          </div>
          
          <div class="text-sm text-gray-600">
            <p><strong>{{ fileName }}</strong></p>
            <p>{{ formatFileSize(fileSize) }}</p>
          </div>
          
          <UButton 
            @click="$refs.fileInput.click()" 
            variant="outline" 
            size="sm"
            :disabled="loading"
          >
            Change File
          </UButton>
        </div>
      </div>
      
      <div class="text-sm text-gray-600 space-y-1">
        <p>• PNG format with transparency required</p>
        <p>• Recommended size: 1080×1080px or larger</p>
        <p>• Maximum file size: 10MB</p>
      </div>
      
      <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
        {{ error }}
      </div>
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'file-selected', file: File, preview: string, info: { width: number, height: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const isDragging = ref(false)
const preview = ref<string | null>(null)
const fileName = ref('')
const fileSize = ref(0)
const error = ref('')

interface FrameInfo {
  width: number
  height: number
}

const validatePngFile = async (file: File): Promise<FrameInfo> => {
  return new Promise<FrameInfo>((resolve, reject) => {
    if (file.type !== 'image/png') {
      reject(new Error('File must be a PNG image'))
      return
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      reject(new Error('File size must be less than 10MB'))
      return
    }
    
    const img = new Image()
    img.onload = () => {
      // Check if image has transparency by drawing to canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Check for any transparent pixels
      let hasTransparency = false
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 255) {
          hasTransparency = true
          break
        }
      }
      
      if (!hasTransparency) {
        reject(new Error('PNG must have transparency (alpha channel)'))
        return
      }
      
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      reject(new Error('Invalid image file'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

const processFile = async (file: File) => {
  error.value = ''
  
  try {
    const info = await validatePngFile(file)
    
    const previewUrl = URL.createObjectURL(file)
    preview.value = previewUrl
    fileName.value = file.name
    fileSize.value = file.size
    
    emit('file-selected', file, previewUrl, info)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to process the selected file'
    clearFile()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const clearFile = () => {
  if (preview.value) {
    URL.revokeObjectURL(preview.value)
  }
  preview.value = null
  fileName.value = ''
  fileSize.value = 0
  error.value = ''
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onUnmounted(() => {
  clearFile()
})
</script>
