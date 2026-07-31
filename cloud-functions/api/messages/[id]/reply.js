/**
 * PUT /api/messages/[id]/reply - 回复留言
 */
import { db, json, requireAuth, parseBody, toObjectId } from '../../../_lib.js'

export async function onRequest(context) {
  if (context.request.method !== 'PUT') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const { id } = context.params
    const { content } = await parseBody(context.request)

    if (!content) {
      return json({ success: false, error: '回复内容不能为空' }, 400)
    }

    if (content.length > 500) {
      return json({ success: false, error: '回复内容长度不能超过500个字符' }, 400)
    }

    const result = await (await db()).collection('Message').updateOne(
      { _id: toObjectId(id) },
      {
        $push: {
          replies: {
            username: auth.username,
            content,
            createdAt: new Date(),
          },
        },
      }
    )

    if (result.modifiedCount === 0) {
      return json({ success: false, error: '留言不存在' }, 404)
    }

    const rawMessage = await (await db()).collection('Message').findOne({ _id: toObjectId(id) })

    const message = rawMessage ? {
      id: rawMessage._id.toString(),
      username: rawMessage.username,
      content: rawMessage.content,
      img: rawMessage.img || null,
      ip: rawMessage.ip || null,
      ipLocation: rawMessage.ipLocation || null,
      dream: rawMessage.dream || null,
      userImg: rawMessage.userImg || null,
      reply: rawMessage.replies?.[0]?.content || rawMessage.reply || null,
      replytime: rawMessage.replies?.[0]?.createdAt?.toISOString?.() || rawMessage.replytime || null,
      posttime: rawMessage.createdAt?.toISOString?.() || rawMessage.createdAt || new Date().toISOString(),
    } : null

    return json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('回复留言失败:', error)
    return json({ success: false, error: '回复留言失败' }, 500)
  }
}
