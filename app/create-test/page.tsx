'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { createCampaign, generateUniqueSlug } from '@/lib/firestore'
import { useRouter } from 'next/navigation'

export default function CreateTestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createTestCampaign = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Generate a unique slug
      const slug = await generateUniqueSlug('test-frame')
      console.log('Generated slug:', slug)
      
      // Create test campaign with a simple frame
      const campaignData = {
        campaignName: 'Test Frame Campaign',
        slug: slug,
        description: 'A test campaign for frame functionality',
        visibility: 'Public' as const,
        frameURL: 'https://via.placeholder.com/1080x1080/00dd78/ffffff?text=FRAME',
        status: 'Active' as const,
        createdBy: user.uid
      }
      
      console.log('Creating campaign with data:', campaignData)
      const { id, error } = await createCampaign(campaignData)
      
      if (error) {
        setResult({ error, step: 'create' })
        return
      }
      
      console.log('Campaign created with ID:', id)
      setResult({ 
        success: true, 
        id, 
        slug,
        url: `/c/${slug}`
      })
      
    } catch (error: any) {
      console.error('Test error:', error)
      setResult({ error: error.message || 'Unknown error', step: 'general' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Test Campaign</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Test Campaign</h2>
          <p className="text-gray-600 mb-4">
            This will create a test campaign with a simple green frame that you can use to test the photo editor functionality.
          </p>
          
          <button
            onClick={createTestCampaign}
            disabled={loading || !user}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Test Campaign'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            
            {result.success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-medium">✅ Campaign created successfully!</p>
                </div>
                
                <div className="space-y-2">
                  <p><strong>Campaign ID:</strong> {result.id}</p>
                  <p><strong>Slug:</strong> {result.slug}</p>
                  <p><strong>URL:</strong> <a href={result.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{window.location.origin}{result.url}</a></p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push(result.url)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Test Campaign Page
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">❌ Error: {result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}