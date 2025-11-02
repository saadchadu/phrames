import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
    }

    console.log('🔄 Proxying image:', imageUrl)

    // Fetch the image from Firebase Storage
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)'
      }
    })
    
    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    console.log('✅ Image proxied successfully, size:', imageBuffer.byteLength)
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    })
  } catch (error) {
    console.error('❌ Image proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}