'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

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
            alert(err.message);
        }
    };

    const handleDelete = async (code: string) => {
        if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
        try {
            const res = await fetch(`/api/admin/coupons/${code}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete coupon');
            fetchCoupons();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (formData.type === 'percent' && Number(formData.value) > 100) {
                throw new Error('Percentage discount cannot exceed 100%');
            }

            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
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
                throw new Error(data.error || 'Failed to create coupon');
            }

            setIsModalOpen(false);
            setFormData({
                code: '', type: 'flat', value: '', applicablePlans: [], usageLimit: '', perUserLimit: '1', validFrom: '', validUntil: '', isActive: true
            });
            fetchCoupons();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Stats
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.isActive).length;
    const totalRedemptions = coupons.reduce((acc, curr) => acc + curr.usedCount, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Tag className="h-6 w-6 text-emerald-600" />
                        Coupons
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage discount codes and promotional offers.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
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
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            ) : (
                <div className="bg-white overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider pl-12">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.code} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{coupon.code}</span>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleToggleActive(coupon.code, coupon.isActive)}
                                                    className={`${coupon.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-emerald-600 hover:text-emerald-900'}`}
                                                >
                                                    {coupon.isActive ? 'Disable' : 'Enable'}
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => handleDelete(coupon.code)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
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
                            <h2 className="text-xl font-bold text-gray-900">Create New Coupon</h2>
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
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase font-mono"
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder={formData.type === 'percent' ? '50' : '100'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Plans <span className="text-gray-400 font-normal">(empty = all plans)</span></label>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {['week', 'month', '3month', '6month', 'year'].map(plan => (
                                        <label key={plan} className="flex items-center gap-2">
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
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            {plan === 'week' ? '1 Week' : plan === 'month' ? '1 Month' : plan === '3month' ? '3 Months' : plan === '6month' ? '6 Months' : '1 Year'}
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
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 border-t border-gray-100 mt-6">
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
                                    {submitting ? 'Saving...' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
