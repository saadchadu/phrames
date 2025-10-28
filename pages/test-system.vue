<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">🔧 System Test - Find ALL Issues</h1>
      
      <button 
        @click="runTest" 
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-6"
        :disabled="testing"
      >
        {{ testing ? 'Testing...' : 'Run Complete System Test' }}
      </button>

      <div v-if="results" class="space-y-6">
        <!-- Summary -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-2xl font-semibold mb-4">
            {{ results.summary.allPassed ? '✅ All Tests Passed!' : '❌ Issues Found' }}
          </h2>
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ results.summary.passed }}</div>
              <div class="text-sm text-gray-600">Passed</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-red-600">{{ results.summary.failed }}</div>
              <div class="text-sm text-gray-600">Failed</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600">{{ results.summary.errors }}</div>
              <div class="text-sm text-gray-600">Errors</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-400">{{ results.summary.skipped }}</div>
              <div class="text-sm text-gray-600">Skipped</div>
            </div>
          </div>
        </div>

        <!-- Test Results -->
        <div v-for="(test, name) in results.tests" :key="name" class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold capitalize">{{ name }}</h3>
            <span 
              class="px-3 py-1 rounded-full text-sm font-semibold"
              :class="{
                'bg-green-100 text-green-800': test.status === 'pass',
                'bg-red-100 text-red-800': test.status === 'fail',
                'bg-orange-100 text-orange-800': test.status === 'error',
                'bg-gray-100 text-gray-800': test.status === 'skip'
              }"
            >
              {{ test.status.toUpperCase() }}
            </span>
          </div>
          
          <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto">{{ JSON.stringify(test, null, 2) }}</pre>
          
          <!-- Fixes -->
          <div v-if="test.status === 'fail' || test.status === 'error'" class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <p class="font-semibold text-yellow-800 mb-2">🔧 How to Fix:</p>
            <div class="text-sm text-yellow-700">
              <div v-if="name === 'environment' && test.missing">
                <p class="mb-2">Missing environment variables:</p>
                <ul class="list-disc list-inside">
                  <li v-for="missing in test.missing" :key="missing">{{ missing }}</li>
                </ul>
                <p class="mt-2">Add these to your .env file and restart the server.</p>
              </div>
              
              <div v-else-if="name === 'firebaseAdmin'">
                <p>Firebase Admin failed to initialize.</p>
                <p>Check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env</p>
              </div>
              
              <div v-else-if="name === 'firestore'">
                <p>Firestore connection failed.</p>
                <p>Error: {{ test.error }}</p>
                <p class="mt-2">Check Firebase credentials and make sure Firestore is enabled in Firebase Console.</p>
              </div>
              
              <div v-else-if="name === 'storage'">
                <p>Storage directories missing.</p>
                <p>Run: mkdir -p public/uploads/frames public/uploads/thumbs</p>
              </div>
              
              <div v-else-if="name === 'auth'">
                <p>Authentication failed.</p>
                <p>Make sure you're logged in and the token is valid.</p>
              </div>
              
              <div v-else-if="name === 'campaigns'">
                <p>Campaign query failed.</p>
                <p>Error: {{ test.error }}</p>
                <p class="mt-2">This might be a Firestore index issue. Check the error message for a link to create the index.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Items -->
        <div v-if="!results.summary.allPassed" class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <h3 class="text-xl font-semibold text-red-800 mb-4">🚨 Action Items</h3>
          <ol class="list-decimal list-inside space-y-2 text-red-700">
            <li v-if="results.tests.environment?.status !== 'pass'">
              Fix environment variables in .env file
            </li>
            <li v-if="results.tests.firebaseAdmin?.status !== 'pass'">
              Fix Firebase Admin initialization
            </li>
            <li v-if="results.tests.firestore?.status !== 'pass'">
              Fix Firestore connection
            </li>
            <li v-if="results.tests.storage?.status !== 'pass'">
              Create storage directories
            </li>
            <li v-if="results.tests.auth?.status === 'error'">
              Fix authentication (log in again)
            </li>
            <li v-if="results.tests.campaigns?.status === 'error'">
              Fix campaign query (check Firestore indexes)
            </li>
          </ol>
          <p class="mt-4 text-red-800 font-semibold">
            Fix these issues in order, then run the test again.
          </p>
        </div>

        <!-- Success -->
        <div v-else class="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
          <h3 class="text-xl font-semibold text-green-800 mb-2">🎉 Everything Works!</h3>
          <p class="text-green-700">
            All systems are operational. You can now create campaigns!
          </p>
          <a href="/dashboard/campaigns/new" class="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Create Your First Campaign →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const results = ref(null)
const testing = ref(false)

const runTest = async () => {
  testing.value = true
  results.value = null
  
  try {
    // Get auth token if available
    const { $firebaseAuth } = useNuxtApp()
    const headers = {}
    
    if ($firebaseAuth?.currentUser) {
      const token = await $firebaseAuth.currentUser.getIdToken()
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await $fetch('/api/test-system', { headers })
    results.value = response
  } catch (error) {
    results.value = {
      summary: { allPassed: false, passed: 0, failed: 0, errors: 1, skipped: 0 },
      tests: {
        system: {
          status: 'error',
          error: error.message
        }
      }
    }
  } finally {
    testing.value = false
  }
}

// Run test on mount
onMounted(() => {
  runTest()
})
</script>
