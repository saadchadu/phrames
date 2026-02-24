import { adminDb } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Log event types for admin and system actions
 */
export enum LogEventType {
  ADMIN_ACTION = 'admin_action',
  CRON_EXECUTION = 'cron_execution',
  WEBHOOK_FAILURE = 'webhook_failure',
  CAMPAIGN_EXPIRY = 'campaign_expiry',
  CAMPAIGN_DEACTIVATED = 'campaign_deactivated',
  CAMPAIGN_REACTIVATED = 'campaign_reactivated',
  CAMPAIGN_EXTENDED = 'campaign_extended',
  CAMPAIGN_DELETED = 'campaign_deleted',
  USER_BLOCKED = 'user_blocked',
  USER_UNBLOCKED = 'user_unblocked',
  USER_DELETED = 'user_deleted',
  USER_ADMIN_SET = 'user_admin_set',
  USER_FREE_CAMPAIGN_RESET = 'user_free_campaign_reset',
  SETTINGS_CHANGED = 'settings_changed',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILURE = 'payment_failure',
  MANUAL_CRON_TRIGGER = 'manual_cron_trigger',
  DATA_EXPORT = 'data_export',
}

/**
 * Log entry interface
 */
export interface LogEntry {
  id?: string;
  eventType: LogEventType;
  actorId: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Timestamp;
}

/**
 * Create a new log entry using Admin SDK
 */
export async function createLog(
  entry: Omit<LogEntry, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const logData = {
      ...entry,
      createdAt: Timestamp.now(),
    };

    const logsRef = adminDb.collection('logs');
    const docRef = await logsRef.add(logData);

    return docRef.id;
  } catch (error) {
    throw new Error('Failed to create log entry');
  }
}

export async function logCampaignDeactivated(
  adminId: string,
  campaignId: string,
  campaignName: string,
  reason?: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.CAMPAIGN_DEACTIVATED,
    actorId: adminId,
    description: `Campaign "${campaignName}" deactivated`,
    metadata: {
      campaignId,
      campaignName,
      reason,
    },
  });
}

export async function logCampaignReactivated(
  adminId: string,
  campaignId: string,
  campaignName: string,
  newExpiryDate?: Date
): Promise<string> {
  return createLog({
    eventType: LogEventType.CAMPAIGN_REACTIVATED,
    actorId: adminId,
    description: `Campaign "${campaignName}" reactivated`,
    metadata: {
      campaignId,
      campaignName,
      newExpiryDate: newExpiryDate?.toISOString(),
    },
  });
}

export async function logCampaignExtended(
  adminId: string,
  campaignId: string,
  campaignName: string,
  oldExpiryDate: Date,
  newExpiryDate: Date,
  daysAdded: number
): Promise<string> {
  return createLog({
    eventType: LogEventType.CAMPAIGN_EXTENDED,
    actorId: adminId,
    description: `Campaign "${campaignName}" extended by ${daysAdded} days`,
    metadata: {
      campaignId,
      campaignName,
      oldExpiryDate: oldExpiryDate.toISOString(),
      newExpiryDate: newExpiryDate.toISOString(),
      daysAdded,
    },
  });
}

export async function logCampaignDeleted(
  adminId: string,
  campaignId: string,
  campaignName: string,
  userId: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.CAMPAIGN_DELETED,
    actorId: adminId,
    description: `Campaign "${campaignName}" deleted`,
    metadata: {
      campaignId,
      campaignName,
      userId,
    },
  });
}

export async function logUserBlocked(
  adminId: string,
  userId: string,
  userEmail: string,
  reason?: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.USER_BLOCKED,
    actorId: adminId,
    description: `User ${userEmail} blocked`,
    metadata: {
      userId,
      userEmail,
      reason,
    },
  });
}

export async function logUserUnblocked(
  adminId: string,
  userId: string,
  userEmail: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.USER_UNBLOCKED,
    actorId: adminId,
    description: `User ${userEmail} unblocked`,
    metadata: {
      userId,
      userEmail,
    },
  });
}

export async function logUserDeleted(
  adminId: string,
  userId: string,
  userEmail: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.USER_DELETED,
    actorId: adminId,
    description: `User ${userEmail} deleted`,
    metadata: {
      userId,
      userEmail,
    },
  });
}

export async function logUserAdminSet(
  adminId: string,
  userId: string,
  userEmail: string,
  isAdmin: boolean
): Promise<string> {
  return createLog({
    eventType: LogEventType.USER_ADMIN_SET,
    actorId: adminId,
    description: `User ${userEmail} admin status set to ${isAdmin}`,
    metadata: {
      userId,
      userEmail,
      isAdmin,
    },
  });
}

export async function logUserFreeCampaignReset(
  adminId: string,
  userId: string,
  userEmail: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.USER_FREE_CAMPAIGN_RESET,
    actorId: adminId,
    description: `User ${userEmail} free campaign reset`,
    metadata: {
      userId,
      userEmail,
    },
  });
}

export async function logManualCronTrigger(
  adminId: string,
  cronType: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.MANUAL_CRON_TRIGGER,
    actorId: adminId,
    description: `Manually triggered ${cronType} cron job`,
    metadata: {
      cronType,
    },
  });
}

export async function logDataExport(
  adminId: string,
  exportType: 'payments' | 'campaigns',
  recordCount: number
): Promise<string> {
  return createLog({
    eventType: LogEventType.DATA_EXPORT,
    actorId: adminId,
    description: `Exported ${recordCount} ${exportType} records`,
    metadata: {
      exportType,
      recordCount,
    },
  });
}
