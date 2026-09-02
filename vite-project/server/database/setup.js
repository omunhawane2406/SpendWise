import 'dotenv/config'
import fs from 'node:fs/promises'
import { query, default as pool } from './db.js'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Create server/.env first.')
  process.exit(1)
}

try {
  const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8')
  await query(schema)
  console.log('SpendWise database tables are ready.')
} catch (error) {
  console.error('Database setup failed:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
