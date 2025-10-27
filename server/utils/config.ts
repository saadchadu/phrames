type ConfigPath = string | string[]

function getValue(source: Record<string, any>, path: ConfigPath) {
  const segments = Array.isArray(path) ? path : [path]
  return segments.reduce((memo, key) => (memo == null ? undefined : memo[key]), source)
}

function formatPath(path: ConfigPath) {
  return Array.isArray(path) ? path.join('.') : path
}

export function validateEnvironment(options: { strict?: boolean } = {}) {
  try {
    const config = useRuntimeConfig()
    const strict = options.strict ?? process.env.NODE_ENV === 'production'

    const requiredVars: ConfigPath[] = [
      'databaseUrl',
      'sessionSecret',
      's3Bucket',
      's3AccessKeyId',
      's3SecretAccessKey',
      's3PublicBaseUrl'
    ]

    const missing = requiredVars
      .filter((path) => {
        const value = getValue(config, path)
        return !value
      })
      .map(formatPath)

    if (missing.length > 0) {
      const message = `Missing required environment variables: ${missing.join(', ')}`

      if (strict) {
        console.error(`[phrames] CRITICAL: ${message}`)
        console.error('[phrames] Application may not function correctly without these variables')
        // Don't throw in production to prevent crashes - log error instead
      } else {
        console.warn(`[phrames] ${message}`)
      }
    }
  } catch (error) {
    console.error('[phrames] Error validating environment:', error)
    // Don't re-throw to prevent application crashes
  }
}

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}
