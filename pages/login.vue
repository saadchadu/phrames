<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          Sign in to Phrames
        </h2>
        <p class="mt-2 text-gray-600">
          Welcome back! Please sign in to your account.
        </p>
      </div>
      
      <UCard class="p-6">
        <UForm 
          :schema="loginSchema" 
          :state="form" 
          @submit="handleLogin"
          class="space-y-4"
        >
          <UFormGroup label="Email" name="email">
            <UInput 
              v-model="form.email" 
              type="email" 
              placeholder="Enter your email"
              :disabled="loading"
            />
          </UFormGroup>
          
          <UFormGroup label="Password" name="password">
            <UInput 
              v-model="form.password" 
              type="password" 
              placeholder="Enter your password"
              :disabled="loading"
            />
          </UFormGroup>
          
          <UButton 
            type="submit" 
            block 
            :loading="loading"
            :disabled="loading"
          >
            Sign In
          </UButton>
        </UForm>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/signup" class="text-blue-600 hover:text-blue-500">
              Sign up here
            </NuxtLink>
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

const { login, loading, initAuth } = useAuth()
const toast = useToast()
const route = useRoute()

// Initialize Firebase auth
onMounted(() => {
  initAuth()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    await login(form.email, form.password)
    
    const redirectParam = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const redirectTarget = redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard'
    
    toast.add({
      title: 'Success',
      description: 'Welcome back!',
      color: 'green'
    })
    
    await navigateTo(redirectTarget)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in. Please try again.'
    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
  }
}

useSeoMeta({
  title: 'Sign In - Phrames',
  description: 'Sign in to your Phrames account to manage your photo frame campaigns.'
})
</script>
