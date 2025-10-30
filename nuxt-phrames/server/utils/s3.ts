import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

let s3Client: S3Client | null = null

function getS3Client() {
  if (!s3Client) {
    const config = useRuntimeConfig()
    s3Client = new S3Client({
      endpoint: config.s3Endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      },
    })
  }
  return s3Client
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  const config = useRuntimeConfig()
  const key = `frames/${uuidv4()}-${filename}`
  
  const command = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  })

  await getS3Client().send(command)

  const url = `${config.s3PublicBaseUrl}/${key}`
  return { key, url }
}

export async function deleteFile(key: string): Promise<void> {
  const config = useRuntimeConfig()
  
  const command = new DeleteObjectCommand({
    Bucket: config.s3Bucket,
    Key: key,
  })

  await getS3Client().send(command)
}