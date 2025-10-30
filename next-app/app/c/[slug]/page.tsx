'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DownloadIcon, ShareIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface Campaign {
  id: string
  name: string
  slug: string
  description: string
  frameAsset: {
    url: string
    width: number
    height: number
  }
}

export default function PublicCampaignPage({ params }: { params: { slug: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch campaign data
    fetchCampaign()
  }, [params.slug])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/public/campaigns/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data)
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateFramedImage = () => {
    if (!campaign || !userImage || !canvasRef.current) return

    setProcessing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = campaign.frameAsset.width
    canvas.height = campaign.frameAsset.height

    const userImg = new Image()
    const frameImg = new Image()

    userImg.onload = () => {
      frameImg.onload = () => {
        // Draw user image (background)
        ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height)
        
        // Draw frame (overlay)
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
        
        setProcessing(false)
      }
      frameImg.src = campaign.frameAsset.url
    }
    userImg.src = userImage
  }

  const downloadImage = () => {
    if (!canvasRef.current) return
    
    const link = document.createElement('a')
    link.download = `${campaign?.name || 'framed-image'}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const shareImage = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `${campaign?.name || 'framed-image'}.png`, { type: 'image/png' })
          await navigator.share({
            title: campaign?.name,
            text: campaign?.description,
            files: [file]
          })
        }
      })
    } catch (error) {
      console.error('Sharing failed:', error)
    }
  }

  useEffect(() => {
    if (userImage && campaign) {
      generateFramedImage()
    }
  }, [userImage, campaign])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-25">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00dd78] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-25">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
            <p className="text-gray-600 mb-6">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
            <Button variant="secondary" asChild>
              <a href="/">Create Your Own</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#002400] mb-4">{campaign.name}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {campaign.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-[#002400] mb-6">Upload Your Photo</h2>
              
              {!userImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-[#00dd78] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload your photo</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={userImage} 
                      alt="Your uploaded photo" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    Change Photo
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-[#002400] mb-6">Your Framed Photo</h2>
              
              {userImage ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto max-h-96 object-contain"
                      style={{ display: processing ? 'none' : 'block' }}
                    />
                    {processing && (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00dd78]"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={downloadImage}
                      className="flex-1 bg-[#00dd78] text-[#002400] hover:bg-[#00dd78]/90"
                      disabled={processing}
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={shareImage}
                      variant="secondary"
                      disabled={processing}
                    >
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Upload a photo to see your framed image</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-[#002400] mb-4">How to use:</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00dd78] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <p>Upload your photo using the upload area on the left</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00dd78] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <p>Your photo will automatically be framed with the campaign design</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00dd78] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <p>Download or share your framed photo on social media</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-[#00dd78] rounded mr-2"></div>
            <span className="text-lg font-bold text-[#002400]">phrames</span>
          </div>
          <p className="text-sm text-gray-600">
            Create your own frame campaign at{' '}
            <a href="/" className="text-[#00dd78] hover:underline">
              phrames.cleffon.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}