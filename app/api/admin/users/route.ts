import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import type { Query } from 'firebase-admin/firestore';
import { 
  logUserBlocked, 
  logUserUnblocked, 
  logUserDeleted, 
  logUserAdminSet, 
  logUserFreeCampaignReset 
} from '@/lib/admin-logging-server';
import { setAdminClaim } from '@/lib/admin-auth';

const db = adminDb;

// Helper to safely convert Firestore timestamp to Date
function toDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof timestamp === 'number') return new Date(timestamp);
  return null;
}

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    return decoded.isAdmin === true ? decoded : null
  } catch { return null }
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const freeCampaignFilter = searchParams.get('freeCampaignUsed');
    const blockedFilter = searchParams.get('blocked');
    const minCampaigns = searchParams.get('minCampaigns');

    let query: Query = db.collection('users');

    // Apply filters
    if (freeCampaignFilter === 'true') {
      query = query.where('freeCampaignUsed', '==', true);
    } else if (freeCampaignFilter === 'false') {
      query = query.where('freeCampaignUsed', '==', false);
    }

    if (blockedFilter === 'true') {
      query = query.where('isBlocked', '==', true);
    }

    const snapshot = await query.get();
    
    // Get campaign counts for each user
    const campaignsSnapshot = await db.collection('campaigns').get();
    const campaignsByUser: { [key: string]: number } = {};
    
    campaignsSnapshot.docs.forEach(doc => {
      const userId = doc.data().createdBy;
      if (userId) {
        campaignsByUser[userId] = (campaignsByUser[userId] || 0) + 1;
      }
    });

    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        totalCampaigns: campaignsByUser[doc.id] || 0,
        createdAt: toDate(data.createdAt)?.toISOString(),
        joinedAt: toDate(data.joinedAt)?.toISOString(),
        blockedAt: toDate(data.blockedAt)?.toISOString(),
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => {
        const data = user as any;
        return (
          data.email?.toLowerCase().includes(searchLower) ||
          data.displayName?.toLowerCase().includes(searchLower) ||
          data.username?.toLowerCase().includes(searchLower) ||
          user.id.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply minimum campaigns filter
    if (minCampaigns) {
      const minCount = parseInt(minCampaigns, 10);
      if (!isNaN(minCount)) {
        users = users.filter(user => {
          const data = user as any;
          return data.totalCampaigns >= minCount;
        });
      }
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json();
    const { userId, action, ...data } = body;
    const adminId = admin.uid; // Always use the verified token uid, never trust body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prevent admin from modifying their own account (except safe read-only actions)
    const adminDoc = await db.collection('users').doc(adminId).get()
    const adminEmail = adminDoc.data()?.email
    if (userId === adminId && ['setAdmin', 'block', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'You cannot perform this action on your own account' },
        { status: 403 }
      );
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    switch (action) {
      case 'setAdmin':
        const isAdmin = data.isAdmin === true;
        
        // Protected users cannot have admin privileges removed
        const protectedEmails = ['saadchadu@gmail.com'];
        if (userData?.email && protectedEmails.includes(userData.email) && !isAdmin) {
          return NextResponse.json(
            { error: 'This user is protected and admin privileges cannot be removed' },
            { status: 403 }
          );
        }
        
        await userRef.update({ isAdmin });
        await setAdminClaim(userId, isAdmin);
        await logUserAdminSet(
          adminId,
          userId,
          userData?.email || 'Unknown',
          isAdmin
        );
        break;

      case 'resetFreeCampaign':
        await userRef.update({ freeCampaignUsed: false });
        await logUserFreeCampaignReset(
          adminId,
          userId,
          userData?.email || 'Unknown'
        );
        break;

      case 'block':
        if (data.reason && data.reason.length > 500) {
          return NextResponse.json({ error: 'Block reason must be 500 characters or fewer' }, { status: 400 });
        }
        await userRef.update({
          isBlocked: true,
          blockedAt: FieldValue.serverTimestamp(),
          blockedBy: adminId,
          blockedReason: data.reason || 'No reason provided',
        });
        await logUserBlocked(
          adminId,
          userId,
          userData?.email || 'Unknown',
          data.reason
        );
        break;

      case 'unblock':
        await userRef.update({
          isBlocked: false,
          blockedAt: FieldValue.delete(),
          blockedBy: FieldValue.delete(),
          blockedReason: FieldValue.delete(),
        });
        await logUserUnblocked(
          adminId,
          userId,
          userData?.email || 'Unknown'
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const adminId = admin.uid; // Always use verified token uid

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Protected users that cannot be deleted
    const protectedEmails = ['saadchadu@gmail.com'];
    if (userData?.email && protectedEmails.includes(userData.email)) {
      return NextResponse.json(
        { error: 'This user is protected and cannot be deleted' },
        { status: 403 }
      );
    }
    
    // Delete user from Firestore
    await userRef.delete();
    
    // Delete user from Firebase Auth
    try {
      await adminAuth.deleteUser(userId);
    } catch (authError) {
      console.error('Error deleting user from Auth:', authError);
    }
    
    await logUserDeleted(
      adminId,
      userId,
      userData?.email || 'Unknown'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
