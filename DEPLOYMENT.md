# Tinycrm - Deployment Guide

## Prerequisites

- Node.js 18+ (or Bun 1.0+)
- PostgreSQL 14+
- Git

## Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/crm
PORT=4000
BETTER_AUTH_URL=http://localhost:4000

# Cloudflare R2 (S3-compatible storage for file attachments)
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=crm-attachments
```

### Frontend (`apps/frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Local Development

```bash
# Install dependencies
bun install

# Push database schema
bun run --cwd apps/backend db:push

# Start development servers
bun run dev
```

## Production Build

```bash
# Build both frontend and backend
bun run build

# Start production backend
bun run --cwd apps/backend start

# Or start frontend (if using a separate server)
bun run --cwd apps/frontend start
```

## Database Migrations

The project uses Drizzle ORM with migration files in `apps/backend/drizzle/`.

```bash
# Generate new migration after schema changes
bun run --cwd apps/backend db:generate

# Apply migrations
bun run --cwd apps/backend db:migrate
```

## Deployment Options

### Option 1: VPS / Docker

1. Clone repository
2. Set environment variables
3. Run `bun install && bun run build`
4. Start with `bun run --cwd apps/backend start`
5. Serve frontend with `next start` or reverse proxy (nginx)

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

- **Frontend**: Connect GitHub repo to Vercel, set `apps/frontend` as root
- **Backend**: Deploy `apps/backend` to Railway or Render with PostgreSQL addon

### Option 3: Docker Compose

```yaml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  backend:
    build: ./apps/backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/crm
      PORT: 4000
  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
```

## File Attachments (Cloudflare R2)

The CRM supports file attachments on leads, customers, and tasks using Cloudflare R2 (S3-compatible).

### Setup

1. Create a Cloudflare R2 bucket at https://dash.cloudflare.com
2. Generate S3-compatible API tokens
3. Set the environment variables above

### How it works

- Files are uploaded directly from the browser to R2 using presigned URLs
- The backend stores metadata (filename, R2 key, size) in the `attachments` table
- Downloads use short-lived presigned URLs (1 hour expiry)

## Important Notes

- **Better Auth**: Requires `BETTER_AUTH_URL` to be set to the production backend URL
- **CORS**: Update `apps/backend/src/index.ts` CORS origin to match your frontend domain
- **Trusted Origins**: Update `apps/backend/src/auth.ts` `trustedOrigins` array
- **PostgreSQL**: Ensure database has `uuid-ossp` extension enabled

## Health Check

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```
