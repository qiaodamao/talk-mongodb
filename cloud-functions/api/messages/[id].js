/**
 * DELETE /api/messages/[id] - 删除留言
 */
import { db, json, requireAuth, toObjectId } from '../../_lib.js'

export async function onRequest(context) {
  if (context.request.method !== 'DELETE') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const { id } = context.params

    const result = await (await db()).collection('Message').deleteOne({ _id: toObjectId(id) })

    if (result.deletedCount === 0) {
      return json({ success: false, error: '留言不存在' }, 404)
    }

    return json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除留言失败:', error)
    return json({ success: false, error: '删除留言失败' }, 500)
  }
}
