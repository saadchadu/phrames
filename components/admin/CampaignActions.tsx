'use client';

import { useState } from 'react';
import { ExternalLink, Calendar, Trash2, Play, Pause, User } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { toast } from '@/components/ui/toaster';

interface Campaign {
  id: string;
  campaignName: string;
  slug: string;
  createdBy: string;
  isActive: boolean;
  isFreeCampaign: boolean;
  planType?: string;
  amountPaid?: number;
  createdAt: string;
  expiresAt?: string;
  isExpired?: boolean;
}

interface CampaignActionsProps {
  campaign: Campaign;
  onActionComplete: () => void;
}

export default function CampaignActions({ campaign, onActionComplete }: CampaignActionsProps) {
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [extendDays, setExtendDays] = useState<number>(30);
  const [customDate, setCustomDate] = useState<string>('');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAction(action: string, data?: any) {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          action,
          adminId: 'system',
          ...data,
        }),
      });

      if (res.ok) {
        toast('Campaign updated successfully', 'success');
        onActionComplete();
        // Close modals
        setShowExtendModal(false);
        setShowDeactivateModal(false);
        setShowReactivateModal(false);
      } else {
        const error = await res.json();
        toast(error.error || 'Failed to perform action', 'error');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast('Failed to perform action', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/campaigns?campaignId=${campaign.id}&adminId=admin`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast('Campaign deleted successfully', 'success');
        onActionComplete();
        setShowDeleteModal(false);
      } else {
        const error = await res.json();
        toast(error.error || 'Failed to delete campaign', 'error');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast('Failed to delete campaign', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleExtendSubmit() {
    if (useCustomDate && customDate) {
      handleAction('setExpiry', { expiresAt: customDate });
    } else {
      handleAction('extend', { days: extendDays });
    }
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Activate/Deactivate Button */}
        {campaign.isActive ? (
          <button
            onClick={() => setShowDeactivateModal(true)}
            className="text-orange-600 hover:text-orange-900 transition-colors"
            title="Deactivate campaign"
            aria-label="Deactivate campaign"
          >
            <Pause className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowReactivateModal(true)}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Reactivate campaign"
            aria-label="Reactivate campaign"
          >
            <Play className="h-4 w-4" />
          </button>
        )}

        {/* Extend Expiry Button */}
        <button
          onClick={() => setShowExtendModal(true)}
          className="text-blue-600 hover:text-blue-900 transition-colors"
          title="Extend expiry date"
          aria-label="Extend expiry date"
        >
          <Calendar className="h-4 w-4" />
        </button>

        {/* View Campaign Link */}
        <a
          href={`/campaign/${campaign.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          title="View campaign page"
          aria-label="View campaign page"
        >
          <ExternalLink className="h-4 w-4" />
        </a>

        {/* View User Link */}
        <a
          href={`/user/${campaign.createdBy}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-900 transition-colors"
          title="View user profile"
          aria-label="View user profile"
        >
          <User className="h-4 w-4" />
        </a>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:text-red-900 transition-colors"
          title="Delete campaign"
          aria-label="Delete campaign"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Extend Expiry Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Extend Campaign Expiry
            </h3>
            
            <div className="space-y-4">
              {/* Quick Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Extend Options
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setUseCustomDate(false);
                      setExtendDays(7);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !useCustomDate && extendDays === 7
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    +7 Days
                  </button>
                  <button
                    onClick={() => {
                      setUseCustomDate(false);
                      setExtendDays(30);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !useCustomDate && extendDays === 30
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    +30 Days
                  </button>
                  <button
                    onClick={() => {
                      setUseCustomDate(false);
                      setExtendDays(90);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !useCustomDate && extendDays === 90
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    +90 Days
                  </button>
                </div>
              </div>

              {/* Custom Date Option */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={useCustomDate}
                    onChange={(e) => setUseCustomDate(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Set Custom Expiry Date</span>
                </label>
                {useCustomDate && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Current Expiry Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  Current expiry: {campaign.expiresAt 
                    ? new Date(campaign.expiresAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Never'}
                </p>
                {!useCustomDate && (
                  <p className="text-xs text-gray-600 mt-1">
                    New expiry: {campaign.expiresAt 
                      ? new Date(new Date(campaign.expiresAt).getTime() + extendDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : `${extendDays} days from now`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExtendModal(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendSubmit}
                disabled={loading || (useCustomDate && !customDate)}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Extending...' : 'Extend Expiry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={() => handleAction('deactivate')}
        title="Deactivate Campaign"
        message={`Are you sure you want to deactivate "${campaign.campaignName}"? The campaign will no longer be visible to users.`}
        confirmText="Deactivate"
        isDestructive={true}
        isLoading={loading}
      />

      {/* Reactivate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        onConfirm={() => handleAction('reactivate')}
        title="Reactivate Campaign"
        message={`Are you sure you want to reactivate "${campaign.campaignName}"? The campaign will become visible to users again.`}
        confirmText="Reactivate"
        isDestructive={false}
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to permanently delete "${campaign.campaignName}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={loading}
      />
    </>
  );
}
