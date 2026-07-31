/**
 * POST /api/upload - 上传图片到 COS
 */
import { json, requireAuth } from '../../_lib.js'
import { uploadToCos as cosUpload } from '../../_cos.js'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

function generateFilename(ext) {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `uploads/${timestamp}-${random}${ext}`
}

function getExtension(filename) {
  return filename.split('.').pop()?.toLowerCase()?.replace(/[^a-z]/g, '') || 'jpg'
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const formData = await context.request.formData()
    const file = formData.get('file')

    if (!file) {
      return json({ success: false, error: '请选择要上传的图片' }, 400)
    }

    const ext = getExtension(file.name)
    if (!ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
      return json({ success: false, error: '仅支持 jpg/jpeg/png/gif/webp 格式的图片' }, 400)
    }

    const filename = generateFilename(`.${ext}`)
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await cosUpload(filename, buffer)

    return json({
      success: true,
      data: { filename: result.filename, url: result.url },
    }, 201)
  } catch (error) {
    console.error('上传图片失败:', error)
    return json({ success: false, error: '上传图片失败' }, 500)
  }
}
