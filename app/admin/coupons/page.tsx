'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Check, X, AlertCircle, Edit2, Activity, Eye, Trash2 } from 'lucide-react';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';
import PageHeader from '@/components/admin/PageHeader';
import { useAuth } from '@/components/AuthProvider';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import AlertDialog from '@/components/ui/AlertDialog';

interface Coupon {
    code: string;
    type: 'flat' | 'percent';
    value: number;
    applicablePlans: string[];
    minAmount: number;
    usageLimit: number;
    usedCount: number;
    perUserLimit: number;
    validFrom: string | null;
    validUntil: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function AdminCouponsPage() {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewingRedemptions, setViewingRedemptions] = useState<{ code: string, data: any[], loading: boolean } | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; code: string; isDeleting: boolean }>({ isOpen: false, code: '', isDeleting: false });
    const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'success' });

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        type: 'flat' as 'flat' | 'percent',
        value: '',
        applicablePlans: [] as string[],
        usageLimit: '',
        perUserLimit: '1',
        validFrom: '',
        validUntil: '',
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            if (data.success) {
                setCoupons(data.coupons);
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleToggleActive = async (code: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/coupons/${code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            fetchCoupons();
        } catch (err: any) {
            setAlertDialog({ isOpen: true, title: 'Error', message: err.message || 'Failed to update coupon status', type: 'error' });
        }
    };

    const handleDelete = async () => {
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));
        try {
            const res = await fetch(`/api/admin/coupons/${deleteModal.code}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete coupon');
            setDeleteModal({ isOpen: false, code: '', isDeleting: false });
            fetchCoupons();
            setAlertDialog({ isOpen: true, title: 'Success', message: 'Coupon deleted successfully', type: 'success' });
        } catch (err: any) {
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            setAlertDialog({ isOpen: true, title: 'Error', message: err.message || 'Failed to delete coupon', type: 'error' });
        }
    };

    const handleViewUsages = async (code: string) => {
        setViewingRedemptions({ code, data: [], loading: true });
        try {
            const res = await fetch(`/api/admin/coupons/${code}/redemptions`);
            const data = await res.json();
            if (data.success) {
                setViewingRedemptions({ code, data: data.redemptions, loading: false });
            } else {
                throw new Error(data.error || 'Failed to fetch usages');
            }
        } catch (err: any) {
            setAlertDialog({ isOpen: true, title: 'Error', message: err.message || 'Failed to fetch coupon usages', type: 'error' });
            setViewingRedemptions(null);
        }
    };

    const handleEditClick = (coupon: Coupon) => {
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            applicablePlans: coupon.applicablePlans || [],
            usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
            perUserLimit: coupon.perUserLimit ? coupon.perUserLimit.toString() : '1',
            validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
            validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
            isActive: coupon.isActive
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (formData.type === 'percent' && Number(formData.value) > 100) {
                throw new Error('Percentage discount cannot exceed 100%');
            }

            const url = isEditing ? `/api/admin/coupons/${formData.code.toUpperCase()}` : '/api/admin/coupons';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await user?.getIdToken()}`
                },
                body: JSON.stringify({
                    ...formData,
                    code: formData.code.toUpperCase(),
                    value: Number(formData.value),
                    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
                    perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : 0
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} coupon`);
            }

            setIsModalOpen(false);
            setIsEditing(false);
            setFormData({
                code: '', type: 'flat', value: '', applicablePlans: [], usageLimit: '', perUserLimit: '1', validFrom: '', validUntil: '', isActive: true
            });
            fetchCoupons();
            setAlertDialog({ isOpen: true, title: 'Success', message: `Coupon ${isEditing ? 'updated' : 'created'} successfully`, type: 'success' });
        } catch (err: any) {
            setAlertDialog({ isOpen: true, title: 'Error', message: err.message || `Failed to ${isEditing ? 'update' : 'create'} coupon`, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Stats
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.isActive).length;
    const totalRedemptions = coupons.reduce((acc, curr) => acc + curr.usedCount, 0);

    return (
        <AdminErrorBoundary>
            <PageHeader
                title="Coupons"
                description="Manage discount codes and promotional offers."
            >
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({ code: '', type: 'flat', value: '', applicablePlans: [], usageLimit: '', perUserLimit: '1', validFrom: '', validUntil: '', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Create Coupon
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Total Coupons</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totalCoupons}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Active Coupons</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCoupons}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Total Redemptions</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{totalRedemptions}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12 mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mt-6">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                ) : (
                    <div className="bg-white overflow-hidden border border-gray-200 rounded-xl shadow-sm mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.code} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono font-bold text-gray-900 bg-gray-100/80 border border-gray-200/60 px-2.5 py-1 rounded-lg select-text cursor-text inline-block tracking-wide">{coupon.code}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-emerald-600">
                                                {coupon.type === 'flat' ? `₹${coupon.value}` : `${coupon.value}% OFF`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {coupon.usedCount} <span className="text-gray-400">/ {coupon.usageLimit || '∞'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {coupon.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(coupon)}
                                                        title="Edit"
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(coupon.code, coupon.isActive)}
                                                        title={coupon.isActive ? 'Disable' : 'Enable'}
                                                        className={`p-1.5 rounded-md transition-colors ${coupon.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                    >
                                                        <Activity className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewUsages(coupon.code)}
                                                        title="View Uses"
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, code: coupon.code, isDeleting: false })}
                                                        title="Delete"
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {coupons.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No coupons created yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal Backdrop */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isEditing}
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 uppercase font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
                                        placeholder="e.g. SUMMER50"
                                        maxLength={15}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as 'flat' | 'percent' })}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        >
                                            <option value="flat">Flat (₹)</option>
                                            <option value="percent">Percent (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Value {formData.type === 'percent' ? '(%)' : '(₹)'}</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max={formData.type === 'percent' ? 100 : undefined}
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            placeholder={formData.type === 'percent' ? '50' : '100'}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Plans <span className="text-gray-400 font-normal">(empty = all plans)</span></label>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {['week', 'month', '3month', '6month', 'year'].map(plan => (
                                            <label key={plan} className="flex items-center gap-3 cursor-pointer p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicablePlans.includes(plan)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            applicablePlans: checked
                                                                ? [...prev.applicablePlans, plan]
                                                                : prev.applicablePlans.filter(p => p !== plan)
                                                        }));
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {plan === 'week' ? '1 Week' : plan === 'month' ? '1 Month' : plan === '3month' ? '3 Months' : plan === '6month' ? '6 Months' : '1 Year'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit <span className="text-gray-400 font-normal">(optional, empty = unlimited)</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usageLimit}
                                        onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="e.g. 100 uses"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                                        <input
                                            type="date"
                                            value={formData.validFrom}
                                            onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={formData.validUntil}
                                            onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2 text-gray-600 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2 text-white font-medium bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Coupon')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Usages Modal */}
                {viewingRedemptions && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center mb-5 flex-shrink-0">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Usages for <span className="font-mono text-emerald-600 ml-1">{viewingRedemptions.code}</span>
                                </h2>
                                <button onClick={() => setViewingRedemptions(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {viewingRedemptions.loading ? (
                                <div className="flex justify-center flex-1 py-12 items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : viewingRedemptions.data.length === 0 ? (
                                <div className="flex-1 py-12 text-center text-gray-500">
                                    No one has redeemed this coupon code yet.
                                </div>
                            ) : (
                                <div className="overflow-y-auto flex-1 pr-2">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redemptions</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100 text-sm">
                                            {viewingRedemptions.data.map((r: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{r.userEmail}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{r.count}x</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-medium">₹{r.discountApplied}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                                        {new Date(r.lastRedeemedAt || r.redeemedAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-100 mt-6 flex-shrink-0 text-right">
                                <button
                                    onClick={() => setViewingRedemptions(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, code: '', isDeleting: false })}
                onConfirm={handleDelete}
                title="Delete Coupon"
                message={`Are you sure you want to delete coupon ${deleteModal.code}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={deleteModal.isDeleting}
            />

            {/* Alert Dialog */}
            <AlertDialog
                isOpen={alertDialog.isOpen}
                onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
                title={alertDialog.title}
                message={alertDialog.message}
                type={alertDialog.type}
            />
            </PageHeader>
        </AdminErrorBoundary>
    );
}
