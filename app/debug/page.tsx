'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getUserCampaigns, getAllCampaigns, getCampaignBySlug } from '@/lib/firestore'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DebugPage() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [allCampaigns, setAllCampaigns] = useState<any[]>([])
  const [testSlug, setTestSlug] = useState('')
  const [slugResult, setSlugResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testUserCampaigns = async () => {
    if (!user) return
    setLoading(true)
    try {
      const userCampaigns = await getUserCampaigns(user.uid)
      setCampaigns(userCampaigns)
      console.log('User campaigns:', userCampaigns)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAllCampaigns = async () => {
    setLoading(true)
    try {
      const allCampaignsData = await getAllCampaigns()
      setAllCampaigns(allCampaignsData)
      console.log('All campaigns:', allCampaignsData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testSlugLookup = async () => {
    if (!testSlug) return
    setLoading(true)
    try {
      const result = await getCampaignBySlug(testSlug)
      setSlugResult(result)
      console.log('Slug lookup result:', result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ uid: user?.uid, email: user?.email }, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Functions</h2>
          <div className="space-y-4">
            <div className="space-x-4">
              <button
                onClick={testUserCampaigns}
                disabled={loading || !user}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Test User Campaigns
              </button>
              <button
                onClick={testAllCampaigns}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Test All Campaigns
              </button>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={testSlug}
                onChange={(e) => setTestSlug(e.target.value)}
                placeholder="Enter slug to test"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={testSlugLookup}
                disabled={loading || !testSlug}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Test Slug Lookup
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">User Campaigns ({campaigns.length})</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(campaigns, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">All Campaigns ({allCampaigns.length})</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(allCampaigns, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Slug Lookup Result</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(slugResult, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}