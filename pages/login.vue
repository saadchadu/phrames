<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-25 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
          <svg class="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Sign in to Phrames
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Welcome back! Please sign in to your account.
        </p>
      </div>
      
      <UiCard class="p-8">
        <div v-if="formErrors.length > 0" class="mb-6 space-y-2">
          <div
            v-for="error in formErrors"
            :key="error"
            class="p-4 rounded-lg bg-error-50 border border-error-200"
          >
            <p class="text-sm text-error-700">{{ error }}</p>
          </div>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <UiInput
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="Enter your email"
            :disabled="loading"
            required
          />
          
          <UiInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :disabled="loading"
            required
          />
          
          <UiButton 
            type="submit" 
            class="w-full"
            size="lg"
            :loading="loading"
            :disabled="loading"
          >
            Sign in
          </UiButton>
        </form>
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <UiButton 
            @click="handleGoogleLogin"
            variant="secondary" 
            class="w-full mt-4"
            size="lg"
            :loading="loading"
            :disabled="loading"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </UiButton>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/signup" class="font-medium text-primary-600 hover:text-primary-500">
              Sign up here
            </NuxtLink>
          </p>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, loginWithGoogle, loading, initAuth } = useAuth()
const toast = useToast()
const route = useRoute()

// Initialize auth
onMounted(() => {
  initAuth()
})

const form = reactive({
  email: '',
  password: ''
})

const formErrors = ref<string[]>([])

const handleLogin = async () => {
  formErrors.value = []
  try {
    await login(form.email, form.password)
    
    const redirectParam = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const redirectTarget = redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard'
    
    toast.add({
      title: 'Success',
      description: 'Welcome back!',
      color: 'success'
    })
    
    await navigateTo(redirectTarget)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in. Please try again.'
    formErrors.value = [message]
    toast.add({
      title: 'Error',
      description: message,
      color: 'error'
    })
  }
}

const handleGoogleLogin = async () => {
  formErrors.value = []
  try {
    await loginWithGoogle()
    
    const redirectParam = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const redirectTarget = redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard'
    
    toast.add({
      title: 'Success',
      description: 'Welcome back!',
      color: 'success'
    })
    
    await navigateTo(redirectTarget)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in with Google. Please try again.'
    formErrors.value = [message]
    toast.add({
      title: 'Error',
      description: message,
      color: 'error'
    })
  }
}

useSeoMeta({
  title: 'Sign In - Phrames',
  description: 'Sign in to your Phrames account to manage your photo frame campaigns.'
})
</script>