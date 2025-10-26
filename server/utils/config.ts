export function validateEnvironment() {
  const config = useRuntimeConfig()
  const requiredVars = [
    'databaseUrl',
    'firebaseAdminProjectId',
    'firebaseAdminClientEmail',
    'firebaseAdminPrivateKey'
  ]
  
  const missing = requiredVars.filter(key => !config[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}