/**
 * GET/POST /api/setup - 初始化管理员账号
 * GET 浏览器直接访问，使用默认 admin/admin123
 * POST 可传 { username, password }
 */
import { db, json } from '../_lib.js'
import bcrypt from 'bcryptjs'

export async function onRequest(context) {
  if (context.request.method !== 'POST' && context.request.method !== 'GET') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    let username = 'admin'
    let password = 'admin123'

    if (context.request.method === 'POST') {
      try {
        const body = await context.request.json()
        if (body.username) username = body.username
        if (body.password) password = body.password
      } catch (e) {
        // 无请求体，使用默认值
      }
    }

    if (password.length < 6) {
      return json({ success: false, error: '密码长度不能少于6位' }, 400)
    }

    const existing = await (await db()).collection('Admin').findOne({ username })
    if (existing) {
      return json({ success: true, message: '管理员已存在，无需初始化' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await (await db()).collection('Admin').insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    })

    return json({
      success: true,
      message: `初始化成功！管理员: ${username} / ${password}`,
    })
  } catch (error) {
    console.error('初始化失败:', error)
    return json({ success: false, error: String(error) }, 500)
  }
}
