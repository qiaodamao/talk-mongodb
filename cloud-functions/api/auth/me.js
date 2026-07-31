/**
 * GET /api/auth/me - 获取当前管理员信息
 */
import { db, json, requireAuth } from '../../_lib.js'

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const admin = await (await db()).collection('Admin').findOne(
      { username: auth.username },
      { projection: { username: 1 } }
    )
    if (!admin) {
      return json({ success: false, error: '管理员不存在' }, 404)
    }

    return json({
      success: true,
      data: { username: admin.username },
    })
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    return json({ success: false, error: '获取管理员信息失败' }, 500)
  }
}
