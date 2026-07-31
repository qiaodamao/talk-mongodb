/**
 * 管理员认证路由
 * 处理登录、身份验证、密码修改
 */
import { Router, type Response } from 'express'
import bcrypt from 'bcryptjs'
import db from '../lib/prisma.js'
import { generateToken, authMiddleware, type AuthRequest } from '../lib/auth.js'

const router = Router()

router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ success: false, error: '用户名和密码不能为空' })
      return
    }

    const admin = await db.collection('Admin').findOne({ username })
    if (!admin) {
      res.status(401).json({ success: false, error: '用户名或密码错误' })
      return
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      res.status(401).json({ success: false, error: '用户名或密码错误' })
      return
    }

    const token = generateToken(username)

    res.json({
      success: true,
      data: {
        token,
        username: admin.username,
      },
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const username = req.admin!.username

    const admin = await db.collection('Admin').findOne({ username }, { projection: { username: 1 } })
    if (!admin) {
      res.status(404).json({ success: false, error: '管理员不存在' })
      return
    }

    res.json({
      success: true,
      data: {
        username: admin.username,
      },
    })
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    res.status(500).json({ success: false, error: '获取管理员信息失败' })
  }
})

router.put('/password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body
    const username = req.admin!.username

    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, error: '旧密码和新密码不能为空' })
      return
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: '新密码长度不能少于6位' })
      return
    }

    const admin = await db.collection('Admin').findOne({ username })
    if (!admin) {
      res.status(404).json({ success: false, error: '管理员不存在' })
      return
    }

    const valid = await bcrypt.compare(oldPassword, admin.password)
    if (!valid) {
      res.status(401).json({ success: false, error: '旧密码错误' })
      return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.collection('Admin').updateOne({ username }, { $set: { password: hashedPassword } })

    res.json({ success: true, message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码失败:', error)
    res.status(500).json({ success: false, error: '修改密码失败' })
  }
})

export default router