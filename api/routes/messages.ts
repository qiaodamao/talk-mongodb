import { Router, type Request, type Response } from 'express'
import db from '../lib/prisma.js'
import { authMiddleware, type AuthRequest } from '../lib/auth.js'
import { ObjectId } from 'mongodb'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50))
    const so = (req.query.so as string) || ''

    const offset = (page - 1) * limit

    let query = {}
    if (so) {
      query = {
        $or: [
          { username: { $regex: so, $options: 'i' } },
          { content: { $regex: so, $options: 'i' } },
          { reply: { $regex: so, $options: 'i' } },
        ],
      }
    }

    const [data, total] = await Promise.all([
      db.collection('Message')
        .find(query)
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      db.collection('Message').countDocuments(query),
    ])

    const formattedData = data.map((item) => ({
      ...item,
      id: item._id?.toString() || '',
    }))

    res.json({ success: true, data: formattedData, total, page, limit })
  } catch (error) {
    console.error('获取留言列表失败:', error)
    res.status(500).json({ success: false, error: '获取留言列表失败' })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, content, img } = req.body

    if (!username || !username.trim()) {
      res.status(400).json({ success: false, error: '用户名不能为空' })
      return
    }
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, error: '内容不能为空' })
      return
    }

    const sanitized = content.replace(/<[^>]*>/g, '')

    if (/https?:\/\//i.test(sanitized)) {
      res.status(400).json({ success: false, error: '内容不能包含链接' })
      return
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1'

    let location = ''
    try {
      const resp = await fetch(
        `http://ip-api.com/json/${ip}?lang=zh-CN&fields=regionName,city`,
        { signal: AbortSignal.timeout(3000) }
      )
      if (resp.ok) {
        const data = (await resp.json()) as { regionName?: string; city?: string }
        if (data.regionName || data.city) {
          location = `${data.regionName || ''} ${data.city || ''}`.trim()
        }
      }
    } catch {
      // IP 定位失败不影响留言
    }

    const result = await db.collection('Message').insertOne({
      username: username.trim(),
      content: sanitized.trim(),
      img: img || '',
      dream: '',
      ip,
      ipLocation: location,
      posttime: new Date(),
    })

    const inserted = await db.collection('Message').findOne({ _id: result.insertedId })
    const formatted = {
      ...inserted,
      id: inserted?._id?.toString() || '',
    }

    res.status(201).json({ success: true, data: formatted })
  } catch (error) {
    console.error('创建留言失败:', error)
    res.status(500).json({ success: false, error: '创建留言失败' })
  }
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    if (!id) {
      res.status(400).json({ success: false, error: '无效的 ID' })
      return
    }

    let objectId
    try {
      objectId = new ObjectId(id)
    } catch {
      res.status(400).json({ success: false, error: '无效的 ID' })
      return
    }

    const existing = await db.collection('Message').findOne({ _id: objectId })
    if (!existing) {
      res.status(404).json({ success: false, error: '留言不存在' })
      return
    }

    await db.collection('Message').deleteOne({ _id: objectId })
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除留言失败:', error)
    res.status(500).json({ success: false, error: '删除留言失败' })
  }
})

router.put('/:id/reply', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id
    if (!id) {
      res.status(400).json({ success: false, error: '无效的 ID' })
      return
    }

    let objectId
    try {
      objectId = new ObjectId(id)
    } catch {
      res.status(400).json({ success: false, error: '无效的 ID' })
      return
    }

    const { reply } = req.body
    if (!reply || !reply.trim()) {
      res.status(400).json({ success: false, error: '回复内容不能为空' })
      return
    }

    const existing = await db.collection('Message').findOne({ _id: objectId })
    if (!existing) {
      res.status(404).json({ success: false, error: '留言不存在' })
      return
    }

    const result = await db.collection('Message').findOneAndUpdate(
      { _id: objectId },
      { $set: { reply: reply.trim(), replytime: new Date() } },
      { returnDocument: 'after' }
    )

    const formatted = {
      ...result.value,
      id: result.value?._id?.toString() || '',
    }

    res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('回复留言失败:', error)
    res.status(500).json({ success: false, error: '回复留言失败' })
  }
})

export default router