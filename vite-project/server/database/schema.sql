CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses(user_id, date DESC);

CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(150) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS income_user_date_idx ON income(user_id, date DESC);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  month DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category, month)
);
CREATE INDEX IF NOT EXISTS budgets_user_month_idx ON budgets(user_id, month);
