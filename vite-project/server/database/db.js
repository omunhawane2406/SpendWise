import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

pool.on('error', (error) => console.error('Unexpected PostgreSQL error', error))

export const query = (text, values) => pool.query(text, values)
export default pool
