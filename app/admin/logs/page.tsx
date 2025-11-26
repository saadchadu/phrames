'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LogFilters, { getEventTypeColor } from '@/components/admin/LogFilters';
import AdminErrorBoundary, { ErrorDisplay } from '@/components/admin/AdminErrorBoundary';
import { TableSkeleton } from '@/components/admin/LoadingState';
import PageHeader from '@/components/admin/PageHeader';

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
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="View metadata"
                        >
                          {expandedRows.has(log.id) ? '▼' : '▶'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(log.eventType)}`}>
                          {log.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.actorId === 'system' ? (
                          <span className="font-mono text-purple-600">system</span>
                        ) : (
                          <span className="font-mono">{log.actorId}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                    {expandedRows.has(log.id) && (
                      <tr key={`${log.id}-metadata`}>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <div className="font-medium text-gray-700 mb-2">Metadata:</div>
                            <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-xs text-gray-900 font-mono">
                              {log.metadata && Object.keys(log.metadata).length > 0 
                                ? JSON.stringify(log.metadata, null, 2)
                                : 'No metadata available'}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

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
