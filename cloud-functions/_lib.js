/**
 * EdgeOne Node Functions 共享工具库
 * 使用 MongoDB 驱动（延迟初始化，避免顶层 await）
 */
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'xinwenyi-talk-secret-key'

let _db = null

async function getDb() {
  if (_db) return _db

  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/talk'
  const client = new MongoClient(uri)

  await client.connect()
  // 从连接字符串中提取数据库名
  let dbName = 'talk'
  try {
    const parsed = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'))
    dbName = parsed.pathname.slice(1) || 'talk'
  } catch (e) {
    // 解析失败用默认值
  }
  _db = client.db(dbName)
  return _db
}

export async function db() {
  return getDb()
}

export function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export function getAuth(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(request) {
  const auth = getAuth(request)
  if (!auth) {
    return json({ success: false, error: '未登录' }, 401)
  }
  return auth
}

export async function parseBody(request) {
  return request.json()
}

export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return '127.0.0.1'
}

export function toObjectId(id) {
  const { ObjectId } = require('mongodb')
  return new ObjectId(id)
}
