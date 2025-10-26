import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'

interface S3Config {
  endpoint?: string
  region: string
  accessKeyId?: string
  secretAccessKey?: string
  bucket?: string
  publicBaseUrl?: string
}

let cachedClient: S3Client | null = null

function readS3Config(): S3Config {
  const config = useRuntimeConfig()
  return {
    endpoint: config.s3Endpoint || undefined,
    region: config.s3Region || 'us-east-1',
    accessKeyId: config.s3AccessKeyId || undefined,
    secretAccessKey: config.s3SecretAccessKey || undefined,
    bucket: config.s3Bucket || undefined,
    publicBaseUrl: config.s3PublicBaseUrl || undefined
  }
}

function assertCredentials(config: S3Config) {
  const missing: string[] = []
  if (!config.bucket) missing.push('S3_BUCKET')
  if (!config.accessKeyId) missing.push('S3_ACCESS_KEY_ID')
  if (!config.secretAccessKey) missing.push('S3_SECRET_ACCESS_KEY')

  if (missing.length > 0) {
    throw new Error(`S3 configuration is incomplete. Missing: ${missing.join(', ')}`)
  }
}

function assertPublicBaseUrl(config: S3Config) {
  if (!config.publicBaseUrl) {
    throw new Error('S3 public base URL is not configured (S3_PUBLIC_BASE_URL)')
  }
}

function normalisePublicUrl(baseUrl: string, key: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, '')
  const trimmedKey = key.replace(/^\/+/, '')
  return `${trimmedBase}/${trimmedKey}`
}

function getClient(): S3Client {
  if (cachedClient) {
    return cachedClient
  }

  const config = readS3Config()
  assertCredentials(config)

  const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId as string,
      secretAccessKey: config.secretAccessKey as string
    }
  }

  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint
    clientConfig.forcePathStyle = true
  }

  cachedClient = new S3Client(clientConfig)
  return cachedClient
}

export function isS3Configured(): boolean {
  const config = readS3Config()
  return Boolean(config.bucket && config.accessKeyId && config.secretAccessKey)
}

export async function ensureS3ObjectExists(key: string): Promise<boolean> {
  const config = readS3Config()
  assertCredentials(config)

  const client = getClient()
  try {
    await client.send(new HeadObjectCommand({
      Bucket: config.bucket as string,
      Key: key
    }))
    return true
  } catch (error: any) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound' || error?.Code === 'NotFound') {
      return false
    }
    throw error
  }
}

export async function uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const config = readS3Config()
  assertCredentials(config)

  const client = getClient()

  await client.send(new PutObjectCommand({
    Bucket: config.bucket as string,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }))

  return getPublicUrl(key)
}

export async function getS3Object(key: string): Promise<GetObjectCommandOutput> {
  const config = readS3Config()
  assertCredentials(config)

  const client = getClient()
  return await client.send(new GetObjectCommand({
    Bucket: config.bucket as string,
    Key: key
  }))
}

export function getPublicUrl(key: string): string {
  const config = readS3Config()
  assertPublicBaseUrl(config)
  return normalisePublicUrl(config.publicBaseUrl as string, key)
}

export function streamToNodeReadable(body: GetObjectCommandOutput['Body']): Readable {
  if (!body) {
    throw new Error('S3 object body is empty')
  }

  if (body instanceof Readable) {
    return body
  }

  // @ts-expect-error - AWS SDK may return a web stream in future
  if (typeof body.getReader === 'function') {
    const reader = body.getReader()
    return Readable.from((async function* () {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) yield value
      }
    })())
  }

  return Readable.from(body as AsyncIterable<Uint8Array>)
}
