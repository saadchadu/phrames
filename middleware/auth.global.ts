export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) {
    return
  }

  const { user, initialized, initAuth } = useAuth()

  if (!initialized.value) {
    await initAuth()
  }

  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))

  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(to.path)

  if (isProtectedRoute && !user.value) {
    const redirectTo = to.fullPath || to.path
    return navigateTo({
      path: '/login',
      query: {
        redirect: redirectTo
      }
    })
  }

  if (isAuthRoute && user.value) {
    const redirectParam = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    const redirectTarget = redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/dashboard'

    return navigateTo(redirectTarget)
  }
})
