interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl: string
}

function getS3Config(): S3Config {
  const config = useRuntimeConfig()
  return {
    endpoint: config.s3Endpoint,
    accessKeyId: config.s3AccessKeyId,
    secretAccessKey: config.s3SecretAccessKey,
    bucket: config.s3Bucket,
    publicBaseUrl: config.s3PublicBaseUrl
  }
}

export async function uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const config = getS3Config()
  
  // For demo purposes, we'll simulate S3 upload
  // In production, use proper AWS SDK or S3-compatible client
  console.log(`Simulating S3 upload: ${key} (${buffer.length} bytes)`)
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return `${config.publicBaseUrl}${key}`
}

export function getPublicUrl(key: string): string {
  const config = getS3Config()
  return `${config.publicBaseUrl}${key}`
}