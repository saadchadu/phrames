'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface PricingEditorProps {
  initialPricing: {
    week: number;
    month: number;
    '3month': number;
    '6month': number;
    year: number;
    discounts?: {
      week?: number;
      month?: number;
      '3month'?: number;
      '6month'?: number;
      year?: number;
    };
  };
  onSave: (pricing: any) => Promise<void>;
  saving?: boolean;
}

export default function PricingEditor({ initialPricing, onSave, saving = false }: PricingEditorProps) {
  // Ensure all values are valid numbers
  const sanitizedPricing = {
    week: Number(initialPricing.week) || 0,
    month: Number(initialPricing.month) || 0,
    '3month': Number(initialPricing['3month']) || 0,
    '6month': Number(initialPricing['6month']) || 0,
    year: Number(initialPricing.year) || 0,
  };

  const sanitizedDiscounts = {
    week: Number(initialPricing.discounts?.week) || 0,
    month: Number(initialPricing.discounts?.month) || 0,
    '3month': Number(initialPricing.discounts?.['3month']) || 0,
    '6month': Number(initialPricing.discounts?.['6month']) || 0,
    year: Number(initialPricing.discounts?.year) || 0,
  };
  
  const [pricing, setPricing] = useState(sanitizedPricing);
  const [discounts, setDiscounts] = useState(sanitizedDiscounts);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const planLabels: { [key: string]: string } = {
    week: 'Week',
    month: 'Month',
    '3month': '3 Months',
    '6month': '6 Months',
    year: 'Year',
  };

  const handleChange = (plan: string, value: string) => {
    const numValue = parseFloat(value);
    
    // Validate positive number - allow 0 and valid numbers
    if (value !== '' && (isNaN(numValue) || numValue < 0)) {
      setErrors({ ...errors, [plan]: 'Must be a positive number' });
    } else {
      const newErrors = { ...errors };
      delete newErrors[plan];
      setErrors(newErrors);
    }

    setPricing({ ...pricing, [plan]: value === '' ? 0 : numValue });
  };

  const handleDiscountChange = (plan: string, value: string) => {
    const numValue = parseFloat(value);
    
    // Validate percentage (0-100)
    if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
      setErrors({ ...errors, [`discount_${plan}`]: 'Must be between 0-100' });
    } else {
      const newErrors = { ...errors };
      delete newErrors[`discount_${plan}`];
      setErrors(newErrors);
    }

    setDiscounts({ ...discounts, [plan]: value === '' ? 0 : numValue });
  };

  const handleSaveClick = () => {
    // Check for any errors
    const hasErrors = Object.keys(errors).length > 0;
    
    // Validate all values are valid numbers >= 0
    const hasInvalidValues = Object.entries(pricing).some(([key, value]) => {
      const num = Number(value);
      return isNaN(num) || num < 0;
    });

    if (hasErrors) {
      alert('Please fix all errors before saving');
      return;
    }
    
    if (hasInvalidValues) {
      alert('All prices must be valid positive numbers');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmation(false);
    await onSave({ ...pricing, discounts });
  };

  const calculateDiscountedPrice = (plan: string) => {
    const price = pricing[plan as keyof typeof pricing];
    const discount = discounts[plan as keyof typeof discounts];
    if (discount > 0) {
      return Math.round(price - (price * discount / 100));
    }
    return price;
  };

  return (
    <div className="space-y-6">
      {/* Regular Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Regular Prices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(planLabels).map((plan) => (
            <div key={plan}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {planLabels[plan]}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={pricing[plan as keyof typeof pricing]}
                  onChange={(e) => handleChange(plan, e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 ${
                    errors[plan] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={saving}
                />
              </div>
              {errors[plan] && (
                <p className="mt-1 text-sm text-red-600">{errors[plan]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Discount Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Discount Percentage (%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(planLabels).map((plan) => {
            const discountedPrice = calculateDiscountedPrice(plan);
            const hasDiscount = discounts[plan as keyof typeof discounts] > 0;
            return (
              <div key={plan}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {planLabels[plan]}
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={discounts[plan as keyof typeof discounts]}
                    onChange={(e) => handleDiscountChange(plan, e.target.value)}
                    className={`w-full pl-3 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 ${
                      errors[`discount_${plan}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={saving}
                  />
                </div>
                {errors[`discount_${plan}`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`discount_${plan}`]}</p>
                )}
                {hasDiscount && (
                  <p className="mt-1 text-sm text-emerald-600">
                    Discounted: ₹{discountedPrice}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveClick}
          disabled={saving || Object.keys(errors).length > 0}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Pricing'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Pricing Update</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to update the plan pricing? This will affect all new purchases.
            </p>
            <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded">
              {Object.keys(planLabels).map((plan) => {
                const regularPrice = pricing[plan as keyof typeof pricing];
                const discount = discounts[plan as keyof typeof discounts];
                const discountedPrice = calculateDiscountedPrice(plan);
                const hasDiscount = discount > 0;
                
                return (
                  <div key={plan} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{planLabels[plan]}:</span>
                    <div className="text-right">
                      {hasDiscount ? (
                        <>
                          <span className="text-gray-500 line-through mr-2">₹{regularPrice}</span>
                          <span className="text-emerald-600 font-semibold">₹{discountedPrice}</span>
                          <span className="text-xs text-emerald-600 ml-1">({discount}% off)</span>
                        </>
                      ) : (
                        <span className="text-gray-900">₹{regularPrice}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
