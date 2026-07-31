/**
 * PUT /api/auth/password - 修改密码
 */
import bcrypt from 'bcryptjs'
import { db, json, requireAuth, parseBody } from '../../_lib.js'

export async function onRequest(context) {
  if (context.request.method !== 'PUT') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    const auth = requireAuth(context.request)
    if (auth instanceof Response) return auth

    const { oldPassword, newPassword } = await parseBody(context.request)

    if (!oldPassword || !newPassword) {
      return json({ success: false, error: '旧密码和新密码不能为空' }, 400)
    }

    if (newPassword.length < 6) {
      return json({ success: false, error: '新密码长度不能少于6位' }, 400)
    }

    const admin = await (await db()).collection('Admin').findOne({ username: auth.username })
    if (!admin) {
      return json({ success: false, error: '管理员不存在' }, 404)
    }

    const valid = await bcrypt.compare(oldPassword, admin.password)
    if (!valid) {
      return json({ success: false, error: '旧密码错误' }, 401)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await (await db()).collection('Admin').updateOne(
      { username: auth.username },
      { $set: { password: hashedPassword } }
    )

    return json({ success: true, message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码失败:', error)
    return json({ success: false, error: '修改密码失败' }, 500)
  }
}
