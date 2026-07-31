/**
 * local server entry file, for local development
 */
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

// 必须在 import app 之前加载环境变量，
// 否则 prisma.ts 的顶层 await 会用默认的 localhost 连接
dotenvConfig({ path: resolve(process.cwd(), '.env.local') })
dotenvConfig({ path: resolve(process.cwd(), '.env') })

const { default: app } = await import('./app.js')

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`)
})

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app
