<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Auth Debug Page</h1>
      
      <div class="space-y-6">
        <!-- Firebase Auth Status -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Firebase Auth Status</h2>
          <div class="space-y-2">
            <p><strong>Firebase Auth Available:</strong> {{ firebaseAuthAvailable ? '✅ Yes' : '❌ No' }}</p>
            <p><strong>Current User:</strong> {{ firebaseUser ? '✅ Logged in' : '❌ Not logged in' }}</p>
            <p v-if="firebaseUser"><strong>Email:</strong> {{ firebaseUser.email }}</p>
            <p v-if="firebaseUser"><strong>UID:</strong> {{ firebaseUser.uid }}</p>
            <p v-if="firebaseUser"><strong>Email Verified:</strong> {{ firebaseUser.emailVerified ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <!-- Nuxt Auth State -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Nuxt Auth State</h2>
          <div class="space-y-2">
            <p><strong>User State:</strong> {{ user ? '✅ Logged in' : '❌ Not logged in' }}</p>
            <p v-if="user"><strong>User ID:</strong> {{ user.id }}</p>
            <p v-if="user"><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Initialized:</strong> {{ initialized ? 'Yes' : 'No' }}</p>
            <p><strong>Loading:</strong> {{ loading ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <!-- Token Test -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Token Test</h2>
          <button 
            @click="testToken" 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Test Get Token
          </button>
          <div v-if="tokenResult" class="mt-4">
            <p><strong>Token:</strong></p>
            <pre class="bg-gray-100 p-4 rounded overflow-x-auto text-xs">{{ tokenResult }}</pre>
          </div>
        </div>

        <!-- API Test -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">API Test</h2>
          <button 
            @click="testAPI" 
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
            :disabled="apiTesting"
          >
            {{ apiTesting ? 'Testing...' : 'Test Campaigns API' }}
          </button>
          <div v-if="apiResult" class="mt-4">
            <p><strong>Result:</strong></p>
            <pre class="bg-gray-100 p-4 rounded overflow-x-auto text-xs">{{ JSON.stringify(apiResult, null, 2) }}</pre>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Actions</h2>
          <div class="space-x-4">
            <button 
              @click="goToSignup" 
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Go to Sign Up
            </button>
            <button 
              @click="goToLogin" 
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Go to Login
            </button>
            <button 
              v-if="user"
              @click="handleLogout" 
              class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Environment -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Environment</h2>
          <div class="space-y-2">
            <p><strong>Firebase Project ID:</strong> {{ firebaseProjectId || 'Not configured' }}</p>
            <p><strong>Firebase Auth Domain:</strong> {{ firebaseAuthDomain || 'Not configured' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, loading, initialized, logout } = useAuth()
const { $firebaseAuth } = useNuxtApp()
const config = useRuntimeConfig()

const firebaseAuthAvailable = computed(() => !!$firebaseAuth)
const firebaseUser = computed(() => $firebaseAuth?.currentUser)
const firebaseProjectId = computed(() => config.public.firebaseProjectId)
const firebaseAuthDomain = computed(() => config.public.firebaseAuthDomain)

const tokenResult = ref(null)
const apiResult = ref(null)
const apiTesting = ref(false)

const testToken = async () => {
  try {
    if (!$firebaseAuth?.currentUser) {
      tokenResult.value = 'No user logged in'
      return
    }
    const token = await $firebaseAuth.currentUser.getIdToken()
    tokenResult.value = token.substring(0, 100) + '...'
  } catch (error) {
    tokenResult.value = `Error: ${error.message}`
  }
}

const testAPI = async () => {
  apiTesting.value = true
  apiResult.value = null
  try {
    const { getCampaigns } = useApi()
    const result = await getCampaigns({ page: 1, limit: 12 })
    apiResult.value = result
  } catch (error) {
    apiResult.value = {
      error: true,
      message: error.message,
      statusCode: error.statusCode
    }
  } finally {
    apiTesting.value = false
  }
}

const goToSignup = () => {
  navigateTo('/signup')
}

const goToLogin = () => {
  navigateTo('/login')
}

const handleLogout = async () => {
  await logout()
  window.location.reload()
}
</script>
