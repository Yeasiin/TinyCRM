# CRM — Google Sheets Powered Customer Relationship Manager

A modern, database-free CRM built for individuals and small teams. All your data lives securely in your own Google Drive — no subscriptions, no lock-in, full control.

**Tech Stack:** Next.js 14 · TypeScript · Express · Tailwind CSS · Google Sheets API · Better Auth

---

## ✨ What Makes It Different

- **No Database Required** — Your CRM data is stored in a Google Spreadsheet called *"My CRM Data"* inside your personal Google Drive. You own your data.
- **Zero Infrastructure** — No PostgreSQL, no Redis, no Docker. Just the app and your Google account.
- **Single Sign-On** — One-click Google OAuth login. No passwords to remember.
- **Pipeline Sync** — Drag a deal in the Kanban board and the linked lead's status updates automatically.

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **Lead Management** | Track prospects through the full sales funnel |
| **Deal Pipeline** | Visual Kanban board with drag-and-drop stage changes |
| **Customer Conversion** | Convert qualified leads into customers in one click |
| **Task Management** | Track todos and mark completions |
| **Activity Timeline** | Auto-generated audit trail for every action |
| **Dashboard** | Charts and KPIs for pipeline health, wins, and tasks |
| **Soft Deletes** | Recover accidentally deleted records anytime |

---

## 🏗 Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────────┐
│   Next.js   │ ───► │   Express    │ ───► │   Google Sheets API │
│  (Frontend) │◄──── │   (Backend)  │◄──── │   (Your Google Drive) │
└─────────────┘      └──────────────┘      └─────────────────────┘
```

- **Monorepo** managed with Bun workspaces (`apps/*`, `packages/*`)
- **Stateless auth** via Better Auth — encrypted JWT cookies, no user database
- **Generic CRUD layer** (`sheets-store.ts`) handles any spreadsheet tab with filtering, sorting, and pagination
- **Per-user spreadsheet** — each user selects or creates their own "My CRM Data" sheet

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v3 |
| Backend | Express.js, TypeScript |
| Auth | Better Auth (Google OAuth, stateless) |
| Data | Google Sheets API + Drive API |
| UI | shadcn/ui, Radix primitives |
| Forms | React Hook Form + Zod |
| State | TanStack Query |
| Tables | TanStack Table |
| Charts | Recharts |
| DnD | @dnd-kit |
| Package Manager | Bun |

---

## ⚡ Quick Start

```bash
# Install dependencies
bun install

# Start both frontend and backend in dev mode
bun run dev
```

**Environment variables:**

Create `apps/backend/.env`:
```env
PORT=4000
BETTER_AUTH_URL=http://localhost:4000
BETTER_AUTH_SECRET=change-me-to-a-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Create `apps/frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> **Note:** You need a Google Cloud OAuth 2.0 Client with the redirect URI `http://localhost:4000/api/auth/callback/google`.

---

## 📁 Project Structure

```
apps/
  backend/          # Express API
    src/
      auth.ts       # Better Auth config
      lib/
        sheets-store.ts    # Generic Google Sheets CRUD
        sheets-schema.ts   # Spreadsheet tab definitions
      modules/
        leads/       # Leads, deals, pipeline sync
        customers/   # Customer conversion
        tasks/       # Task tracking
        notes/       # Notes & timeline
        activities/  # Audit trail
        dashboard/   # Stats & charts
      middleware/
        auth-guard.ts     # Session verification
        sheets-guard.ts   # Spreadsheet validation

  frontend/         # Next.js app
    src/
      app/          # App Router pages
      features/     # Domain-specific components & hooks
      lib/          # Auth client, API client, query keys

packages/           # Shared packages (if any)
```

---

## 🧠 Key Design Decisions

1. **Database-free by design** — A single-person CRM doesn't need a hosted database. Google Sheets provides free, durable, and inspectable storage.
2. **Spreadsheet as the source of truth** — 6 tabs (Leads, Customers, Deals, Tasks, Notes, Activities) with strict column schemas. Data is human-readable and exportable.
3. **Stateless auth** — No database for users or sessions. Encrypted JWT cookies and Google's OAuth handle everything.
4. **Activity audit trail** — Every mutation (create, update, delete, conversion) is logged automatically to the Activities tab.
5. **Soft deletes** — Records are never hard-deleted; a `deletedAt` timestamp enables recovery and maintains referential integrity in activity logs.

---

## 📄 License

MIT

---

*Built with the philosophy that simple tools, owned by you, are better than complex platforms that lock you in.*
