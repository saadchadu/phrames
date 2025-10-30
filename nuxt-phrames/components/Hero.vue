<template>
  <section class="relative bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Content -->
        <div class="max-w-2xl">
          <h1 class="text-display-xl lg:text-display-2xl text-dark-900 mb-6">
            Create Beautiful Photo Frames And Share to the Globe
          </h1>
          <p class="text-lg text-gray-600 mb-8 leading-relaxed">
            Phrames is a free, easy-to-use platform for creating custom photo frame campaigns. 
            Upload your PNG frames and let visitors create personalized images instantly.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/dashboard/campaigns/new" class="btn-primary text-lg px-6 py-3">
              Create a Campaign
            </NuxtLink>
            <NuxtLink to="/c/demo" class="btn-secondary text-lg px-6 py-3">
              Try a Demo Frame
            </NuxtLink>
          </div>
          
          <!-- Microcopy -->
          <p class="text-sm text-gray-500 mt-6">
            No design skills needed — just creativity.
          </p>
        </div>

        <!-- Hero Image -->
        <div class="relative">
          <div class="relative w-80 h-96 mx-auto">
            <!-- Green background shape -->
            <div class="absolute inset-0 bg-primary-500 rounded-bl-[80px] transform rotate-3"></div>
            
            <!-- Photo placeholder -->
            <div 
              class="absolute top-8 left-4 w-72 h-80 rounded-2xl bg-cover bg-center shadow-xl"
              style="background-image: url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=450&fit=crop&crop=face')"
            ></div>
            
            <!-- Dark accent -->
            <div class="absolute top-0 right-0 w-24 h-24 bg-dark-900 rounded-bl-[40px]"></div>
            
            <!-- Hashtag -->
            <div class="absolute bottom-8 left-8 text-white text-3xl font-bold">
              #phrames
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>