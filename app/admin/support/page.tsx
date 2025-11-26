'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/toaster';
import { Trash2, RefreshCw } from 'lucide-react';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

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

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [note, setNote] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter]);

  const fetchTickets = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/admin/support?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      setTickets(data.tickets);
      if (isRefresh) {
        toast('Tickets refreshed', 'success');
      }
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId, status }),
      });

      if (!response.ok) throw new Error('Failed to update ticket');

      toast('Ticket updated', 'success');
      fetchTickets();
      if (selectedTicket?.ticketId === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error: any) {
      toast(error.message, 'error');
    }
  };

  const handleDeleteClick = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;

    setIsDeleting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/support', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: ticketToDelete }),
      });

      if (!response.ok) throw new Error('Failed to delete ticket');

      toast('Ticket deleted', 'success');
      setSelectedTicket(null);
      setShowDeleteModal(false);
      setTicketToDelete(null);
      fetchTickets();
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const addNote = async () => {
    if (!selectedTicket || !note.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: selectedTicket.ticketId, note }),
      });

      if (!response.ok) throw new Error('Failed to add note');

      toast('Note added', 'success');
      setNote('');
      fetchTickets();
    } catch (error: any) {
      toast(error.message, 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTicketToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmText="Delete Ticket"
        isLoading={isDeleting}
      />

      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Support Tickets</h1>
              <p className="mt-2 text-sm text-gray-600">Manage and respond to user support requests</p>
            </div>
            <button
              onClick={() => fetchTickets(true)}
              disabled={isRefreshing}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-gray-700 w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 bg-white font-medium"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-gray-700 w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 bg-white font-medium"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="campaign">Campaign</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`space-y-3 ${selectedTicket ? 'hidden lg:block' : ''}`}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id 
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{ticket.ticketId}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{ticket.subject}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      {ticket.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    {ticket.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ticket.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(ticket.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 font-medium">No tickets found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {selectedTicket ? (
              <div className="border border-gray-200 rounded-lg p-6 lg:sticky lg:top-4 h-fit bg-white shadow-sm">
                {/* Mobile back button */}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="lg:hidden mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  ← Back to tickets
                </button>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedTicket.subject}</h2>
                    <p className="text-sm text-gray-500 font-mono">{selectedTicket.ticketId}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.ticketId, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleDeleteClick(selectedTicket.ticketId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete ticket"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">From</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedTicket.name}</p>
                    <p className="text-xs text-gray-600">{selectedTicket.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Category</span>
                    <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedTicket.category}</p>
                  </div>
                  {selectedTicket.orderId && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">Order ID</span>
                      <p className="text-sm font-mono text-gray-900 mt-1">{selectedTicket.orderId}</p>
                    </div>
                  )}
                  {selectedTicket.campaignId && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">Campaign ID</span>
                      <p className="text-sm font-mono text-gray-900 mt-1">{selectedTicket.campaignId}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                  </div>
                </div>

                {selectedTicket.notes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Support Notes</h3>
                    <div className="space-y-3">
                      {selectedTicket.notes.map((note, idx) => (
                        <div key={idx} className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                          <p className="text-sm text-gray-900">{note.text}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {note.addedBy} • {new Date(note.addedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Add Note</h3>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add internal note visible to user..."
                    rows={4}
                    className="text-gray-700 w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  />
                  <button
                    onClick={addNote}
                    disabled={!note.trim()}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50">
                <p className="text-gray-400 text-center">
                  Select a ticket to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
