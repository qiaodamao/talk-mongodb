import COS from 'cos-nodejs-sdk-v5'

const SecretId = process.env.COS_SECRET_ID || ''
const SecretKey = process.env.COS_SECRET_KEY || ''
const Bucket = process.env.COS_BUCKET || ''
const Region = process.env.COS_REGION || ''

const cos = new COS({ SecretId, SecretKey })

export interface UploadResult {
  filename: string
  url: string
}

export async function uploadToCos(filename: string, buffer: Buffer): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket,
        Region,
        Key: filename,
        Body: buffer,
      },
      (err, data) => {
        if (err) return reject(err)
        const url = `https://${data.Location}`
        resolve({ filename, url })
      },
    )
  })
}

export async function deleteFromCos(filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket,
        Region,
        Key: filename,
      },
      (err) => {
        if (err) return reject(err)
        resolve()
      },
    )
  })
}

export function getFullUrl(filename: string): string {
  return `https://${Bucket}.cos.${Region}.myqcloud.com/${filename}`
}
