<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center max-w-4xl mx-auto">
        <h1 class="text-5xl font-bold text-gray-900 mb-6">
          Create Beautiful Photo Frames
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Design custom photo frames and let your audience create personalized images. 
          Free, no watermarks, no limits.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <UButton 
            to="/signup" 
            size="lg" 
            class="px-8 py-3"
          >
            Get Started Free
          </UButton>
          <UButton 
            to="/login" 
            variant="outline" 
            size="lg" 
            class="px-8 py-3"
          >
            Sign In
          </UButton>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mt-16">
          <UCard class="p-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="i-heroicons-photo" class="w-6 h-6 text-blue-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Upload Your Frame</h3>
              <p class="text-gray-600">
                Create PNG frames with transparency. Perfect for events, branding, or fun campaigns.
              </p>
            </div>
          </UCard>
          
          <UCard class="p-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="i-heroicons-share" class="w-6 h-6 text-green-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Share Your Link</h3>
              <p class="text-gray-600">
                Get a shareable link that anyone can use to add their photos to your frame.
              </p>
            </div>
          </UCard>
          
          <UCard class="p-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="i-heroicons-arrow-down-tray" class="w-6 h-6 text-purple-600" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Download Results</h3>
              <p class="text-gray-600">
                Users can preview, adjust, and download their personalized images instantly.
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Phrames - Create Beautiful Photo Frames',
  ogTitle: 'Phrames - Create Beautiful Photo Frames',
  description: 'Design custom photo frames and let your audience create personalized images. Free, no watermarks, no limits.',
  ogDescription: 'Design custom photo frames and let your audience create personalized images. Free, no watermarks, no limits.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})
</script>