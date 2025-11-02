'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { createCampaign, getCampaignBySlug, generateUniqueSlug } from '@/lib/firestore'

// Prevent static generation for this test page
export const dynamic = 'force-dynamic'

export default function TestCampaignPage() {
  const { user } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createTestCampaign = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Generate a unique slug
      const slug = await generateUniqueSlug('test-campaign')
      console.log('Generated slug:', slug)
      
      // Create test campaign
      const campaignData = {
        campaignName: 'Test Campaign',
        slug: slug,
        description: 'This is a test campaign',
        visibility: 'Public' as const,
        frameURL: 'https://via.placeholder.com/1080x1080.png',
        status: 'Active' as const,
        createdBy: user.uid
      }
      
      console.log('Creating campaign with data:', campaignData)
      const { id, error } = await createCampaign(campaignData)
      
      if (error) {
        setTestResult({ error, step: 'create' })
        return
      }
      
      console.log('Campaign created with ID:', id)
      
      // Test slug lookup
      console.log('Testing slug lookup for:', slug)
      const foundCampaign = await getCampaignBySlug(slug)
      
      setTestResult({
        created: { id, slug },
        found: foundCampaign,
        success: !!foundCampaign
      })
      
    } catch (error: any) {
      console.error('Test error:', error)
      setTestResult({ error: error.message || 'Unknown error', step: 'general' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Campaign Creation & Lookup</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ uid: user?.uid, email: user?.email }, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Campaign Flow</h2>
          <button
            onClick={createTestCampaign}
            disabled={loading || !user}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Create Test Campaign & Test Lookup'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}