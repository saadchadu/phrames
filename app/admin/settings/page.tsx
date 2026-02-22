'use client';

import { useState, useEffect } from 'react';
import { Download, Play } from 'lucide-react';
import PricingEditor from '@/components/admin/PricingEditor';
import SupportersManager from '@/components/admin/SupportersManager';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import LoadingState from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/settings');

      if (!res.ok) {
        throw new Error(`Failed to fetch settings: ${res.statusText}`);
      }

      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(type: string, data: any) {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, adminId: 'admin', ...data }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully' });
        await fetchSettings();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handlePricingSave(pricing: any) {
    await handleSave('plans', pricing);
  }

  async function handleAction(action: string) {
    try {
      setActionLoading(action);
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminId: 'admin' }),
      });

      if (!res.ok) {
        throw new Error('Action failed');
      }

      if (action.startsWith('export')) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${action}-${Date.now()}.csv`;
        a.click();
        setMessage({ type: 'success', text: 'Export completed successfully' });
      } else {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message || 'Action completed successfully' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Action failed' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  if (loading) {
    return (
      <PageHeader
        title="Settings"
        description="Configure system settings, pricing, and perform manual actions"
      >
        <LoadingState text="Loading settings..." />
      </PageHeader>
    );
  }

  return (
    <AdminErrorBoundary>
      <PageHeader
        title="Settings"
        description="Configure system settings, pricing, and perform manual actions"
      >

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} onRetry={fetchSettings} />
          </div>
        )}

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* System Settings */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.system?.freeCampaignEnabled ?? true}
                  onChange={(e) => handleSave('system', { freeCampaignEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  disabled={saving}
                />
                <span className="ml-2 text-sm text-gray-700">Enable Free First Campaign</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.system?.newCampaignsEnabled ?? true}
                  onChange={(e) => handleSave('system', { newCampaignsEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  disabled={saving}
                />
                <span className="ml-2 text-sm text-gray-700">Enable New Campaign Creation</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.system?.newSignupsEnabled ?? true}
                  onChange={(e) => handleSave('system', { newSignupsEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  disabled={saving}
                />
                <span className="ml-2 text-sm text-gray-700">Enable New User Signups</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.system?.offersEnabled ?? false}
                  onChange={(e) => handleSave('system', { offersEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  disabled={saving}
                />
                <span className="ml-2 text-sm text-gray-700">Enable Special Offers/Discounts</span>
              </label>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Billing Tax (GST) Percentage</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings?.system?.gstPercentage !== undefined ? settings?.system?.gstPercentage : 0}
                    onChange={(e) => handleSave('system', { gstPercentage: Number(e.target.value) })}
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Pricing */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Plan Pricing (INR)</h2>
            {settings?.plans && (
              <PricingEditor
                initialPricing={settings.plans}
                onSave={handlePricingSave}
                saving={saving}
              />
            )}
          </div>

          {/* Manual Actions */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Manual Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => handleAction('triggerExpiryCron')}
                disabled={actionLoading !== null}
                className="flex items-center justify-center px-4 py-2.5 sm:py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {actionLoading === 'triggerExpiryCron' ? 'Running...' : 'Run Expiry Check'}
              </button>
              <button
                onClick={() => handleAction('fixStuckCampaigns')}
                disabled={actionLoading !== null}
                className="flex items-center justify-center px-4 py-2.5 sm:py-3 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {actionLoading === 'fixStuckCampaigns' ? 'Fixing...' : 'Fix Stuck Campaigns'}
              </button>
              <button
                onClick={() => handleAction('exportPayments')}
                disabled={actionLoading !== null}
                className="flex items-center justify-center px-4 py-2.5 sm:py-3 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {actionLoading === 'exportPayments' ? 'Exporting...' : 'Export Payments'}
              </button>
              <button
                onClick={() => handleAction('exportCampaigns')}
                disabled={actionLoading !== null}
                className="flex items-center justify-center px-4 py-2.5 sm:py-3 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {actionLoading === 'exportCampaigns' ? 'Exporting...' : 'Export Campaigns'}
              </button>
            </div>
          </div>

          {/* Supporters Management */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Supporters Management</h2>
            <p className="text-sm text-gray-600 mb-4">
              Fix supporter counts that may be stuck at 0 due to payment processing issues.
            </p>
            <SupportersManager />
          </div>
        </div>
      </PageHeader>
    </AdminErrorBoundary>
  );
}
