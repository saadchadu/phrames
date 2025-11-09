import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const googleProvider = new GoogleAuthProvider()

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
}

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signUpWithEmail = async (email: string, password: string, displayName?: string, photoURL?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user profile in Firestore with custom data
    await createUserProfile(result.user, displayName, photoURL)
    
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    
    // Create or update user profile in Firestore
    await createUserProfile(result.user)
    
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// User profile management
export const createUserProfile = async (user: User, customDisplayName?: string, customPhotoURL?: string) => {
  if (!user) return

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const { uid, email } = user
    const createdAt = new Date()

    try {
      await setDoc(userRef, {
        uid,
        email,
        displayName: customDisplayName || user.displayName || email?.split('@')[0] || 'User',
        photoURL: customPhotoURL || user.photoURL || '',
        createdAt
      })
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}