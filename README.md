# SpendWise

SpendWise is a full-stack personal finance dashboard for tracking income, expenses, budgets, and spending patterns in one place.

## Features

- Create an account and sign in with JWT-based authentication
- Record and delete income and expense transactions
- Organize transactions by category, date, and payment method
- Create monthly category budgets and monitor budget health
- View balance, income, expenses, savings rate, and recent activity
- Update profile details and change your password
- Responsive dashboard built for desktop and mobile screens

## Tech Stack

- **Frontend:** React 19, Vite, React Router, React Hook Form, Recharts
- **Backend:** Node.js, Express, Zod, JWT, bcryptjs
- **Database:** PostgreSQL
- **HTTP client:** Axios

## Project Structure

```text
SpendWise/
├── README.md
└── vite-project/
	├── src/                 # React application
	├── public/              # Static frontend assets
	├── server/              # Express API and PostgreSQL setup
	│   └── database/
	│       ├── schema.sql
	│       ├── setup.js
	│       └── db.js
	├── package.json
	└── vite.config.js
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer
- An existing PostgreSQL database for SpendWise

## Getting Started

### 1. Install dependencies

Open two terminals from the `vite-project` directory.

```powershell
npm install
cd server
npm install
```

### 2. Configure the API

Create `vite-project/server/.env` from the example file:

```powershell
Copy-Item server/.env.example server/.env
```

Update the values in `server/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/spendwise
JWT_SECRET=replace-with-a-long-random-secret
PORT=4000
CLIENT_URL=http://localhost:5173
```

The PostgreSQL database must exist before setup runs. The schema creates the `users`, `expenses`, `income`, and `budgets` tables.

### 3. Initialize the database

From `vite-project/server`:

```powershell
npm run database
```

### 4. Start the application

Start the API from `vite-project/server`:

```powershell
npm run dev
```

Start the frontend from a second terminal at `vite-project`:

```powershell
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The API health check is available at `http://localhost:4000/api/health`.

## Environment Variables

| Variable | Location | Description |
| --- | --- | --- |
| `DATABASE_URL` | `server/.env` | PostgreSQL connection string |
| `JWT_SECRET` | `server/.env` | Secret used to sign authentication tokens |
| `PORT` | `server/.env` | API port, default `4000` |
| `CLIENT_URL` | `server/.env` | Frontend origin allowed by CORS |
| `VITE_API_URL` | `vite-project/.env` | Optional API base URL; defaults to `http://localhost:4000/api` |

Do not commit `.env` files or place backend secrets in the frontend environment.

## Useful Commands

### Frontend

```powershell
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

### API

```powershell
npm run dev       # Start the API with file watching
npm start         # Start the API in production mode
npm run database  # Apply database/schema.sql
```

## API Resources

Protected resource endpoints require the JWT returned by registration or login:

- `/api/auth/register`
- `/api/auth/login`
- `/api/expenses`
- `/api/income`
- `/api/budgets`
- `/api/users/profile`
- `/api/users/change-password`
- `/api/analytics/summary`

## Security Notes

- Passwords are hashed with bcrypt before storage.
- API requests use bearer tokens with a seven-day expiry.
- User-owned financial records are scoped by the authenticated user ID.
- Use a strong, unique `JWT_SECRET` outside local development.

## License

No license has been specified yet.