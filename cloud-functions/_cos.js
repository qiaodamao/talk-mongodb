/**
 * EdgeOne Node Functions - COS 工具库
 */
import COS from 'cos-nodejs-sdk-v5'

const SecretId = process.env.COS_SECRET_ID || ''
const SecretKey = process.env.COS_SECRET_KEY || ''
const Bucket = process.env.COS_BUCKET || ''
const Region = process.env.COS_REGION || ''

const cos = new COS({ SecretId, SecretKey })

export async function uploadToCos(filename, buffer) {
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

export async function deleteFromCos(filename) {
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
