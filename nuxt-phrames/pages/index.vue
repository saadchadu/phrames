<template>
  <div>
    <Navbar />
    <Hero />
    <HowItWorks />
    <FeaturedCampaigns />
    <Footer />
  </div>
</template>

<script setup>
// SEO
useHead({
  title: 'Phrames - Create Beautiful Photo Frames And Share to the Globe',
  meta: [
    {
      name: 'description',
      content: 'Phrames is a free, easy-to-use platform for creating custom photo frame campaigns. Upload your PNG frames and let visitors create personalized images instantly.'
    }
  ]
})
</script>