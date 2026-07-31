/**
 * GET /api/messages - 获取留言列表
 * POST /api/messages - 发布留言
 */
import { db, json, parseBody, getClientIp } from '../../_lib.js'

async function handleGet(request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1') || 1
    const pageSize = 20
    const skip = (page - 1) * pageSize
    const so = url.searchParams.get('so')

    const query = {}
    if (so) {
      query.$or = [
        { username: { $regex: so, $options: 'i' } },
        { content: { $regex: so, $options: 'i' } },
      ]
    }

    const rawMessages = await (await db()).collection('Message')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray()

    const messages = rawMessages.map((msg) => ({
      id: msg._id.toString(),
      username: msg.username,
      content: msg.content,
      img: msg.img || null,
      ip: msg.ip || null,
      ipLocation: msg.ipLocation || null,
      dream: msg.dream || null,
      userImg: msg.userImg || null,
      reply: msg.replies?.[0]?.content || msg.reply || null,
      replytime: msg.replies?.[0]?.createdAt?.toISOString?.() || msg.replytime || null,
      posttime: msg.createdAt?.toISOString?.() || msg.createdAt || new Date().toISOString(),
    }))

    const total = await (await db()).collection('Message').countDocuments(query)

    return json({
      success: true,
      data: messages,
      total,
      page,
      limit: pageSize,
    })
  } catch (error) {
    console.error('获取留言列表失败:', error)
    return json({ success: false, error: '获取留言列表失败' }, 500)
  }
}

async function handlePost(request) {
  try {
    const { username, content, img } = await parseBody(request)

    if (!username || !content) {
      return json({ success: false, error: '昵称和内容不能为空' }, 400)
    }

    if (username.length > 20) {
      return json({ success: false, error: '昵称长度不能超过20个字符' }, 400)
    }

    if (content.length > 500) {
      return json({ success: false, error: '内容长度不能超过500个字符' }, 400)
    }

    const ip = getClientIp(request)

    const result = await (await db()).collection('Message').insertOne({
      username,
      content,
      img: img || null,
      ip,
      createdAt: new Date(),
      replies: [],
    })

    const newMessage = await (await db()).collection('Message').findOne({ _id: result.insertedId })

    const mappedMessage = newMessage ? {
      id: newMessage._id.toString(),
      username: newMessage.username,
      content: newMessage.content,
      img: newMessage.img || null,
      ip: newMessage.ip || null,
      ipLocation: newMessage.ipLocation || null,
      dream: newMessage.dream || null,
      userImg: newMessage.userImg || null,
      reply: newMessage.replies?.[0]?.content || newMessage.reply || null,
      replytime: newMessage.replies?.[0]?.createdAt?.toISOString?.() || newMessage.replytime || null,
      posttime: newMessage.createdAt?.toISOString?.() || newMessage.createdAt || new Date().toISOString(),
    } : null

    return json({
      success: true,
      data: mappedMessage,
    })
  } catch (error) {
    console.error('发布留言失败:', error)
    return json({ success: false, error: '发布留言失败' }, 500)
  }
}

export async function onRequest(context) {
  const method = context.request.method
  if (method === 'GET') return handleGet(context.request)
  if (method === 'POST') return handlePost(context.request)
  return json({ success: false, error: 'Method not allowed' }, 405)
}
