export default defineNuxtRouteMiddleware((to) => {
  // Temporarily disable middleware for debugging
  return
  
  // Skip middleware on server-side rendering
  if (process.server) return
  
  const { user, initialized, initAuth } = useAuth()
  
  // Initialize auth if not already done
  if (!initialized.value) {
    initAuth()
    return
  }
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
  
  // Auth routes that should redirect if already logged in
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(to.path)
  
  if (isProtectedRoute && !user.value) {
    return navigateTo('/login')
  }
  
  if (isAuthRoute && user.value) {
    return navigateTo('/dashboard')
  }
}