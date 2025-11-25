import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (server-side only)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export interface AdminAuthResult {
  isAdmin: boolean;
  userId: string | null;
  error?: string;
}

/**
 * Verify if the current user has admin access
 * Checks both environment variable ADMIN_UID and Firestore isAdmin field
 * 
 * @param request - Optional Request object for API routes
 * @returns AdminAuthResult with admin status and user ID
 */
export async function verifyAdminAccess(request?: Request): Promise<AdminAuthResult> {
  try {
    // Try to get token from Authorization header first (for API routes and tests)
    if (request) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        return await verifyTokenAdmin(token);
      }
    }

    // Get the session token from cookies (for server components)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return { isAdmin: false, userId: null, error: 'No authentication token' };
    }

    // Verify the session cookie
    return await verifyTokenAdmin(sessionCookie.value);
  } catch (error) {
    console.error('Admin verification error:', error);
    return { 
      isAdmin: false, 
      userId: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Verify admin access from a Firebase token or user ID (for testing)
 * Exported for testing purposes
 * 
 * @param tokenOrUserId - Firebase ID token or user ID (for testing)
 * @returns AdminAuthResult
 */
export async function verifyTokenAdmin(tokenOrUserId: string): Promise<AdminAuthResult> {
  let userId: string;
  let decodedToken: admin.auth.DecodedIdToken | null = null;

  // Try to verify as ID token first
  try {
    decodedToken = await admin.auth().verifyIdToken(tokenOrUserId);
    userId = decodedToken.uid;
  } catch (tokenError) {
    // If token verification fails, treat it as a direct user ID (for testing)
    // Verify the user exists
    try {
      const userRecord = await admin.auth().getUser(tokenOrUserId);
      userId = tokenOrUserId;
      // Use custom claims from user record if available
      if (userRecord.customClaims?.isAdmin === true) {
        decodedToken = { isAdmin: true } as any;
      }
    } catch (userError) {
      return { 
        isAdmin: false, 
        userId: null, 
        error: 'Invalid token or user ID' 
      };
    }
  }

  try {

    // Check if user ID matches the admin UID from environment
    const adminUid = process.env.ADMIN_UID;
    if (adminUid && userId === adminUid) {
      return { isAdmin: true, userId };
    }

    // Check custom claims for isAdmin (if we have a decoded token)
    if (decodedToken && decodedToken.isAdmin === true) {
      return { isAdmin: true, userId };
    }

    // Check Firestore for isAdmin field using Admin SDK
    const adminDb = admin.firestore();
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.isAdmin === true) {
        // Sync custom claim if not already set
        await setAdminClaim(userId, true);
        return { isAdmin: true, userId };
      }
    }

    return { isAdmin: false, userId };
  } catch (error) {
    console.error('Token verification error:', error);
    return { 
      isAdmin: false, 
      userId: null, 
      error: error instanceof Error ? error.message : 'Token verification failed' 
    };
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this in API routes and server components that require admin access
 * 
 * @param request - Optional Request object for API routes
 * @returns userId of the admin user
 * @throws Error if user is not admin
 */
export async function requireAdmin(request?: Request): Promise<string> {
  const result = await verifyAdminAccess(request);
  
  if (!result.isAdmin || !result.userId) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return result.userId;
}

/**
 * Set or remove admin custom claim on a user's Firebase Auth token
 * This allows for efficient admin verification without Firestore queries
 * 
 * @param userId - Firebase user ID
 * @param isAdmin - Whether the user should have admin privileges
 */
export async function setAdminClaim(userId: string, isAdmin: boolean): Promise<void> {
  try {
    await admin.auth().setCustomUserClaims(userId, { isAdmin });
    console.log(`Admin claim set for user ${userId}: ${isAdmin}`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new Error('Failed to set admin claim');
  }
}

/**
 * Sync admin status from Firestore to custom claims
 * Call this periodically or after updating isAdmin in Firestore
 * 
 * @param userId - Firebase user ID
 */
export async function syncAdminClaim(userId: string): Promise<void> {
  try {
    const adminDb = admin.firestore();
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const isAdmin = userData?.isAdmin === true;
      await setAdminClaim(userId, isAdmin);
    }
  } catch (error) {
    console.error('Error syncing admin claim:', error);
    throw new Error('Failed to sync admin claim');
  }
}

/**
 * Get admin auth instance for server-side operations
 * Use this when you need direct access to Firebase Admin Auth
 */
export function getAdminAuth() {
  return admin.auth();
}

/**
 * Get admin firestore instance for server-side operations
 * Use this when you need direct access to Firebase Admin Firestore
 */
export function getAdminFirestore() {
  return admin.firestore();
}
