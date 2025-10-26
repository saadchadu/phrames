<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-6xl font-bold text-gray-900 mb-4">
          {{ error.statusCode || '500' }}
        </h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">
          {{ getErrorTitle() }}
        </h2>
        <p class="text-gray-600">
          {{ getErrorMessage() }}
        </p>
      </div>
      
      <div class="space-y-4">
        <UButton @click="handleError" size="lg" class="w-full">
          {{ error.statusCode === 404 ? 'Go Home' : 'Try Again' }}
        </UButton>
        
        <UButton 
          to="/" 
          variant="outline" 
          size="lg" 
          class="w-full"
        >
          Back to Home
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NuxtError {
  statusCode?: number
  statusMessage?: string
  message?: string
}

const props = defineProps<{
  error: NuxtError
}>()

const getErrorTitle = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'Page Not Found'
    case 500:
      return 'Server Error'
    default:
      return 'Something went wrong'
  }
}

const getErrorMessage = () => {
  switch (props.error.statusCode) {
    case 404:
      return "The page you're looking for doesn't exist."
    case 500:
      return 'We encountered an internal server error. Please try again later.'
    default:
      return props.error.statusMessage || props.error.message || 'An unexpected error occurred.'
  }
}

const handleError = async () => {
  if (props.error.statusCode === 404) {
    await navigateTo('/')
  } else {
    await clearError({ redirect: '/' })
  }
}

useSeoMeta({
  title: `${props.error.statusCode || 'Error'} - Phrames`,
  description: getErrorMessage()
})
</script>