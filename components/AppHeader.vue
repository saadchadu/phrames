<template>
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xl font-semibold text-gray-900">Phrames</span>
          </NuxtLink>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <template v-if="user">
            <div class="hidden md:flex items-center space-x-3">
              <span class="text-sm text-gray-700">{{ user.email }}</span>
              <UiButton 
                variant="ghost" 
                size="sm" 
                @click="handleLogout"
                :loading="loading"
              >
                Sign out
              </UiButton>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center space-x-3">
              <NuxtLink to="/login">
                <UiButton variant="ghost" size="sm">
                  Sign in
                </UiButton>
              </NuxtLink>
              <NuxtLink to="/signup">
                <UiButton variant="primary" size="sm">
                  Sign up
                </UiButton>
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const { user, logout, loading } = useAuth()

const handleLogout = async () => {
  try {
    await logout()
    await navigateTo('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>