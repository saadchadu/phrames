<template>
  <NuxtLayout>
    <div class="min-h-screen flex flex-col bg-gray-50">
      <div class="flex-1">
        <NuxtPage />
      </div>
      <footer class="bg-gray-900 text-gray-200 py-6">
        <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <p class="text-sm">© {{ currentYear }} Phrames. Free forever.</p>
          <div class="flex items-center space-x-4 text-sm">
            <NuxtLink class="hover:text-white transition-colors" to="/terms">
              Terms of Use
            </NuxtLink>
            <NuxtLink class="hover:text-white transition-colors" to="/privacy">
              Privacy Policy
            </NuxtLink>
          </div>
        </div>
      </footer>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
