/**
 * GET /api/debug - 诊断接口，排查数据库连接问题
 */
import { db, json } from '../_lib.js'

export async function onRequest(context) {
  const results = {}

  // 1. 检查环境变量
  results.env = {
    DATABASE_URL_set: !!process.env.DATABASE_URL,
    DATABASE_URL_prefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@')
      : 'NOT SET',
    JWT_SECRET_set: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'not set',
  }

  // 2. 测试数据库连接
  try {
    const adminCount = await (await db()).collection('Admin').countDocuments()
    const messageCount = await (await db()).collection('Message').countDocuments()
    results.database = {
      connected: true,
      adminCount,
      messageCount,
    }
  } catch (error) {
    results.database = {
      connected: false,
      error: error && error.message ? error.message : String(error),
    }
  }

  return json(results)
}
