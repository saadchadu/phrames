import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'

interface User {
  id: string
  email: string
}

export const useAuth = () => {
  const { $firebaseAuth } = useNuxtApp()
  const user = useState<User | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const initialized = useState<boolean>('auth.initialized', () => false)

  // Initialize auth state
  const initAuth = async () => {
    if (process.server || initialized.value || !$firebaseAuth) return

    loading.value = true
    
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged($firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // User is signed in, sync with backend
          try {
            const token = await firebaseUser.getIdToken()
            const response = await $fetch('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            user.value = response.user
          } catch (error) {
            console.error('Failed to sync user with backend:', error)
            user.value = null
          }
        } else {
          // User is signed out
          user.value = null
        }
        
        if (!initialized.value) {
          initialized.value = true
          loading.value = false
          resolve()
        }
      })

      // Cleanup function
      return unsubscribe
    })
  }

  const login = async (email: string, password: string) => {
    if (!$firebaseAuth) {
      throw new Error('Firebase not initialized')
    }

    loading.value = true
    try {
      const userCredential = await signInWithEmailAndPassword($firebaseAuth, email, password)
      const token = await userCredential.user.getIdToken()
      
      // Sync with backend
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      user.value = response.user
    } catch (error: any) {
      const message = error.message || 'Login failed'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const signup = async (email: string, password: string) => {
    if (!$firebaseAuth) {
      throw new Error('Firebase not initialized')
    }

    loading.value = true
    try {
      const userCredential = await createUserWithEmailAndPassword($firebaseAuth, email, password)
      const token = await userCredential.user.getIdToken()
      
      // Sync with backend
      const response = await $fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: { email, password }
      })
      
      user.value = response.user
    } catch (error: any) {
      const message = error.message || 'Signup failed'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    if (!$firebaseAuth) {
      throw new Error('Firebase not initialized')
    }

    loading.value = true
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup($firebaseAuth, provider)
      const token = await userCredential.user.getIdToken()
      
      // Sync with backend
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      user.value = response.user
    } catch (error: any) {
      const message = error.message || 'Google sign-in failed'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    if (!$firebaseAuth) return

    loading.value = true
    try {
      await signOut($firebaseAuth)
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
    loginWithGoogle,
    logout,
    initAuth
  }
}
