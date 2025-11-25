'use client';

import { useState } from 'react';
import { ExternalLink, Trash2, Shield, RefreshCw, Ban, CheckCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface User {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  totalCampaigns: number;
  freeCampaignUsed?: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  createdAt: string;
}

interface UserActionsProps {
  user: User;
  onActionComplete: () => void;
}

export default function UserActions({ user, onActionComplete }: UserActionsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSetAdminModal, setShowSetAdminModal] = useState(false);
  const [showResetFreeCampaignModal, setShowResetFreeCampaignModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAction(action: string, data?: any) {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action,
          adminId: 'admin', // TODO: Get from auth context
          ...data,
        }),
      });

      if (res.ok) {
        onActionComplete();
        // Close modals
        setShowSetAdminModal(false);
        setShowResetFreeCampaignModal(false);
        setShowBlockModal(false);
        setShowUnblockModal(false);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to perform action'}`);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?userId=${user.id}&adminId=admin`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onActionComplete();
        setShowDeleteModal(false);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to delete user'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setLoading(false);
    }
  }

  function handleSetAdmin() {
    handleAction('setAdmin', { isAdmin: !user.isAdmin });
  }

  function handleResetFreeCampaign() {
    handleAction('resetFreeCampaign');
  }

  function handleBlock() {
    handleAction('block', { reason: 'Blocked by admin' });
  }

  function handleUnblock() {
    handleAction('unblock');
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Set Admin Toggle */}
        <button
          onClick={() => setShowSetAdminModal(true)}
          className={`transition-colors ${
            user.isAdmin
              ? 'text-purple-600 hover:text-purple-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title={user.isAdmin ? 'Remove admin privileges' : 'Grant admin privileges'}
          aria-label={user.isAdmin ? 'Remove admin privileges' : 'Grant admin privileges'}
        >
          <Shield className="h-4 w-4" />
        </button>

        {/* Reset Free Campaign Button */}
        <button
          onClick={() => setShowResetFreeCampaignModal(true)}
          disabled={!user.freeCampaignUsed}
          className={`transition-colors ${
            user.freeCampaignUsed
              ? 'text-blue-600 hover:text-blue-900'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Reset free campaign"
          aria-label="Reset free campaign"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Block/Unblock Button */}
        {user.isBlocked ? (
          <button
            onClick={() => setShowUnblockModal(true)}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Unblock user"
            aria-label="Unblock user"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowBlockModal(true)}
            className="text-orange-600 hover:text-orange-900 transition-colors"
            title="Block user"
            aria-label="Block user"
          >
            <Ban className="h-4 w-4" />
          </button>
        )}

        {/* View User Campaigns Link */}
        <a
          href={`/admin/campaigns?userId=${user.id}`}
          className="text-purple-600 hover:text-purple-900 transition-colors"
          title="View user campaigns"
          aria-label="View user campaigns"
        >
          <ExternalLink className="h-4 w-4" />
        </a>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:text-red-900 transition-colors"
          title="Delete user"
          aria-label="Delete user"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Set Admin Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSetAdminModal}
        onClose={() => setShowSetAdminModal(false)}
        onConfirm={handleSetAdmin}
        title={user.isAdmin ? 'Remove Admin Privileges' : 'Grant Admin Privileges'}
        message={
          user.isAdmin
            ? `Are you sure you want to remove admin privileges from "${user.displayName || user.email}"? They will no longer have access to the admin dashboard.`
            : `Are you sure you want to grant admin privileges to "${user.displayName || user.email}"? They will have full access to the admin dashboard.`
        }
        confirmText={user.isAdmin ? 'Remove Admin' : 'Grant Admin'}
        isDestructive={user.isAdmin}
        isLoading={loading}
      />

      {/* Reset Free Campaign Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetFreeCampaignModal}
        onClose={() => setShowResetFreeCampaignModal(false)}
        onConfirm={handleResetFreeCampaign}
        title="Reset Free Campaign"
        message={`Are you sure you want to reset the free campaign for "${user.displayName || user.email}"? They will be able to create another free campaign.`}
        confirmText="Reset Free Campaign"
        isDestructive={false}
        isLoading={loading}
      />

      {/* Block User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
        title="Block User"
        message={`Are you sure you want to block "${user.displayName || user.email}"? They will not be able to create or activate campaigns.`}
        confirmText="Block User"
        isDestructive={true}
        isLoading={loading}
      />

      {/* Unblock User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showUnblockModal}
        onClose={() => setShowUnblockModal(false)}
        onConfirm={handleUnblock}
        title="Unblock User"
        message={`Are you sure you want to unblock "${user.displayName || user.email}"? They will be able to create and activate campaigns again.`}
        confirmText="Unblock User"
        isDestructive={false}
        isLoading={loading}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${user.displayName || user.email}"? This will delete their account and all associated data. This action cannot be undone.`}
        confirmText="Delete User"
        isDestructive={true}
        isLoading={loading}
      />
    </>
  );
}
