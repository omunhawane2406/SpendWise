import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from './database/db.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

const signToken = (user) => jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
const safeUser = (user) => { const result = { ...user }; delete result.password; return result }
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const auth = asyncRoute(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  const result = await query('SELECT * FROM users WHERE id = $1', [payload.userId])
  if (!result.rows[0]) return res.status(401).json({ error: 'Unauthorized' })
  req.user = result.rows[0]
  next()
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email and an 8-character password are required' })
  const result = await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name.trim(), email.toLowerCase().trim(), await bcrypt.hash(password, 12)])
  const user = result.rows[0]
  res.status(201).json({ user: safeUser(user), token: signToken(user) })
}))
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [req.body.email?.toLowerCase().trim()])
  const user = result.rows[0]
  if (!user?.password || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ error: 'Invalid email or password' })
  res.json({ user: safeUser(user), token: signToken(user) })
}))
const resources = {
  expenses: { table: 'expenses', fields: ['title', 'amount', 'category', 'date', 'payment_method', 'description'] },
  income: { table: 'income', fields: ['source', 'amount', 'category', 'date', 'description'] },
  budgets: { table: 'budgets', fields: ['category', 'month', 'amount'] },
}
for (const resource of Object.values(resources)) {
  app.get(`/api/${resource.table}`, auth, asyncRoute(async (req, res) => {
    const result = await query(`SELECT * FROM ${resource.table} WHERE user_id = $1 ORDER BY ${resource.table === 'budgets' ? 'month' : 'date'} DESC`, [req.user.id])
    res.json(result.rows)
  }))
  app.post(`/api/${resource.table}`, auth, asyncRoute(async (req, res) => {
    const values = resource.fields.map((field) => field === 'month' && !req.body[field] ? new Date().toISOString().slice(0, 10) : (req.body[field] ?? null))
    const columns = [...resource.fields, 'user_id']
    const placeholders = columns.map((_, index) => `$${index + 1}`)
    const result = await query(`INSERT INTO ${resource.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, [...values, req.user.id])
    res.status(201).json(result.rows[0])
  }))
  app.put(`/api/${resource.table}/:id`, auth, asyncRoute(async (req, res) => {
    const values = resource.fields.map((field) => req.body[field] ?? null)
    const updates = resource.fields.map((field, index) => `${field} = $${index + 1}`)
    const result = await query(`UPDATE ${resource.table} SET ${updates.join(', ')} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`, [...values, req.params.id, req.user.id])
    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' })
    res.json(result.rows[0])
  }))
  app.delete(`/api/${resource.table}/:id`, auth, asyncRoute(async (req, res) => {
    const result = await query(`DELETE FROM ${resource.table} WHERE id = $1 AND user_id = $2 RETURNING id`, [req.params.id, req.user.id])
    if (!result.rows[0]) return res.status(404).json({ error: 'Record not found' })
    res.json({ message: 'Record deleted' })
  }))
}

app.get('/api/users/profile', auth, (req, res) => res.json(safeUser(req.user)))
app.put('/api/users/profile', auth, asyncRoute(async (req, res) => { const result = await query('UPDATE users SET name = $1, profile_image = $2 WHERE id = $3 RETURNING *', [req.body.name, req.body.profileImage, req.user.id]); res.json(safeUser(result.rows[0])) }))
app.put('/api/users/change-password', auth, asyncRoute(async (req, res) => { if (!req.user.password || !(await bcrypt.compare(req.body.currentPassword, req.user.password))) return res.status(400).json({ error: 'Current password is incorrect' }); await query('UPDATE users SET password = $1 WHERE id = $2', [await bcrypt.hash(req.body.newPassword, 12), req.user.id]); res.json({ message: 'Password updated' }) }))
app.get('/api/analytics/summary', auth, asyncRoute(async (req, res) => { const [income, expenses] = await Promise.all([query('SELECT COALESCE(SUM(amount), 0) AS total FROM income WHERE user_id = $1', [req.user.id]), query('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = $1', [req.user.id])]); const incomeTotal = Number(income.rows[0].total); const expenseTotal = Number(expenses.rows[0].total); res.json({ income: incomeTotal, expenses: expenseTotal, balance: incomeTotal - expenseTotal }) }))
app.use((error, _request, res, _next) => { void _next; console.error(error); res.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'That email or record already exists' : 'Request could not be completed' }) })
app.listen(process.env.PORT || 4000, () => console.log(`SpendWise API running on port ${process.env.PORT || 4000}`))
