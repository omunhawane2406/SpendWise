# SpendWise API

1. Copy `.env.example` to `.env` in this directory. The file must be `server/.env`, not `vite-project/.env.example`.
2. Replace `DATABASE_URL` with your running PostgreSQL connection string. The database must already exist.
3. Set a long random `JWT_SECRET`.

```powershell
Copy-Item .env.example .env
npm install
npm run database
npm run dev
```

`npm run database` runs the readable SQL file at `database/schema.sql` through the configured `DATABASE_URL`; no `psql` command is required. The API runs at `http://localhost:4000`. Never commit `.env` or place backend secrets in the Vite app.

