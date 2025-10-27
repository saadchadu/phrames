<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-gray-600">
          Join Phrames and start creating beautiful photo frames.
        </p>
      </div>
      
      <UCard class="p-6">
        <div v-if="formErrors.length > 0" class="mb-4">
          <UAlert
            v-for="error in formErrors"
            :key="error"
            color="red"
            variant="soft"
            :title="error"
            class="mb-2"
          />
        </div>
        
        <UForm 
          :schema="signupSchema" 
          :state="form" 
          @submit="handleSignup"
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
              placeholder="Create a password (min 6 characters)"
              :disabled="loading"
            />
          </UFormGroup>
          
          <UFormGroup label="Confirm Password" name="confirmPassword">
            <UInput 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="Confirm your password"
              :disabled="loading"
            />
          </UFormGroup>
          
          <UButton 
            type="submit" 
            block 
            :loading="loading"
            :disabled="loading"
          >
            Create Account
          </UButton>
        </UForm>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <NuxtLink to="/login" class="text-blue-600 hover:text-blue-500">
              Sign in here
            </NuxtLink>
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

const { signup, loading, initAuth } = useAuth()
const toast = useToast()
const route = useRoute()

// Initialize auth
onMounted(() => {
  initAuth()
})

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const formErrors = ref<string[]>([])

const handleSignup = async (data: any) => {
  formErrors.value = []
  try {
    await signup(data.email, data.password)
    
    const redirectParam = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const redirectTarget = redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard'
    
    toast.add({
      title: 'Success',
      description: 'Account created successfully!',
      color: 'green'
    })
    
    await navigateTo(redirectTarget)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create account. Please try again.'
    formErrors.value = [message]
    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
  }
}

useSeoMeta({
  title: 'Sign Up - Phrames',
  description: 'Create your free Phrames account and start building photo frame campaigns.'
})
</script>
