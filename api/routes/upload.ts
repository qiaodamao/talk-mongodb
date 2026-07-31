import { Router, type Response } from 'express'
import { authMiddleware, type AuthRequest } from '../lib/auth.js'
import { uploadToCos, deleteFromCos } from '../lib/cos.js'

const router = Router()

// 允许的图片类型
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// 生成唯一文件名
function generateFilename(ext: string): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `uploads/${timestamp}-${random}${ext}`
}

// 获取文件扩展名
function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase()?.replace(/[^a-z]/g, '') || '.jpg'
}

/**
 * POST /api/upload - 上传图片
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contentType = req.headers['content-type'] || ''

    // 解析 multipart/form-data
    if (!contentType.includes('multipart/form-data')) {
      res.status(400).json({ success: false, error: '请使用 multipart/form-data 格式' })
      return
    }

    // 手动解析 multipart 数据（EdgeOne Node Functions 不支持 multer）
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const rawBody = Buffer.concat(chunks)
    const boundary = contentType.split('boundary=')[1]
    if (!boundary) {
      res.status(400).json({ success: false, error: '无效的表单数据' })
      return
    }

    const parts = parseMultipart(rawBody, boundary)
    const filePart = parts.find((p) => p.filename)

    if (!filePart) {
      res.status(400).json({ success: false, error: '请选择要上传的图片' })
      return
    }

    const ext = getExtension(filePart.filename)
    if (!ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
      res.status(400).json({ success: false, error: '仅支持 jpg/jpeg/png/gif/webp 格式的图片' })
      return
    }

    const filename = generateFilename(`.${ext}`)
    const result = await uploadToCos(filename, filePart.data)

    res.status(201).json({
      success: true,
      data: {
        filename: result.filename,
        url: result.url,
      },
    })
  } catch (error) {
    console.error('上传图片失败:', error)
    res.status(500).json({ success: false, error: '上传图片失败' })
  }
})

/**
 * POST /api/upload/remote - 获取远程图片并保存到 COS
 */
router.post('/remote', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body
    if (!url || !url.trim()) {
      res.status(400).json({ success: false, error: '请提供图片 URL' })
      return
    }

    // 验证 URL 格式
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      res.status(400).json({ success: false, error: 'URL 格式无效' })
      return
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      res.status(400).json({ success: false, error: '仅支持 http/https 协议' })
      return
    }

    // 获取远程图片
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!resp.ok) {
      res.status(400).json({ success: false, error: '无法获取远程图片' })
      return
    }

    // 验证是否为图片
    const contentType = resp.headers.get('content-type') || ''
    const isImage = ALLOWED_MIMES.some((mime) => contentType.includes(mime))
    const urlExt = getExtension(parsedUrl.pathname)
    const isValidExt = ALLOWED_EXTENSIONS.includes(`.${urlExt}`)

    if (!isImage && !isValidExt) {
      res.status(400).json({ success: false, error: '远程文件不是有效的图片' })
      return
    }

    const ext = isValidExt ? urlExt : 'jpg'
    const filename = generateFilename(`.${ext}`)
    const arrayBuffer = await resp.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadToCos(filename, buffer)

    res.status(201).json({
      success: true,
      data: {
        filename: result.filename,
        url: result.url,
      },
    })
  } catch (error) {
    console.error('获取远程图片失败:', error)
    res.status(500).json({ success: false, error: '获取远程图片失败' })
  }
})

/**
 * DELETE /api/upload/:filename - 删除图片（需认证）
 */
router.delete('/:filename', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params

    // 防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.status(400).json({ success: false, error: '无效的文件名' })
      return
    }

    await deleteFromCos(`uploads/${filename}`)
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除图片失败:', error)
    res.status(500).json({ success: false, error: '删除图片失败' })
  }
})

/**
 * 简易 multipart 解析器
 */
interface MultipartPart {
  name: string
  filename?: string
  data: Buffer
  contentType?: string
}

function parseMultipart(body: Buffer, boundary: string): MultipartPart[] {
  const parts: MultipartPart[] = []
  const delimiter = Buffer.from(`--${boundary}`)
  const endDelimiter = Buffer.from(`--${boundary}--`)

  let start = 0
  while (start < body.length) {
    const delimIdx = body.indexOf(delimiter, start)
    if (delimIdx === -1) break

    const partStart = delimIdx + delimiter.length + 2 // skip \r\n
    const nextDelimIdx = body.indexOf(delimiter, partStart)
    if (nextDelimIdx === -1) break

    const partData = body.slice(partStart, nextDelimIdx - 2) // remove trailing \r\n
    const headerEndIdx = partData.indexOf('\r\n\r\n')
    if (headerEndIdx === -1) {
      start = nextDelimIdx
      continue
    }

    const headerStr = partData.slice(0, headerEndIdx).toString('utf-8')
    const data = partData.slice(headerEndIdx + 4)

    const nameMatch = headerStr.match(/name="([^"]+)"/)
    const filenameMatch = headerStr.match(/filename="([^"]+)"/)
    const ctMatch = headerStr.match(/Content-Type:\s*(.+)/i)

    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        filename: filenameMatch?.[1],
        data: data.length > 2 ? data.slice(0, -2) : data, // remove trailing \r\n
        contentType: ctMatch?.[1]?.trim(),
      })
    }

    start = nextDelimIdx
  }

  return parts
}

export default router
