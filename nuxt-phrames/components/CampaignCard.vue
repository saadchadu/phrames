<template>
  <div class="card hover:shadow-md transition-shadow duration-200">
    <div class="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
      <img 
        :src="image" 
        :alt="title"
        class="w-full h-full object-cover"
      />
    </div>
    <div class="p-6">
      <h3 class="text-lg font-semibold text-dark-900 mb-2">
        {{ title }}
      </h3>
      <p class="text-gray-600 text-sm mb-4">
        {{ description }}
      </p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">
          {{ stats }}
        </span>
        <NuxtLink 
          :to="`/c/${slug}`" 
          class="text-primary-500 hover:text-primary-600 font-medium text-sm"
        >
          Try Frame →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
interface Props {
  title: string
  description: string
  image: string
  slug: string
  stats: string
}

defineProps<Props>()
</script>