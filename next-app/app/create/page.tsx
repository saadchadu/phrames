'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

export default function CreateCampaignPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast('Please sign in to create a campaign', 'error')
      return
    }

    setLoading(true)
    try {
      // This would create a campaign and redirect to the public URL
      // For now, just show the URL structure
      const publicUrl = `${window.location.origin}/c/${formData.slug}`
      
      toast(`Campaign would be available at: ${publicUrl}`, 'success')
      
      // In a real implementation, you'd create the campaign here
      // and then redirect to the public URL
      
    } catch (error) {
      toast('Failed to create campaign', 'error')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-25">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-[#00dd78] rounded mr-2"></div>
              <span className="text-xl font-bold text-[#002400]">phrames</span>
            </div>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-[#002400]">Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="My Awesome Campaign"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Campaign URL</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">phrames.cleffon.com/c/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="my-awesome-campaign"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be your campaign's public URL
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Preview URL</h4>
                <p className="text-sm text-blue-700">
                  Your campaign will be available at:
                </p>
                <code className="text-sm bg-blue-100 px-2 py-1 rounded mt-1 block">
                  phrames.cleffon.com/c/{formData.slug || 'your-campaign-slug'}
                </code>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#00dd78] text-[#002400] hover:bg-[#00dd78]/90"
                disabled={loading || !formData.name || !formData.slug}
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* URL Structure Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#002400] mb-4">URL Structure</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Public Campaign Page:</strong>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                  /c/[campaign-slug]
                </code>
              </div>
              <div>
                <strong>Example:</strong>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                  phrames.cleffon.com/c/save-the-ocean
                </code>
              </div>
              <p className="text-gray-600">
                Anyone with this URL can upload their photo and create a framed image using your campaign design.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}