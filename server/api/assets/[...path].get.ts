import { getFirebaseStoragePublicUrl } from '~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path
  
  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Asset path is required'
    })
  }

  try {
    // Check if this is a local storage path (frames/ or thumbs/)
    if (path.startsWith('frames/') || path.startsWith('thumbs/')) {
      // Serve from local storage
      return sendRedirect(event, `/uploads/${path}`, 302)
    }
    
    // Check if already has uploads prefix
    if (path.startsWith('uploads/')) {
      return sendRedirect(event, `/${path}`, 302)
    }
    
    // Get the public URL for the asset from Firebase Storage
    const publicUrl = getFirebaseStoragePublicUrl(path)
    
    // Redirect to the public Firebase Storage URL
    return sendRedirect(event, publicUrl, 302)
  } catch (error) {
    console.error('Error serving asset:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to serve asset'
    })
  }
})
