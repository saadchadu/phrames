import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'

const googleProvider = new GoogleAuthProvider()

export interface UserProfile {
  uid: string
  email: string
  username?: string
  displayName?: string
  bio?: string
  photoURL?: string
  avatarURL?: string
  totalDownloads: number
  totalVisits: number
  createdAt: Date
  joinedAt: Date
}

// Username validation
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }
  if (username.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' }
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
  }
  return { valid: true }
}

// Generate username from email
export const generateUsernameFromEmail = (email: string): string => {
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  return baseUsername || 'user'
}

// Check if username is unique
export const isUsernameUnique = async (username: string, excludeUid?: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.toLowerCase()))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return true
    }
    
    // If excludeUid is provided, check if the only match is the current user
    if (excludeUid && querySnapshot.size === 1) {
      const doc = querySnapshot.docs[0]
      return doc.id === excludeUid
    }
    
    return false
  } catch (error) {
    return false
  }
}

// Get user by username
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.toLowerCase()))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { ...doc.data(), uid: doc.id } as UserProfile
    }
    return null
  } catch (error) {
    return null
  }
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

// Validate email domain
const validateEmailDomain = (email: string): boolean => {
  const allowedDomains = [
    'gmail.com', 'googlemail.com',
    'outlook.com', 'outlook.in', 'outlook.co.uk', 'outlook.fr', 'outlook.de', 'outlook.es', 'outlook.it', 'outlook.jp', 'outlook.kr', 'outlook.com.br',
    'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.es', 'hotmail.it', 'hotmail.jp',
    'live.com', 'live.co.uk', 'live.fr', 'live.de', 'live.it', 'msn.com',
    'icloud.com', 'me.com', 'mac.com',
    'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it', 'yahoo.co.jp', 'yahoo.co.in', 'ymail.com',
    'protonmail.com', 'proton.me', 'pm.me',
    'zoho.com', 'aol.com', 'gmx.com', 'gmx.net', 'mail.com', 'fastmail.com', 'tutanota.com', 'tutanota.de', 'tuta.io'
  ]

  const emailDomain = email.toLowerCase().split('@')[1]
  
  if (!emailDomain) return false
  
  // Check if it's in allowed list
  if (allowedDomains.includes(emailDomain)) return true
  
  // Check if it's a corporate email (basic validation)
  const isCorporateEmail = 
    !emailDomain.includes('temp') && 
    !emailDomain.includes('disposable') &&
    !emailDomain.includes('throwaway') &&
    !emailDomain.includes('guerrilla') &&
    !emailDomain.includes('mailinator') &&
    !emailDomain.includes('10minute') &&
    emailDomain.split('.').length >= 2
  
  return isCorporateEmail
}

export const signUpWithEmail = async (email: string, password: string, displayName?: string, photoURL?: string) => {
  try {
    // Validate email domain
    if (!validateEmailDomain(email)) {
      return { 
        user: null, 
        error: 'Please use an email from Gmail, Outlook, Hotmail, Apple (iCloud), Yahoo, or your company email.' 
      }
    }

    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Email verification removed - not needed
    
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

// Admin emails that should automatically get admin access
const ADMIN_EMAILS = ['saadchadu@gmail.com']

// User profile management
export const createUserProfile = async (user: User, customDisplayName?: string, customPhotoURL?: string) => {
  if (!user) return

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const { uid, email } = user
    const createdAt = new Date()
    
    // Generate initial username from email
    let baseUsername = generateUsernameFromEmail(email || '')
    let username = baseUsername
    let counter = 1
    
    // Ensure username is unique
    while (!(await isUsernameUnique(username))) {
      username = `${baseUsername}${counter}`
      counter++
    }

    // Check if user should be admin
    const isAdmin = email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false

    try {
      await setDoc(userRef, {
        uid,
        email,
        username: username.toLowerCase(),
        displayName: customDisplayName || user.displayName || email?.split('@')[0] || 'User',
        bio: '',
        photoURL: customPhotoURL || user.photoURL || '',
        avatarURL: customPhotoURL || user.photoURL || '',
        totalDownloads: 0,
        totalVisits: 0,
        createdAt,
        joinedAt: createdAt,
        ...(isAdmin && { isAdmin: true })
      })

      // If admin, also set custom claim via API
      if (isAdmin) {
        try {
          const idToken = await user.getIdToken()
          await fetch('/api/admin/grant-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ userId: uid })
          })
        } catch (error) {
          // Silently fail admin claim setting
        }
      }
    } catch (error) {
      // Silently fail profile creation
    }
  } else {
    // User exists, check if they should be admin but aren't
    const userData = userSnap.data()
    const email = user.email
    const isAdmin = email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false
    
    if (isAdmin && !userData.isAdmin) {
      try {
        await setDoc(userRef, { isAdmin: true }, { merge: true })
        
        // Set custom claim via API
        const idToken = await user.getIdToken()
        await fetch('/api/admin/grant-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ userId: user.uid })
        })
      } catch (error) {
        // Silently fail admin status update
      }
    }
  }
}

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, updates, { merge: true })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
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
    return null
  }
}

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}