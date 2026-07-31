import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'xinwenyi-talk-secret-key'

export interface AuthRequest extends Request {
  admin?: { username: string }
}

export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ success: false, error: '未登录' })
    return
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string }
    req.admin = decoded
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token 无效' })
  }
}
