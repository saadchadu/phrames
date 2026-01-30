'use client';

import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface ExpandableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  sortKey?: string; // Optional custom sort key for nested properties
}

interface ExpandableDataTableProps<T> {
  columns: ExpandableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  expandableContent?: (item: T) => ReactNode;
  expandedRows?: Set<string>;
  onToggleRow?: (id: string) => void;
}

type SortDirection = 'asc' | 'desc' | null;

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export default function ExpandableDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  isLoading = false,
  onRowClick,
  defaultSort,
  expandableContent,
  expandedRows = new Set(),
  onToggleRow,
}: ExpandableDataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({
    key: defaultSort?.key || '',
    direction: defaultSort?.direction || null,
  });

  const handleSort = (column: ExpandableColumn<T>) => {
    if (!column.sortable) return;

    const sortKey = column.sortKey || column.key;
    let direction: SortDirection = 'asc';

    if (sortConfig.key === sortKey) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      } else {
        direction = 'asc';
      }
    }

    setSortConfig({ key: sortKey, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }

      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortConfig.direction === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
      }

      // Fallback to string comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const getSortIcon = (column: ExpandableColumn<T>) => {
    if (!column.sortable) return null;

    const sortKey = column.sortKey || column.key;
    const isActive = sortConfig.key === sortKey;

    if (!isActive) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }

    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="h-4 w-4 text-blue-600" />;
    }

    if (sortConfig.direction === 'desc') {
      return <ChevronDown className="h-4 w-4 text-blue-600" />;
    }

    return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
  };

  const handleRowToggle = useCallback((item: T) => {
    const id = keyExtractor(item);
    onToggleRow?.(id);
  }, [keyExtractor, onToggleRow]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-sm text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {expandableContent && (
                  <th className="px-4 sm:px-6 py-3 w-8"></th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                    } ${column.className || ''}`}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {getSortIcon(column)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item) => {
                const itemId = keyExtractor(item);
                const isExpanded = expandedRows.has(itemId);
                
                return (
                  <React.Fragment key={itemId}>
                    <tr
                      onClick={() => onRowClick?.(item)}
                      className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50'}
                    >
                      {expandableContent && (
                        <td className="px-4 sm:px-6 py-4 w-8">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowToggle(item);
                            }}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                            column.className || ''
                          }`}
                        >
                          {column.render(item)}
                        </td>
                      ))}
                    </tr>
                    {expandableContent && isExpanded && (
                      <tr key={`${itemId}-expanded`}>
                        <td colSpan={columns.length + 1} className="px-4 sm:px-6 py-4 bg-gray-50">
                          {expandableContent(item)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}