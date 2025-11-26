'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/toaster';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export default function SupportModal({
  isOpen,
  onClose,
  userEmail,
  userName,
}: SupportModalProps) {
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    category: 'general',
    subject: '',
    message: '',
    orderId: '',
    campaignId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      onClose();
    } catch (error: any) {
      toast(error.message || 'Failed to submit ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl sm:text-3xl font-bold text-primary leading-tight"
                    >
                      Contact Support
                    </Dialog.Title>
                    <p className="mt-2 text-sm sm:text-base text-primary/70">
                      Need help? Submit a ticket and we'll get back to you soon.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="text-primary/60 hover:text-primary transition-colors p-1"
                    aria-label="Close support modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
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
                        className="w-full px-4 py-3 border border-[#00240020] rounded-xl text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
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
                        className="w-full px-4 py-3 border border-[#00240020] rounded-xl text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-[#00240020] rounded-xl text-primary bg-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23002400' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="general">General Question</option>
                      <option value="payment">Payment Issue</option>
                      <option value="refund">Refund Request</option>
                      <option value="campaign">Campaign Help</option>
                      <option value="technical">Technical Problem</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Order ID and Campaign ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Order ID (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.orderId}
                        onChange={(e) =>
                          setFormData({ ...formData, orderId: e.target.value })
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., order_123abc"
                        className="w-full px-4 py-3 border border-[#00240020] rounded-xl text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Campaign ID (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.campaignId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            campaignId: e.target.value,
                          })
                        }
                        disabled={isSubmitting}
                        placeholder="e.g., camp_456def"
                        className="w-full px-4 py-3 border border-[#00240020] rounded-xl text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
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
                      className="w-full px-4 py-3 border border-[#00240020] rounded-xl text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      disabled={isSubmitting}
                      placeholder="Please provide details about your issue..."
                      rows={5}
                      className="w-full px-4 py-3 border border-[#00240020] rounded-xl text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 rounded-xl border border-[#00240020] text-primary hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/90 text-primary font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
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
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
