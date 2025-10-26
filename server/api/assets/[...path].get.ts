import { sendStream } from 'h3'
import { getS3Object, isS3Configured, streamToNodeReadable } from '~/server/utils/s3'

export default defineEventHandler(async (event) => {
  const pathParam = event.context.params?.path
  const key = Array.isArray(pathParam) ? pathParam.join('/') : pathParam

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Asset path is required'
    })
  }

  if (!isS3Configured()) {
    console.warn('[assets] S3 is not configured – returning placeholder image')

    const placeholderSvg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f3f4f6"/>
        <circle cx="200" cy="200" r="150" fill="none" stroke="#9ca3af" stroke-width="4"/>
        <text x="200" y="210" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
          Frame Preview
        </text>
      </svg>
    `

    setHeader(event, 'Content-Type', 'image/svg+xml')
    setHeader(event, 'Cache-Control', 'public, max-age=60')
    return placeholderSvg
  }

  try {
    const object = await getS3Object(key)
    const body = object.Body

    if (!body) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Asset not found'
      })
    }

    const cacheControl = object.CacheControl || 'public, max-age=31536000, immutable'
    const contentType = object.ContentType || 'application/octet-stream'

    setHeader(event, 'Cache-Control', cacheControl)
    setHeader(event, 'Content-Type', contentType)

    if (object.ETag) {
      setHeader(event, 'ETag', object.ETag)
    }

    return sendStream(event, streamToNodeReadable(body))
  } catch (error: any) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NoSuchKey') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Asset not found'
      })
    }

    console.error('Failed to retrieve asset from S3:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve asset'
    })
  }
})
