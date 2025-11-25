'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig[];
  onFilterChange?: (key: string, value: string) => void;
  filterValues?: Record<string, string>;
}

export default function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onFilterChange,
  filterValues = {},
}: FilterBarProps) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearchValue !== searchValue) {
        onSearchChange(localSearchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchValue, onSearchChange, searchValue]);

  const handleClearSearch = () => {
    setLocalSearchValue('');
    onSearchChange?.('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        {onSearchChange && (
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
            {localSearchValue && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <div key={filter.key} className="sm:w-48">
            <select
              value={filterValues[filter.key] || filter.defaultValue || ''}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              aria-label={filter.label}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Active Filters Display */}
      {Object.keys(filterValues).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(filterValues).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find((f) => f.key === key);
            const option = filter?.options.find((o) => o.value === value);
            if (!option) return null;

            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
              >
                {filter?.label}: {option.label}
                <button
                  onClick={() => onFilterChange?.(key, '')}
                  className="hover:text-emerald-900"
                  aria-label={`Remove ${filter?.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {Object.keys(filterValues).length > 1 && (
            <button
              onClick={() => {
                Object.keys(filterValues).forEach((key) => {
                  onFilterChange?.(key, '');
                });
              }}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
