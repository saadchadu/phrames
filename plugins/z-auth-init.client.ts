export default defineNuxtPlugin(() => {
  if (process.server) {
    return
  }

  onNuxtReady(() => {
    const { initAuth } = useAuth()

    initAuth().catch((error) => {
      console.error('Failed to initialize auth state:', error)
    })
  })
})
