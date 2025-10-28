<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">🔍 Production Environment Debug</h1>
      
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-semibold mb-4">Firebase Client Configuration</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-medium">API Key:</span>
            <span :class="config.public.firebaseApiKey ? 'text-green-600' : 'text-red-600'">
              {{ config.public.firebaseApiKey ? '✅ Set' : '❌ Missing' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Auth Domain:</span>
            <span :class="config.public.firebaseAuthDomain ? 'text-green-600' : 'text-red-600'">
              {{ config.public.firebaseAuthDomain ? '✅ Set' : '❌ Missing' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Project ID:</span>
            <span :class="config.public.firebaseProjectId ? 'text-green-600' : 'text-red-600'">
              {{ config.public.firebaseProjectId ? '✅ Set' : '❌ Missing' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Storage Bucket:</span>
            <span :class="config.public.firebaseStorageBucket ? 'text-green-600' : 'text-red-600'">
              {{ config.public.firebaseStorageBucket ? '✅ Set' : '❌ Missing' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Messaging Sender ID:</span>
            <span :class="config.public.firebaseMessagingSenderId ? 'text-green-600' : 'text-red-600'">
              {{ config.public.firebaseMessagingSenderId ? '✅ Set' : '❌ Missing' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">App ID:</span>
            <span :class="config.public.firebaseAppId ? 'text-green-600' : 'text-red-600'">
              {{ config.public.firebaseAppId ? '✅ Set' : '❌ Missing' }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-semibold mb-4">Firebase Initialization Status</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-medium">Firebase App:</span>
            <span :class="firebaseAvailable ? 'text-green-600' : 'text-red-600'">
              {{ firebaseAvailable ? '✅ Initialized' : '❌ Not Initialized' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Firebase Auth:</span>
            <span :class="authAvailable ? 'text-green-600' : 'text-red-600'">
              {{ authAvailable ? '✅ Available' : '❌ Not Available' }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <h2 class="text-xl font-semibold mb-4">Environment Values (Safe to Show)</h2>
        <div class="space-y-2 text-sm">
          <p><strong>Project ID:</strong> {{ config.public.firebaseProjectId || 'Not set' }}</p>
          <p><strong>Auth Domain:</strong> {{ config.public.firebaseAuthDomain || 'Not set' }}</p>
          <p><strong>Storage Bucket:</strong> {{ config.public.firebaseStorageBucket || 'Not set' }}</p>
          <p><strong>Site URL:</strong> {{ config.public.siteUrl || 'Not set' }}</p>
        </div>
      </div>

      <div v-if="!allConfigured" class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
        <h3 class="text-lg font-semibold text-red-800 mb-2">❌ Configuration Issues Found</h3>
        <p class="text-red-700 mb-4">
          Some Firebase environment variables are missing. Add these to your hosting platform:
        </p>
        <div class="bg-red-100 p-4 rounded text-sm font-mono">
          <div v-if="!config.public.firebaseApiKey">NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key</div>
          <div v-if="!config.public.firebaseAuthDomain">NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com</div>
          <div v-if="!config.public.firebaseProjectId">NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id</div>
          <div v-if="!config.public.firebaseStorageBucket">NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app</div>
          <div v-if="!config.public.firebaseMessagingSenderId">NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789</div>
          <div v-if="!config.public.firebaseAppId">NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef</div>
        </div>
      </div>

      <div v-else class="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
        <h3 class="text-lg font-semibold text-green-800 mb-2">✅ Configuration Looks Good!</h3>
        <p class="text-green-700">
          All Firebase environment variables are configured. If you're still having issues, check:
        </p>
        <ul class="list-disc list-inside text-green-700 mt-2 space-y-1">
          <li>Firebase Console → Authentication → Authorized domains</li>
          <li>Make sure your domain is added to Firebase</li>
          <li>Check browser console for specific errors</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-lg shadow mt-6">
        <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <a href="/" class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            ← Back to Home
          </a>
          <a href="/login" class="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-3">
            Test Login
          </a>
          <a href="/signup" class="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-3">
            Test Signup
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const { $firebase, $firebaseAuth } = useNuxtApp()

const firebaseAvailable = computed(() => !!$firebase)
const authAvailable = computed(() => !!$firebaseAuth)

const allConfigured = computed(() => {
  return !!(
    config.public.firebaseApiKey &&
    config.public.firebaseAuthDomain &&
    config.public.firebaseProjectId &&
    config.public.firebaseStorageBucket &&
    config.public.firebaseMessagingSenderId &&
    config.public.firebaseAppId
  )
})

useSeoMeta({
  title: 'Environment Debug - Phrames',
  description: 'Debug production environment configuration'
})
</script>
</template>