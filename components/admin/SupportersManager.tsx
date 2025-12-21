'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface FixResult {
  success: boolean
  fixed?: number
  cleaned?: number
  errors?: string[]
  oldCount?: number
  newCount?: number
}

export default function SupportersManager() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FixResult | null>(null)
  const [campaignId, setCampaignId] = useState('')

  const handleFixAll = async () => {
    if (!user) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/fix-supporters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ action: 'fix-all' })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error fixing supporters:', error)
      setResult({ success: false, errors: ['Network error'] })
    } finally {
      setLoading(false)
    }
  }

  const handleFixSingle = async () => {
    if (!user || !campaignId.trim()) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/fix-supporters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          action: 'fix-single',
          campaignId: campaignId.trim()
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error fixing campaign:', error)
      setResult({ success: false, errors: ['Network error'] })
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupOrphaned = async () => {
    if (!user) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/fix-supporters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ action: 'cleanup-orphaned' })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error cleaning up:', error)
      setResult({ success: false, errors: ['Network error'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Supporters Count Manager</h2>
      
      <div className="space-y-6">
        {/* Fix All Campaigns */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fix All Campaigns</h3>
          <p className="text-sm text-gray-600 mb-4">
            Recalculate supporter counts for all campaigns based on actual supporter records.
          </p>
          <button
            onClick={handleFixAll}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {loading ? 'Processing...' : 'Fix All Campaigns'}
          </button>
        </div>

        {/* Fix Single Campaign */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fix Single Campaign</h3>
          <p className="text-sm text-gray-600 mb-4">
            Recalculate supporter count for a specific campaign.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="Campaign ID"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={handleFixSingle}
              disabled={loading || !campaignId.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {loading ? 'Processing...' : 'Fix Campaign'}
            </button>
          </div>
        </div>

        {/* Cleanup Orphaned */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cleanup Orphaned Records</h3>
          <p className="text-sm text-gray-600 mb-4">
            Remove supporter records for campaigns that no longer exist.
          </p>
          <button
            onClick={handleCleanupOrphaned}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {loading ? 'Processing...' : 'Cleanup Orphaned'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className={`border rounded-lg p-4 ${
            result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <h3 className={`text-lg font-medium mb-2 ${
              result.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {result.success ? 'Success' : 'Error'}
            </h3>
            
            {result.success && (
              <div className="text-sm text-green-800">
                {result.fixed !== undefined && (
                  <p>Fixed {result.fixed} campaigns</p>
                )}
                {result.cleaned !== undefined && (
                  <p>Cleaned {result.cleaned} orphaned records</p>
                )}
                {result.oldCount !== undefined && result.newCount !== undefined && (
                  <p>
                    Updated count: {result.oldCount} → {result.newCount} 
                    (difference: {result.newCount - result.oldCount})
                  </p>
                )}
              </div>
            )}
            
            {result.errors && result.errors.length > 0 && (
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}