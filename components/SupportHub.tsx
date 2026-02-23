'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  PlusIcon,
  ClockIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/toaster';
import { auth } from '@/lib/firebase';
import { useDialog } from '@/hooks/useDialog';
import AlertDialog from '@/components/ui/AlertDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Ticket {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  orderId?: string;
  campaignId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes: Array<{
    text: string;
    addedBy: string;
    addedAt: string;
  }>;
}

interface SupportHubProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

type View = 'list' | 'create' | 'detail';

export default function SupportHub({
  isOpen,
  onClose,
  userEmail,
  userName,
}: SupportHubProps) {
  const [view, setView] = useState<View>('list');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { alertState, showAlert, closeAlert, confirmState, showConfirm, closeConfirm } = useDialog();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    category: 'general',
    subject: '',
    message: '',
    orderId: '',
    campaignId: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
      setView('list');
    }
  }, [isOpen]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/support/my-tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      setTickets(data.tickets);
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      toast(`Ticket submitted! Reference: ${data.ticketId}`, 'success');

      // Reset form
      setFormData({
        name: userName || '',
        email: userEmail || '',
        category: 'general',
        subject: '',
        message: '',
        orderId: '',
        campaignId: '',
      });

      // Refresh tickets and go back to list
      await fetchTickets();
      setView('list');
    } catch (error: any) {
      toast(error.message || 'Failed to submit ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      general: 'General Question',
      payment: 'Payment Issue',
      refund: 'Refund Request',
      campaign: 'Campaign Help',
      technical: 'Technical Problem',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const handleCancelTicket = async (ticketId: string) => {
    const confirmed = await showConfirm({
      title: 'Cancel Ticket',
      message: 'Are you sure you want to cancel this ticket?',
      confirmText: 'Cancel Ticket',
      cancelText: 'Keep Ticket',
      type: 'warning',
    });

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/support/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel ticket');
      }

      toast('Ticket cancelled successfully', 'success');

      // Refresh tickets and go back to list
      await fetchTickets();
      setSelectedTicket(null);
      setView('list');
    } catch (error: any) {
      toast(error.message || 'Failed to cancel ticket', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderListView = () => (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Dialog.Title
            as="h3"
            className="text-2xl sm:text-3xl font-bold text-primary leading-tight"
          >
            Support
          </Dialog.Title>
          <p className="mt-2 text-sm sm:text-base text-primary/70">
            View your tickets or create a new one
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-primary/60 hover:text-primary transition-colors p-1"
          aria-label="Close support hub"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <button
        onClick={() => setView('create')}
        className="w-full mb-6 px-6 py-4 rounded-xl bg-secondary hover:bg-secondary/90 text-primary font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <PlusIcon className="h-5 w-5" />
        <span>Create New Ticket</span>
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="h-12 w-12 text-primary/30 mx-auto mb-4" />
          <p className="text-primary/60 font-medium mb-2">No tickets yet</p>
          <p className="text-sm text-primary/50">
            Create your first support ticket to get help
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setView('detail');
              }}
              className="p-4 border-2 border-[#00240020] rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-primary line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <p className="text-xs text-primary/50 font-mono mt-1">
                    {ticket.ticketId}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary/60">
                  {getCategoryLabel(ticket.category)}
                </span>
                <span className="text-xs text-primary/50">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderCreateView = () => (
    <>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="text-primary/60 hover:text-primary transition-colors p-1"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <Dialog.Title
              as="h3"
              className="text-2xl sm:text-3xl font-bold text-primary leading-tight"
            >
              Create Ticket
            </Dialog.Title>
            <p className="mt-1 text-sm text-primary/70">
              Tell us how we can help
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="text-primary/60 hover:text-primary transition-colors p-1"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-primary mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-[#00240020] rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm border border-[#00240020] rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-primary mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm border border-[#00240020] rounded-lg text-primary bg-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50"
          >
            <option value="general">General Question</option>
            <option value="payment">Payment Issue</option>
            <option value="refund">Refund Request</option>
            <option value="campaign">Campaign Help</option>
            <option value="technical">Technical Problem</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-primary mb-1">
              Order ID (optional)
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) =>
                setFormData({ ...formData, orderId: e.target.value })
              }
              disabled={isSubmitting}
              placeholder="order_123abc"
              className="w-full px-3 py-2 text-sm border border-[#00240020] rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary mb-1">
              Campaign ID (optional)
            </label>
            <input
              type="text"
              value={formData.campaignId}
              onChange={(e) =>
                setFormData({ ...formData, campaignId: e.target.value })
              }
              disabled={isSubmitting}
              placeholder="camp_456def"
              className="w-full px-3 py-2 text-sm border border-[#00240020] rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-primary mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="Brief description of your issue"
            className="w-full px-3 py-2 text-sm border border-[#00240020] rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-primary mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            disabled={isSubmitting}
            placeholder="Please provide details..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-[#00240020] rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-primary font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span>Submitting...</span>
            </>
          ) : (
            'Submit Ticket'
          )}
        </button>
      </form>
    </>
  );

  const renderDetailView = () => {
    if (!selectedTicket) return null;

    return (
      <>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedTicket(null);
                setView('list');
              }}
              className="text-primary/60 hover:text-primary transition-colors p-1"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <Dialog.Title
                as="h3"
                className="text-xl font-bold text-primary leading-tight"
              >
                {selectedTicket.subject}
              </Dialog.Title>
              <p className="text-xs text-primary/50 font-mono mt-1">
                {selectedTicket.ticketId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                selectedTicket.status
              )}`}
            >
              {selectedTicket.status.replace('_', ' ')}
            </span>
            <button
              onClick={onClose}
              className="text-primary/60 hover:text-primary transition-colors p-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[450px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-primary/70 font-medium">Category:</span>
              <p className="text-primary">
                {getCategoryLabel(selectedTicket.category)}
              </p>
            </div>
            <div>
              <span className="text-primary/70 font-medium">Created:</span>
              <p className="text-primary">
                {new Date(selectedTicket.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {(selectedTicket.orderId || selectedTicket.campaignId) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedTicket.orderId && (
                <div>
                  <span className="text-primary/70 font-medium">Order ID:</span>
                  <p className="text-primary font-mono text-xs">
                    {selectedTicket.orderId}
                  </p>
                </div>
              )}
              {selectedTicket.campaignId && (
                <div>
                  <span className="text-primary/70 font-medium">
                    Campaign ID:
                  </span>
                  <p className="text-primary font-mono text-xs">
                    {selectedTicket.campaignId}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-[#00240020] pt-4">
            <h4 className="font-medium text-primary mb-2">Your Message:</h4>
            <p className="text-sm text-primary/80 whitespace-pre-wrap bg-[#f2fff2] p-4 rounded-lg">
              {selectedTicket.message}
            </p>
          </div>

          {selectedTicket.notes.length > 0 && (
            <div className="border-t border-[#00240020] pt-4">
              <h4 className="font-medium text-primary mb-3">
                Support Updates:
              </h4>
              <div className="space-y-3">
                {selectedTicket.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm"
                  >
                    <p className="text-primary">{note.text}</p>
                    <p className="text-xs text-primary/50 mt-2">
                      Support Team •{' '}
                      {new Date(note.addedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancel Button - Only show for open or in_progress tickets */}
          {(selectedTicket.status === 'open' ||
            selectedTicket.status === 'in_progress') && (
            <div className="border-t border-[#00240020] pt-4">
              <button
                onClick={() => handleCancelTicket(selectedTicket.ticketId)}
                disabled={isCancelling}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XMarkIcon className="h-5 w-5" />
                    <span>Cancel Ticket</span>
                  </>
                )}
              </button>
              <p className="text-xs text-primary/50 text-center mt-2">
                This will close your ticket and mark it as cancelled
              </p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left align-middle shadow-xl transition-all">
                {view === 'list' && renderListView()}
                {view === 'create' && renderCreateView()}
                {view === 'detail' && renderDetailView()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

    {/* Dialogs */}
    <AlertDialog
      isOpen={alertState.isOpen}
      onClose={closeAlert}
      title={alertState.title}
      message={alertState.message}
      type={alertState.type}
    />
    <ConfirmDialog
      isOpen={confirmState.isOpen}
      onClose={closeConfirm}
      onConfirm={confirmState.onConfirm || (() => {})}
      title={confirmState.title}
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      type={confirmState.type}
    />
    </>
  );
}
