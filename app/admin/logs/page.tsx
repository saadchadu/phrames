'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LogFilters from '@/components/admin/LogFilters';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';
import ExpandableDataTable, { ExpandableColumn } from '@/components/admin/ExpandableDataTable';

interface LogEntry {
  id: string;
  eventType: string;
  actorId: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

function LogsContent() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchLogs();
  }, [searchParams]);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      const eventType = searchParams.get('eventType');
      if (eventType) {
        params.append('eventType', eventType);
      }

      const dateRange = searchParams.get('dateRange');
      if (dateRange) {
        params.append('dateRange', dateRange);
      }

      const url = `/api/admin/logs${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch logs: ${res.statusText}`);
      }
      
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }

  const toggleRow = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'ADMIN_ACTION': 'bg-blue-100 text-blue-800',
      'CRON_EXECUTION': 'bg-green-100 text-green-800',
      'WEBHOOK_FAILURE': 'bg-red-100 text-red-800',
      'CAMPAIGN_EXPIRY': 'bg-yellow-100 text-yellow-800',
      'CAMPAIGN_DEACTIVATED': 'bg-orange-100 text-orange-800',
      'CAMPAIGN_REACTIVATED': 'bg-emerald-100 text-emerald-800',
      'CAMPAIGN_EXTENDED': 'bg-purple-100 text-purple-800',
      'CAMPAIGN_DELETED': 'bg-red-100 text-red-800',
      'USER_BLOCKED': 'bg-red-100 text-red-800',
      'USER_UNBLOCKED': 'bg-green-100 text-green-800',
      'USER_DELETED': 'bg-red-100 text-red-800',
      'USER_ADMIN_SET': 'bg-indigo-100 text-indigo-800',
      'USER_FREE_CAMPAIGN_RESET': 'bg-cyan-100 text-cyan-800',
      'SETTINGS_CHANGED': 'bg-gray-100 text-gray-800',
      'PAYMENT_SUCCESS': 'bg-green-100 text-green-800',
      'PAYMENT_FAILURE': 'bg-red-100 text-red-800',
      'MANUAL_CRON_TRIGGER': 'bg-blue-100 text-blue-800',
      'DATA_EXPORT': 'bg-purple-100 text-purple-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const columns: ExpandableColumn<LogEntry>[] = [
    {
      key: 'eventType',
      header: 'Event',
      sortable: true,
      render: (log) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(log.eventType)}`}>
          {log.eventType.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'actorId',
      header: 'Actor',
      sortable: true,
      render: (log) => (
        <div className="text-sm text-gray-900 font-mono">
          {log.actorId ? log.actorId.slice(0, 8) + '...' : 'System'}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (log) => (
        <div className="text-sm text-gray-900 max-w-md truncate">
          {log.description}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (log) => (
        <div className="text-sm text-gray-500">
          {new Date(log.createdAt).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      ),
    },
  ];

  const renderExpandableContent = (log: LogEntry) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Log Details:</h4>
        <div className="bg-white p-4 rounded border border-gray-200 text-sm text-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="font-medium">Event ID:</span>
              <p className="font-mono text-xs mt-1">{log.id}</p>
            </div>
            <div>
              <span className="font-medium">Event Type:</span>
              <p className="mt-1">{log.eventType}</p>
            </div>
            <div>
              <span className="font-medium">Actor ID:</span>
              <p className="font-mono text-xs mt-1">{log.actorId || 'System'}</p>
            </div>
            <div>
              <span className="font-medium">Timestamp:</span>
              <p className="mt-1">{new Date(log.createdAt).toISOString()}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-medium">Description:</span>
            <p className="mt-1">{log.description}</p>
          </div>
        </div>
      </div>
      
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Metadata:</h4>
          <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-xs text-gray-900 font-mono">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <PageHeader 
        title="System Logs"
        description="View and monitor all system activity and events"
      >
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <TableSkeleton rows={5} columns={5} />
        </div>
      </PageHeader>
    );
  }

  return (
    <PageHeader 
      title="System Logs"
      description="View and monitor all system activity and events"
    >
      
      <AdminErrorBoundary>
        <LogFilters />
      </AdminErrorBoundary>

      {error && (
        <div className="mb-6">
          <ErrorDisplay error={error} onRetry={fetchLogs} />
        </div>
      )}
      
      <ExpandableDataTable
        columns={columns}
        data={logs}
        keyExtractor={(log) => log.id}
        emptyMessage="No logs found"
        isLoading={loading}
        defaultSort={{ key: 'createdAt', direction: 'desc' }}
        expandableContent={renderExpandableContent}
        expandedRows={expandedRows}
        onToggleRow={toggleRow}
      />

      {logs.length > 0 && (
        <div className="mt-4 text-xs sm:text-sm text-gray-500 text-center">
          Showing {logs.length} log entries
        </div>
      )}
    </PageHeader>
  );
}

export default function AdminLogsPage() {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
        <LogsContent />
      </Suspense>
    </AdminErrorBoundary>
  );
}
