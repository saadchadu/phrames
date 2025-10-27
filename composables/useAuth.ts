interface User {
  id: string
  email: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const initialized = useState<boolean>('auth.initialized', () => false)

  // Initialize auth state
  const initAuth = async () => {
    if (process.server || initialized.value) return

    loading.value = true
    try {
      // Check if user is authenticated by calling a protected endpoint
      const response = await $fetch('/api/auth/me').catch(() => null)
      user.value = response?.user || null
    } catch (error) {
      user.value = null
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = response.user
    } catch (error: any) {
      const message = error.data?.message || error.statusMessage || 'Login failed'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const signup = async (email: string, password: string) => {
    loading.value = true
    try {
      const response = await $fetch('/api/auth/signup', {
        method: 'POST',
        body: { email, password }
      })
      user.value = response.user
    } catch (error: any) {
      const message = error.data?.message || error.statusMessage || 'Signup failed'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    initialized: readonly(initialized),
    login,
    signup,
    logout,
    initAuth
  }
}
