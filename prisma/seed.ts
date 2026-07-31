import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

async function main() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/talk'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()

    const hashedPassword = await bcrypt.hash('admin123', 10)

    await db.collection('Admin').updateOne(
      { username: 'admin' },
      { $set: { username: 'admin', password: hashedPassword, createdAt: new Date() } },
      { upsert: true }
    )

    await db.collection('Admin').createIndex({ username: 1 }, { unique: true })
    await db.collection('Message').createIndex({ posttime: -1 })
    await db.collection('Message').createIndex({ username: 1 })

    console.log('Seed data created: admin / admin123')
  } finally {
    await client.close()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })