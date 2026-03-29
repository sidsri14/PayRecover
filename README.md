# API Pulse - API Monitoring SaaS

A high-performance, secure, and modern API monitoring platform built with Bun, Express, and React.

![Dashboard Screenshot](https://raw.githubusercontent.com/placeholder-images/api-pulse-dashboard.png)

## 🚀 Features

- **Real-time Monitoring**: Track uptime and response times for any API endpoint.
- **Incident Management**: Automatically creates and tracks incidents when monitors go down.
- **Security First**: 
  - **SSRF Protection**: Validates URLs and IPs to prevent Server-Side Request Forgery.
  - **CSRF Protection**: Double-submit cookie pattern for all mutating requests.
  - **Secure Sessions**: Cookie-based authentication with HTTP-only tokens.
- **Modern Dashboard**: Responsive UI with dark mode support and interactive charts.
- **Reliable Worker**: A separate background process for consistent health checks.

## 🛠️ Tech Stack

- **Backend**: [Bun](https://bun.sh/), [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/).
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/).
- **Database**: SQLite (default) or PostgreSQL (supported via environment variables).

## 📦 Getting Started

### 1. Prerequisites
- [Bun](https://bun.sh/docs/installation) (>= 1.2) installed on your system.
- Node.js (>= 20) for frontend development.

### 2. Installation
Clone the repository and install dependencies in both folders:

```bash
# Root directory
cd backend && bun install
cd ../frontend && npm install
```

### 3. Setup Environment
Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
ALLOWED_ORIGINS="http://localhost:5173"
COOKIE_SECRET="another-secure-secret"
```

### 4. Database Initialization
```bash
cd backend
bunx prisma db push
```

### 5. Running the Application
You need to run three components to have the full experience:

**Start the Backend API:**
```bash
cd backend
bun run src/index.ts
```

**Start the Monitoring Worker:**
```bash
cd backend
bun run src/worker.ts
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🚢 Deployment Notes

While this project is configured for local development using SQLite, it is production-ready for PostgreSQL. 

> [!IMPORTANT]
> To deploy to a platform like **Google Cloud Run** or **Railway**:
> 1. Update `datasource` in `backend/prisma/schema.prisma` to `provider = "postgresql"`.
> 2. Set the `DATABASE_URL` environment variable to your PostgreSQL connection string.
> 3. Use a platform that supports persistent background processes to run the `worker.ts`.

> [!NOTE]
> **GitHub Pages**: This project requires a Node.js/Bun server for the backend and database. It **cannot** be hosted entirely on GitHub Pages, which only supports static files. You should host the backend on a service like Cloud Run, Railway, or Render, and you can then host the frontend on GitHub Pages or Vercel.

## 📜 License
MIT
