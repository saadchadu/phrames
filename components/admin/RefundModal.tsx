'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  amount: number;
  isLoading?: boolean;
}

export default function RefundModal({
  isOpen,
  onClose,
  onConfirm,
  amount,
  isLoading = false,
}: RefundModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(''); // Reset for next time
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
            aria-label="Close refund modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="pr-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Process Refund
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                You are about to refund <span className="font-semibold text-gray-900">₹{amount.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-sm text-red-600 font-medium">
                This will deactivate the associated campaign.
              </p>
            </div>

            {/* Reason Input */}
            <div className="mb-6">
              <label htmlFor="refund-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Refund Reason (Optional)
              </label>
              <textarea
                id="refund-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Customer requested refund, Technical issue, etc."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
