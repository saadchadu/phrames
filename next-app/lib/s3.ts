import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

let s3Client: S3Client | null = null

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
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
  const key = `frames/${uuidv4()}-${filename}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  })

  await getS3Client().send(command)

  const url = `${process.env.S3_PUBLIC_BASE_URL}/${key}`
  return { key, url }
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  })

  await getS3Client().send(command)
}