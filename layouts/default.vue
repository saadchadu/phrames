<template>
  <div class="min-h-screen bg-gray-25">
    <AppHeader />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
// Auto-import Inter font
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    }
  ]
})
</script>