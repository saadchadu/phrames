<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center mb-4">
            <div class="w-6 h-6 bg-primary-500 rounded mr-2"></div>
            <span class="text-xl font-bold text-dark-900">phrames</span>
          </div>
          <p class="text-gray-600 mb-4 max-w-md">
            Create beautiful photo frames and share them with the world. 
            Free, easy-to-use, and no watermarks.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-semibold text-dark-900 mb-4">Product</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/features" class="text-gray-600 hover:text-primary-500">Features</NuxtLink></li>
            <li><NuxtLink to="/pricing" class="text-gray-600 hover:text-primary-500">Pricing</NuxtLink></li>
            <li><NuxtLink to="/examples" class="text-gray-600 hover:text-primary-500">Examples</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-dark-900 mb-4">Support</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/help" class="text-gray-600 hover:text-primary-500">Help Center</NuxtLink></li>
            <li><NuxtLink to="/contact" class="text-gray-600 hover:text-primary-500">Contact</NuxtLink></li>
            <li><NuxtLink to="/privacy" class="text-gray-600 hover:text-primary-500">Privacy</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-500 text-sm">
          © 2024 Phrames. All rights reserved.
        </p>
        <p class="text-gray-500 text-sm mt-4 md:mt-0">
          Made with ❤️ by Cleffon
        </p>
      </div>
    </div>
  </footer>
</template>