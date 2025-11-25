import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function cleanFirestore() {
  try {
    const PRESERVE_EMAIL = 'saadchadu@gmail.com';
    
    console.log('🔍 Checking Firestore collections...\n');

    // Get collection counts for all collections
    const [
      usersSnap, 
      campaignsSnap, 
      paymentsSnap,
      logsSnap,
      sessionsSnap,
      settingsSnap,
      auditLogsSnap,
      campaignStatsDailySnap,
      expiryLogsSnap
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('campaigns').get(),
      db.collection('payments').get(),
      db.collection('logs').get(),
      db.collection('sessions').get(),
      db.collection('settings').get(),
      db.collection('audit_logs').get(),
      db.collection('campaign_stats_daily').get(),
      db.collection('expiryLogs').get(),
    ]);

    // Find the user to preserve
    const preserveUser = usersSnap.docs.find(doc => doc.data().email === PRESERVE_EMAIL);
    const preserveUserId = preserveUser?.id;

    console.log('Current data:');
    console.log(`  - Users: ${usersSnap.size} documents`);
    console.log(`  - Campaigns: ${campaignsSnap.size} documents`);
    console.log(`  - Payments: ${paymentsSnap.size} documents`);
    console.log(`  - Logs: ${logsSnap.size} documents`);
    console.log(`  - Sessions: ${sessionsSnap.size} documents`);
    console.log(`  - Settings: ${settingsSnap.size} documents`);
    console.log(`  - Audit Logs: ${auditLogsSnap.size} documents`);
    console.log(`  - Campaign Stats Daily: ${campaignStatsDailySnap.size} documents`);
    console.log(`  - Expiry Logs: ${expiryLogsSnap.size} documents`);
    console.log('');
    console.log(`🔒 Will preserve user: ${PRESERVE_EMAIL} (ID: ${preserveUserId || 'NOT FOUND'})`);
    
    if (preserveUserId) {
      const userCampaigns = campaignsSnap.docs.filter(doc => doc.data().userId === preserveUserId || doc.data().createdBy === preserveUserId);
      const userPayments = paymentsSnap.docs.filter(doc => doc.data().userId === preserveUserId);
      const userSessions = sessionsSnap.docs.filter(doc => doc.data().userId === preserveUserId);
      const userLogs = logsSnap.docs.filter(doc => doc.data().actorId === preserveUserId);
      console.log(`   - User's campaigns: ${userCampaigns.length}`);
      console.log(`   - User's payments: ${userPayments.length}`);
      console.log(`   - User's sessions: ${userSessions.length}`);
      console.log(`   - User's logs: ${userLogs.length}`);
    }
    console.log('');

    // Ask for confirmation
    const answer = await question(
      '⚠️  WARNING: This will DELETE ALL data EXCEPT saadchadu@gmail.com!\n' +
        'This action CANNOT be undone.\n\n' +
        'Type "DELETE TEST DATA" to confirm: '
    );

    if (answer !== 'DELETE TEST DATA') {
      console.log('\n❌ Operation cancelled. No data was deleted.');
      rl.close();
      process.exit(0);
    }

    console.log('\n🗑️  Deleting test data...\n');

    // Delete users (except preserved user)
    console.log('Deleting users...');
    const usersToDelete = usersSnap.docs.filter(doc => doc.data().email !== PRESERVE_EMAIL);
    let deletedUsers = 0;
    
    for (let i = 0; i < usersToDelete.length; i += 500) {
      const batch = db.batch();
      const batchDocs = usersToDelete.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedUsers += batchDocs.length;
    }
    console.log(`✓ Deleted ${deletedUsers} users (preserved 1: ${PRESERVE_EMAIL})`);

    // Delete campaigns (except those belonging to preserved user)
    console.log('Deleting campaigns...');
    const campaignsToDelete = campaignsSnap.docs.filter(doc => {
      const data = doc.data();
      return data.userId !== preserveUserId && data.createdBy !== preserveUserId;
    });
    let deletedCampaigns = 0;
    
    for (let i = 0; i < campaignsToDelete.length; i += 500) {
      const batch = db.batch();
      const batchDocs = campaignsToDelete.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedCampaigns += batchDocs.length;
    }
    const preservedCampaigns = campaignsSnap.size - deletedCampaigns;
    console.log(`✓ Deleted ${deletedCampaigns} campaigns (preserved ${preservedCampaigns} for ${PRESERVE_EMAIL})`);

    // Delete payments (except those belonging to preserved user)
    console.log('Deleting payments...');
    const paymentsToDelete = paymentsSnap.docs.filter(doc => doc.data().userId !== preserveUserId);
    let deletedPayments = 0;
    
    for (let i = 0; i < paymentsToDelete.length; i += 500) {
      const batch = db.batch();
      const batchDocs = paymentsToDelete.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedPayments += batchDocs.length;
    }
    const preservedPayments = paymentsSnap.size - deletedPayments;
    console.log(`✓ Deleted ${deletedPayments} payments (preserved ${preservedPayments} for ${PRESERVE_EMAIL})`);

    // Delete sessions (except those belonging to preserved user)
    console.log('Deleting sessions...');
    const sessionsToDelete = sessionsSnap.docs.filter(doc => doc.data().userId !== preserveUserId);
    let deletedSessions = 0;
    
    for (let i = 0; i < sessionsToDelete.length; i += 500) {
      const batch = db.batch();
      const batchDocs = sessionsToDelete.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedSessions += batchDocs.length;
    }
    const preservedSessions = sessionsSnap.size - deletedSessions;
    console.log(`✓ Deleted ${deletedSessions} sessions (preserved ${preservedSessions} for ${PRESERVE_EMAIL})`);

    // Delete logs (test logs, and logs not by preserved user or system)
    console.log('Deleting logs...');
    const logsToDelete = logsSnap.docs.filter(doc => {
      const data = doc.data();
      const actorId = data.actorId;
      const isTestLog = data.metadata?.test === true;
      
      // Delete if it's a test log OR if it's not from preserved user/system
      return isTestLog || (actorId !== preserveUserId && actorId !== 'system');
    });
    let deletedLogs = 0;
    
    for (let i = 0; i < logsToDelete.length; i += 500) {
      const batch = db.batch();
      const batchDocs = logsToDelete.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedLogs += batchDocs.length;
    }
    const preservedLogs = logsSnap.size - deletedLogs;
    console.log(`✓ Deleted ${deletedLogs} logs including test logs (preserved ${preservedLogs} for ${PRESERVE_EMAIL} and system)`);

    // Delete all audit logs (these are test data)
    console.log('Deleting audit logs...');
    let deletedAuditLogs = 0;
    
    for (let i = 0; i < auditLogsSnap.docs.length; i += 500) {
      const batch = db.batch();
      const batchDocs = auditLogsSnap.docs.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedAuditLogs += batchDocs.length;
    }
    console.log(`✓ Deleted ${deletedAuditLogs} audit logs`);

    // Delete all campaign stats daily (these are test data)
    console.log('Deleting campaign stats...');
    let deletedCampaignStats = 0;
    
    for (let i = 0; i < campaignStatsDailySnap.docs.length; i += 500) {
      const batch = db.batch();
      const batchDocs = campaignStatsDailySnap.docs.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedCampaignStats += batchDocs.length;
    }
    console.log(`✓ Deleted ${deletedCampaignStats} campaign stats`);

    // Delete all expiry logs (these are test data)
    console.log('Deleting expiry logs...');
    let deletedExpiryLogs = 0;
    
    for (let i = 0; i < expiryLogsSnap.docs.length; i += 500) {
      const batch = db.batch();
      const batchDocs = expiryLogsSnap.docs.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedExpiryLogs += batchDocs.length;
    }
    console.log(`✓ Deleted ${deletedExpiryLogs} expiry logs`);

    // Delete test settings (keep only 'plans' and 'system' documents)
    console.log('Deleting test settings...');
    const settingsToDelete = settingsSnap.docs.filter(doc => {
      const docId = doc.id;
      // Keep only 'plans' and 'system' documents, delete everything else (especially test-immediate-* docs)
      return docId !== 'plans' && docId !== 'system';
    });
    let deletedSettings = 0;
    
    for (let i = 0; i < settingsToDelete.length; i += 500) {
      const batch = db.batch();
      const batchDocs = settingsToDelete.slice(i, i + 500);
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedSettings += batchDocs.length;
    }
    const preservedSettings = settingsSnap.size - deletedSettings;
    console.log(`✓ Deleted ${deletedSettings} test settings (preserved ${preservedSettings}: plans, system)`);

    console.log('\n✅ All test data has been cleaned from Firestore!');
    console.log(`🔒 Preserved data for ${PRESERVE_EMAIL}`);
    console.log('Your admin dashboard will now show only your real data.\n');
  } catch (error) {
    console.error('❌ Error cleaning Firestore:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

cleanFirestore();
