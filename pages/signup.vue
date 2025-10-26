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
              placeholder="Create a password (min 8 characters)"
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

// Initialize Firebase auth
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

const handleSignup = async () => {
  try {
    await signup(form.email, form.password)
    toast.add({
      title: 'Success',
      description: 'Account created successfully!',
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  }
}

useSeoMeta({
  title: 'Sign Up - Phrames',
  description: 'Create your free Phrames account and start building photo frame campaigns.'
})
</script>