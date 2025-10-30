<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <NuxtLink to="/" class="flex justify-center">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-primary-500 rounded mr-2"></div>
          <span class="text-2xl font-bold text-dark-900">phrames</span>
        </div>
      </NuxtLink>
      <h2 class="mt-6 text-center text-3xl font-bold text-dark-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Start creating beautiful frame campaigns
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card px-4 py-8 sm:px-10">
        <form @submit.prevent="handleSignup" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="input"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="input"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary"
            >
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="text-center">
            <span class="text-sm text-gray-600">
              Already have an account?
            </span>
            <NuxtLink to="/login" class="font-medium text-primary-500 hover:text-primary-600">
              Sign in
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

async function handleSignup() {
  loading.value = true
  
  try {
    const { data } = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: form
    })
    
    // Redirect to dashboard
    await navigateTo('/dashboard')
  } catch (error) {
    console.error('Signup failed:', error)
    // Handle error (show toast, etc.)
  } finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: 'Sign Up - Phrames'
})
</script>