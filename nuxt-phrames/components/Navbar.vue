<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center">
          <div class="w-6 h-6 bg-primary-500 rounded mr-2"></div>
          <span class="text-xl font-bold text-dark-900">phrames</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink to="#about" class="text-dark-900 font-medium hover:text-primary-500">
            About
          </NuxtLink>
          <NuxtLink to="#features" class="text-dark-900 font-medium hover:text-primary-500">
            Features
          </NuxtLink>
          <NuxtLink to="#pricing" class="text-dark-900 font-medium hover:text-primary-500">
            Pricing
          </NuxtLink>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center space-x-3">
          <NuxtLink to="/signup" class="btn-secondary">
            Sign Up
          </NuxtLink>
          <NuxtLink to="/login" class="btn-primary">
            Log In
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>