import { MongoClient, type Db } from 'mongodb'

const globalForMongo = globalThis as unknown as { client: MongoClient; db: Db }

export let db: Db

async function connect(): Promise<void> {
  if (globalForMongo.db) {
    db = globalForMongo.db
    return
  }

  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/talk'
  const client = new MongoClient(uri)

  await client.connect()
  // 从连接字符串中提取数据库名，若未指定则使用 'talk'
  const dbName = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://')).pathname.slice(1) || 'talk'
  globalForMongo.client = client
  globalForMongo.db = client.db(dbName)
  db = globalForMongo.db
}

await connect()

export default db