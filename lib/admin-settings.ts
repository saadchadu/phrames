import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * System settings interface
 */
export interface SystemSettings {
  freeCampaignEnabled: boolean;
  newCampaignsEnabled: boolean;
  newSignupsEnabled: boolean;
  enabledPlans: {
    week: boolean;
    month: boolean;
    '3month': boolean;
    '6month': boolean;
    year: boolean;
  };
  updatedAt?: Timestamp;
  updatedBy?: string;
}

/**
 * Plan pricing interface
 */
export interface PlanPricing {
  week: number;
  month: number;
  '3month': number;
  '6month': number;
  year: number;
  currency: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

/**
 * Default system settings
 */
const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  freeCampaignEnabled: true,
  newCampaignsEnabled: true,
  newSignupsEnabled: true,
  enabledPlans: {
    week: true,
    month: true,
    '3month': true,
    '6month': true,
    year: true,
  },
};

/**
 * Default plan pricing (in INR)
 */
const DEFAULT_PLAN_PRICING: PlanPricing = {
  week: 99,
  month: 299,
  '3month': 799,
  '6month': 1499,
  year: 2499,
  currency: 'INR',
};

/**
 * Get system settings from Firestore
 * Returns default settings if not found
 * 
 * @returns Promise with system settings
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data() as SystemSettings;
    }

    // Return default settings if not found
    return DEFAULT_SYSTEM_SETTINGS;
  } catch (error) {
    console.error('Error getting system settings:', error);
    throw new Error('Failed to retrieve system settings');
  }
}

/**
 * Update system settings in Firestore
 * 
 * @param settings - Partial system settings to update
 * @param adminId - ID of the admin making the change
 * @returns Promise that resolves when settings are updated
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>,
  adminId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    
    const updateData = {
      ...settings,
      updatedAt: Timestamp.now(),
      updatedBy: adminId,
    };

    await setDoc(settingsRef, updateData, { merge: true });
    console.log('System settings updated by admin:', adminId);
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw new Error('Failed to update system settings');
  }
}

/**
 * Get plan pricing from Firestore
 * Returns default pricing if not found
 * 
 * @returns Promise with plan pricing
 */
export async function getPlanPricing(): Promise<PlanPricing> {
  try {
    const pricingRef = doc(db, 'settings', 'plans');
    const pricingSnap = await getDoc(pricingRef);

    if (pricingSnap.exists()) {
      return pricingSnap.data() as PlanPricing;
    }

    // Return default pricing if not found
    return DEFAULT_PLAN_PRICING;
  } catch (error) {
    console.error('Error getting plan pricing:', error);
    throw new Error('Failed to retrieve plan pricing');
  }
}

/**
 * Update plan pricing in Firestore
 * 
 * @param pricing - Partial plan pricing to update
 * @param adminId - ID of the admin making the change
 * @returns Promise that resolves when pricing is updated
 */
export async function updatePlanPricing(
  pricing: Partial<PlanPricing>,
  adminId: string
): Promise<void> {
  try {
    // Validate pricing values
    const pricingKeys = ['week', 'month', '3month', '6month', 'year'] as const;
    for (const key of pricingKeys) {
      if (pricing[key] !== undefined) {
        if (typeof pricing[key] !== 'number' || pricing[key]! < 0) {
          throw new Error(`Invalid pricing value for ${key}: must be a positive number`);
        }
      }
    }

    const pricingRef = doc(db, 'settings', 'plans');
    
    const updateData = {
      ...pricing,
      updatedAt: Timestamp.now(),
      updatedBy: adminId,
    };

    await setDoc(pricingRef, updateData, { merge: true });
    console.log('Plan pricing updated by admin:', adminId);
  } catch (error) {
    console.error('Error updating plan pricing:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update plan pricing');
  }
}

/**
 * Initialize default settings in Firestore if they don't exist
 * Call this during app initialization or admin setup
 * 
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeDefaultSettings(): Promise<void> {
  try {
    // Initialize system settings
    const systemRef = doc(db, 'settings', 'system');
    const systemSnap = await getDoc(systemRef);

    if (!systemSnap.exists()) {
      await setDoc(systemRef, {
        ...DEFAULT_SYSTEM_SETTINGS,
        updatedAt: Timestamp.now(),
        updatedBy: 'system',
      });
      console.log('Default system settings initialized');
    }

    // Initialize plan pricing
    const pricingRef = doc(db, 'settings', 'plans');
    const pricingSnap = await getDoc(pricingRef);

    if (!pricingSnap.exists()) {
      await setDoc(pricingRef, {
        ...DEFAULT_PLAN_PRICING,
        updatedAt: Timestamp.now(),
        updatedBy: 'system',
      });
      console.log('Default plan pricing initialized');
    }
  } catch (error) {
    console.error('Error initializing default settings:', error);
    throw new Error('Failed to initialize default settings');
  }
}

/**
 * Check if a specific feature is enabled
 * 
 * @param feature - Feature name to check
 * @returns Promise with boolean indicating if feature is enabled
 */
export async function isFeatureEnabled(
  feature: keyof Omit<SystemSettings, 'enabledPlans' | 'updatedAt' | 'updatedBy'>
): Promise<boolean> {
  try {
    const settings = await getSystemSettings();
    return settings[feature] === true;
  } catch (error) {
    console.error('Error checking feature status:', error);
    // Default to enabled if there's an error
    return true;
  }
}

/**
 * Check if a specific plan is enabled
 * 
 * @param plan - Plan type to check
 * @returns Promise with boolean indicating if plan is enabled
 */
export async function isPlanEnabled(
  plan: keyof SystemSettings['enabledPlans']
): Promise<boolean> {
  try {
    const settings = await getSystemSettings();
    return settings.enabledPlans[plan] === true;
  } catch (error) {
    console.error('Error checking plan status:', error);
    // Default to enabled if there's an error
    return true;
  }
}

/**
 * Get price for a specific plan
 * 
 * @param plan - Plan type
 * @returns Promise with plan price
 */
export async function getPlanPrice(
  plan: keyof Omit<PlanPricing, 'currency' | 'updatedAt' | 'updatedBy'>
): Promise<number> {
  try {
    const pricing = await getPlanPricing();
    return pricing[plan];
  } catch (error) {
    console.error('Error getting plan price:', error);
    // Return default price if there's an error
    return DEFAULT_PLAN_PRICING[plan];
  }
}

/**
 * Get all enabled plans with their prices
 * 
 * @returns Promise with object containing enabled plans and their prices
 */
export async function getEnabledPlansWithPrices(): Promise<{
  [key: string]: { enabled: boolean; price: number };
}> {
  try {
    const [settings, pricing] = await Promise.all([
      getSystemSettings(),
      getPlanPricing(),
    ]);

    const plans: { [key: string]: { enabled: boolean; price: number } } = {};
    const planKeys = ['week', 'month', '3month', '6month', 'year'] as const;

    for (const key of planKeys) {
      plans[key] = {
        enabled: settings.enabledPlans[key],
        price: pricing[key],
      };
    }

    return plans;
  } catch (error) {
    console.error('Error getting enabled plans with prices:', error);
    throw new Error('Failed to retrieve enabled plans with prices');
  }
}
