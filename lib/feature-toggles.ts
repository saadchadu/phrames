/**
 * Feature toggle utilities for checking system settings
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Check if new signups are enabled
 */
export async function isSignupEnabled(): Promise<boolean> {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return data.newSignupsEnabled !== false; // Default to true if not set
    }
    
    return true; // Default to enabled
  } catch (error) {
    console.error('Error checking signup status:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Check if new campaign creation is enabled
 */
export async function isCampaignCreationEnabled(): Promise<boolean> {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return data.newCampaignsEnabled !== false; // Default to true if not set
    }
    
    return true; // Default to enabled
  } catch (error) {
    console.error('Error checking campaign creation status:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Check if free campaigns are enabled
 */
export async function isFreeCampaignEnabled(): Promise<boolean> {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return data.freeCampaignEnabled !== false; // Default to true if not set
    }
    
    return true; // Default to enabled
  } catch (error) {
    console.error('Error checking free campaign status:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Get enabled plans with their pricing
 */
export async function getEnabledPlans(): Promise<{
  plans: { [key: string]: { enabled: boolean; price: number; originalPrice?: number; discount?: number } };
  allDisabled: boolean;
  offersEnabled: boolean;
}> {
  try {
    const [settingsSnap, pricingSnap] = await Promise.all([
      getDoc(doc(db, 'settings', 'system')),
      getDoc(doc(db, 'settings', 'plans')),
    ]);
    
    const defaultPlans = {
      week: { enabled: true, price: 49 },
      month: { enabled: true, price: 99 },
      '3month': { enabled: true, price: 249 },
      '6month': { enabled: true, price: 499 },
      year: { enabled: true, price: 899 },
    };
    
    if (!settingsSnap.exists() || !pricingSnap.exists()) {
      return { plans: defaultPlans, allDisabled: false, offersEnabled: false };
    }
    
    const settings = settingsSnap.data();
    const pricing = pricingSnap.data();
    const offersEnabled = settings.offersEnabled ?? false;
    
    const plans: { [key: string]: { enabled: boolean; price: number; originalPrice?: number; discount?: number } } = {};
    const planKeys = ['week', 'month', '3month', '6month', 'year'];
    
    for (const key of planKeys) {
      const originalPrice = pricing[key] ?? defaultPlans[key as keyof typeof defaultPlans].price;
      const discount = pricing.discounts?.[key] ?? 0;
      
      let finalPrice = originalPrice;
      if (offersEnabled && discount > 0) {
        finalPrice = Math.round(originalPrice - (originalPrice * discount / 100));
      }
      
      plans[key] = {
        enabled: settings.enabledPlans?.[key] !== false,
        price: finalPrice,
        originalPrice: discount > 0 ? originalPrice : undefined,
        discount: discount > 0 ? discount : undefined,
      };
    }
    
    const allDisabled = Object.values(plans).every(p => !p.enabled);
    
    return { plans, allDisabled, offersEnabled };
  } catch (error) {
    console.error('Error getting enabled plans:', error);
    // Return defaults on error
    return {
      plans: {
        week: { enabled: true, price: 49 },
        month: { enabled: true, price: 99 },
        '3month': { enabled: true, price: 249 },
        '6month': { enabled: true, price: 499 },
        year: { enabled: true, price: 899 },
      },
      allDisabled: false,
      offersEnabled: false,
    };
  }
}
