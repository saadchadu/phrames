import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from './firebase';

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
  actorId: string; // 'system' or admin user ID
  description: string;
  metadata: Record<string, any>;
  createdAt: Timestamp;
}

/**
 * Filters for querying logs
 */
export interface LogFilters {
  eventType?: LogEventType;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * Create a new log entry
 * 
 * @param entry - Log entry data (without id and createdAt)
 * @returns Promise with the created log ID
 */
export async function createLog(
  entry: Omit<LogEntry, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const logData = {
      ...entry,
      createdAt: Timestamp.now(),
    };

    const logsRef = collection(db, 'logs');
    const docRef = await addDoc(logsRef, logData);

    return docRef.id;
  } catch (error) {
    throw new Error('Failed to create log entry');
  }
}

/**
 * Get logs with optional filtering
 * 
 * @param filters - Optional filters for querying logs
 * @returns Promise with array of log entries
 */
export async function getLogs(filters?: LogFilters): Promise<LogEntry[]> {
  try {
    const logsRef = collection(db, 'logs');
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (filters?.eventType) {
      constraints.push(where('eventType', '==', filters.eventType));
    }

    if (filters?.actorId) {
      constraints.push(where('actorId', '==', filters.actorId));
    }

    if (filters?.startDate) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
    }

    if (filters?.endDate) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.endDate)));
    }

    // Always order by createdAt descending (most recent first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Add limit
    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    } else {
      constraints.push(limit(100)); // Default limit
    }

    const q = query(logsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const logs: LogEntry[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      } as LogEntry);
    });

    return logs;
  } catch (error) {
    throw new Error('Failed to retrieve logs');
  }
}

/**
 * Helper function to create admin action log
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: 'campaign' | 'user' | 'payment' | 'settings',
  targetId: string,
  details: Record<string, any> = {}
): Promise<string> {
  return createLog({
    eventType: LogEventType.ADMIN_ACTION,
    actorId: adminId,
    description: `Admin ${action} ${targetType} ${targetId}`,
    metadata: {
      action,
      targetType,
      targetId,
      ...details,
    },
  });
}

/**
 * Helper function to create campaign expiry log
 */
export async function logCampaignExpiry(
  campaignId: string,
  campaignName: string,
  userId: string
): Promise<string> {
  return createLog({
    eventType: LogEventType.CAMPAIGN_EXPIRY,
    actorId: 'system',
    description: `Campaign "${campaignName}" expired`,
    metadata: {
      campaignId,
      campaignName,
      userId,
    },
  });
}

/**
 * Helper function to create campaign deactivation log
 */
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

/**
 * Helper function to create campaign reactivation log
 */
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

/**
 * Helper function to create campaign extension log
 */
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

/**
 * Helper function to create campaign deletion log
 */
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

/**
 * Helper function to create user blocked log
 */
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

/**
 * Helper function to create user unblocked log
 */
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

/**
 * Helper function to create user deleted log
 */
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

/**
 * Helper function to create user admin status change log
 */
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

/**
 * Helper function to create user free campaign reset log
 */
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

/**
 * Helper function to create settings changed log
 */
export async function logSettingsChanged(
  adminId: string,
  settingType: 'system' | 'pricing',
  changes: Record<string, any>
): Promise<string> {
  return createLog({
    eventType: LogEventType.SETTINGS_CHANGED,
    actorId: adminId,
    description: `${settingType} settings changed`,
    metadata: {
      settingType,
      changes,
    },
  });
}

/**
 * Helper function to create cron execution log
 */
export async function logCronExecution(
  cronType: string,
  result: 'success' | 'failure',
  details: Record<string, any> = {}
): Promise<string> {
  return createLog({
    eventType: LogEventType.CRON_EXECUTION,
    actorId: 'system',
    description: `Cron job ${cronType} ${result}`,
    metadata: {
      cronType,
      result,
      ...details,
    },
  });
}

/**
 * Helper function to create webhook failure log
 */
export async function logWebhookFailure(
  webhookType: string,
  error: string,
  payload: any
): Promise<string> {
  return createLog({
    eventType: LogEventType.WEBHOOK_FAILURE,
    actorId: 'system',
    description: `Webhook ${webhookType} failed: ${error}`,
    metadata: {
      webhookType,
      error,
      payload,
    },
  });
}

/**
 * Helper function to create manual cron trigger log
 */
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

/**
 * Helper function to create data export log
 */
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
