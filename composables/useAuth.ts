import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'

interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
}

export const useAuth = () => {
  const { $auth } = useNuxtApp()
  const user = useState<User | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const initialized = useState<boolean>('auth.initialized', () => false)
  const listenerRegistered = useState<boolean>('auth.listenerRegistered', () => false)
  const initPromise = useState<Promise<void> | null>('auth.initPromise', () => null)
  const initResolve = useState<(() => void) | null>('auth.initResolve', () => null)

  // Initialize auth state listener
  const initAuth = async () => {
    if (process.server) return

    if (initialized.value) {
      return
    }

    if (initPromise.value) {
      await initPromise.value
      return
    }

    initPromise.value = new Promise<void>((resolve) => {
      initResolve.value = resolve
    })

    if (!listenerRegistered.value) {
      listenerRegistered.value = true

      onAuthStateChanged($auth, async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            user.value = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined
            }

            // Sync with backend
            try {
              const token = await firebaseUser.getIdToken()
              await $fetch('/api/auth/sync', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`
                }
              })
            } catch (error) {
              console.error('Failed to sync user:', error)
            }
          } else {
            user.value = null
          }
        } finally {
          initialized.value = true
          initResolve.value?.()
          initPromise.value = null
          initResolve.value = null
        }
      })
    }

    if (initPromise.value) {
      await initPromise.value
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      await signInWithEmailAndPassword($auth, email, password)
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code))
    } finally {
      loading.value = false
    }
  }

  const signup = async (email: string, password: string) => {
    loading.value = true
    try {
      await createUserWithEmailAndPassword($auth, email, password)
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code))
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await signOut($auth)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      loading.value = false
    }
  }

  const getIdToken = async (): Promise<string | null> => {
    if (!$auth.currentUser) return null
    try {
      return await $auth.currentUser.getIdToken()
    } catch (error) {
      console.error('Failed to get ID token:', error)
      return null
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    initialized: readonly(initialized),
    login,
    signup,
    logout,
    getIdToken,
    initAuth
  }
}

function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password'
    case 'auth/email-already-in-use':
      return 'Email is already registered'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    default:
      return 'Authentication failed. Please try again'
  }
}
