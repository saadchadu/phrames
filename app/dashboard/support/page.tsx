'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/toaster';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

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

export default function MyTicketsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const token = await currentUser.getIdToken();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f2fff233]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-primary/70 hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary leading-tight">
              My Support Tickets
            </h1>
            <p className="text-primary/70 text-sm sm:text-base font-normal leading-normal mt-2">
              Track and view your support requests
            </p>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 sm:gap-6 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f2fff2] rounded-full flex items-center justify-center">
                <ClockIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-primary/60 text-xl sm:text-2xl font-bold leading-tight text-center">
                  No tickets yet
                </h3>
                <p className="text-primary/50 text-sm sm:text-base font-normal leading-normal text-center max-w-md px-4">
                  When you contact support, your tickets will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tickets List */}
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedTicket?.id === ticket.id
                        ? 'border-secondary bg-secondary/5 shadow-md'
                        : 'border-[#00240020] hover:border-[#00240040]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-primary/50">
                            {ticket.ticketId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-primary text-lg">
                          {ticket.subject}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary/60 mb-2">
                      <span className="px-2 py-1 bg-[#f2fff2] rounded-md text-xs font-medium">
                        {getCategoryLabel(ticket.category)}
                      </span>
                    </div>
                    <p className="text-xs text-primary/50">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ticket Details */}
              {selectedTicket ? (
                <div className="border-2 border-[#00240020] rounded-xl p-6 sticky top-8 h-fit bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-primary">
                        {selectedTicket.subject}
                      </h2>
                      <p className="text-sm text-primary/50 font-mono mt-1">
                        {selectedTicket.ticketId}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-primary/70">
                        Category:
                      </span>
                      <p className="text-sm text-primary">
                        {getCategoryLabel(selectedTicket.category)}
                      </p>
                    </div>

                    {selectedTicket.orderId && (
                      <div>
                        <span className="text-sm font-medium text-primary/70">
                          Order ID:
                        </span>
                        <p className="text-sm text-primary font-mono">
                          {selectedTicket.orderId}
                        </p>
                      </div>
                    )}

                    {selectedTicket.campaignId && (
                      <div>
                        <span className="text-sm font-medium text-primary/70">
                          Campaign ID:
                        </span>
                        <p className="text-sm text-primary font-mono">
                          {selectedTicket.campaignId}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-sm font-medium text-primary/70">
                        Created:
                      </span>
                      <p className="text-sm text-primary">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#00240020] pt-4 mb-4">
                    <h3 className="font-medium text-primary mb-2">Message:</h3>
                    <p className="text-sm text-primary/80 whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                  </div>

                  {selectedTicket.notes.length > 0 && (
                    <div className="border-t border-[#00240020] pt-4">
                      <h3 className="font-medium text-primary mb-3">
                        Updates from Support:
                      </h3>
                      <div className="space-y-3">
                        {selectedTicket.notes.map((note, idx) => (
                          <div
                            key={idx}
                            className="bg-[#f2fff2] p-4 rounded-xl text-sm"
                          >
                            <p className="text-primary">{note.text}</p>
                            <p className="text-xs text-primary/50 mt-2">
                              {note.addedBy} •{' '}
                              {new Date(note.addedAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-[#00240020] rounded-xl p-12 text-center">
                  <p className="text-primary/50">
                    Select a ticket to view details
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
