# CRM Monorepo - Agent Guidelines

## Tech Stack
- **Monorepo**: Bun workspaces (`apps/*`, `packages/*`)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v3
- **Backend**: Express.js, TypeScript
- **Data Storage**: Google Sheets (per-user spreadsheet in their Google Drive)
- **Auth**: Better Auth (stateless mode, Google OAuth ONLY — no email/password, no database)
- **UI**: Shadcn UI (Radix base)
- **Forms**: React Hook Form + Zod
- **State/Server**: TanStack Query (query-key based)
- **Notifications**: Sonner (Shadcn-recommended toast library)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Charts**: Recharts
- **Tables**: @tanstack/react-table
- **Package Manager**: Bun exclusively

## Architecture Overview

This is a **database-free CRM**. All CRM data is stored in a Google Spreadsheet called **"My CRM Data"** that lives in the **user's own Google Drive**.

Auth uses **Better Auth in stateless mode** (no database for users/sessions — sessions are encrypted JWT cookies).

Better Auth stateless mode with `storeAccountCookie: true` and `accessType: "offline"` allows us to retrieve the Google OAuth access token server-side via `auth.api.getAccessToken()`. No separate OAuth flow is needed.

### Data Flow
1. User signs in with Google via Better Auth (requests `spreadsheets` + `drive.file` scopes)
2. Frontend fetches the Google access token via `authClient.getAccessToken()` and sends it via `X-Google-Access-Token` header
3. Backend `authGuard` accepts the token from the `X-Google-Access-Token` header
4. After login, user lands on `/dashboard`
5. If no spreadsheet is selected, the dashboard shows a prompt to select one. The header also has a "Select Spreadsheet" button
6. User navigates to `/select-sheet` to pick an existing spreadsheet from their Drive or create a new one
7. Frontend stores the selected `spreadsheetId` in localStorage and sends it via `X-Spreadsheet-Id` header on every CRM API call
8. Backend uses the token and selected spreadsheet ID to read/write CRM data

## Project Structure

### Backend (`apps/backend/src/`)
```
src/
├── auth.ts                 # Better Auth config (stateless, Google OAuth only)
├── index.ts                # Express server + route mounting
├── routes/index.ts         # CRM route registrations (with sheetsGuard)
  ├── modules/                # Domain-driven modules
│   ├── leads/
│   ├── deals/
│   ├── customers/
│   ├── tasks/
│   ├── notes/
│   ├── activities/
│   ├── dashboard/
│   └── sheets/               # Sheet listing, selection, creation
├── middleware/
│   ├── auth-guard.ts       # Session verification (Better Auth)
│   ├── sheets-guard.ts     # Ensure user's spreadsheet exists (creates if missing)
│   └── validate.ts         # Zod body/query validation
├── lib/
│   ├── async-handler.ts    # Express async wrapper
│   ├── error-handler.ts    # AppError + global handler
│   ├── google-sheets.ts    # Google Sheets API client
│   ├── sheets-schema.ts    # Spreadsheet init (6 tabs + headers)
│   ├── sheets-store.ts     # Generic CRUD layer for any sheet tab
│   └── sheets-utils.ts     # Row/object serialization, filtering, sorting, pagination
└── types/
    └── express.d.ts        # Extended Request types (user, session, googleAccessToken, spreadsheetId)
```

### Frontend (`apps/frontend/src/`)
```
src/
├── app/
│   ├── (dashboard)/        # Protected route group
│   │   ├── layout.tsx     # Sidebar + header shell
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── leads/[id]/    # Lead detail with notes/timeline
│   │   ├── customers/
│   │   ├── pipeline/
│   │   └── tasks/
│   ├── login/
│   └── select-sheet/      # Sheet selection / creation page
├── components/
│   ├── ui/                # shadcn primitives
│   ├── layout/            # Sidebar, header (shows "Connect Google Sheets" button)
│   ├── data-table.tsx     # Reusable TanStack Table wrapper
│   └── auth/
├── features/              # Co-located domain logic
│   ├── leads/
│   ├── customers/
│   ├── pipeline/
│   ├── tasks/
│   ├── notes/
│   ├── activities/
│   └── dashboard/
├── lib/
│   ├── auth-client.ts     # Better Auth client + getGoogleToken helper
│   ├── api-client.ts      # Shared fetcher with X-Spreadsheet-Id header
│   ├── query-keys.ts      # Centralized TanStack Query keys
│   └── utils.ts           # cn + formatFileSize
└── providers/
```

## Installation Rules
- **Always** use `bun add` or `bun install` for packages. Never manually edit `package.json`.
- **Never** use `npm install`, `yarn add`, or `pnpm add`.
- For Shadcn components, prefer `npx shadcn add <component>`.
- If `npx shadcn init` fails (known bug), manually set up the base config but still use `bun add` for dependencies.

## Environment Variables

### Backend (`apps/backend/.env`)
```env
PORT=4000
BETTER_AUTH_URL=http://localhost:4000
BETTER_AUTH_SECRET=change-me-to-a-random-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**No DATABASE_URL. No R2 credentials.**

### Frontend (`apps/frontend/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Note**: `.env` files are gitignored. Copy from `.env.example` when setting up.

### Google Cloud Console Setup
You need **ONE** authorized redirect URI in your OAuth 2.0 Client ID:
1. `http://localhost:4000/api/auth/callback/google` — for Better Auth login

## Backend Conventions
- Auth config: `src/auth.ts`
- **Critical**: Mount `toNodeHandler(auth)` BEFORE `express.json()` in Express.
- CORS must allow `http://localhost:3000` with `credentials: true`.
- Better Auth `trustedOrigins` must include the frontend URL (`http://localhost:3000`).
- Environment variables loaded automatically by Bun (no `dotenv` package needed).

### Better Auth Configuration
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: "offline",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    },
  },
  account: {
    storeAccountCookie: true,
  },
  trustedOrigins: ["http://localhost:3000"],
});
```

**Important**: Better Auth is configured for **stateless mode** (no `database` property). Sessions are encrypted JWT cookies. OAuth account data is cached in cookies via `storeAccountCookie: true`.

### Google Sheets Data Layer

The spreadsheet "My CRM Data" has 6 tabs:

| Sheet | Columns |
|-------|---------|
| `Leads` | `id \| userId \| name \| email \| phone \| company \| status \| source \| estimatedValue \| deletedAt \| createdAt \| updatedAt` |
| `Customers` | `id \| userId \| leadId \| name \| email \| phone \| company \| address \| industry \| notes \| deletedAt \| createdAt \| updatedAt` |
| `Deals` | `id \| userId \| leadId \| customerId \| title \| stage \| value \| closedAt \| deletedAt \| createdAt \| updatedAt` |
| `Tasks` | `id \| userId \| leadId \| customerId \| title \| description \| dueDate \| status \| deletedAt \| createdAt \| updatedAt` |
| `Notes` | `id \| userId \| leadId \| customerId \| content \| deletedAt \| createdAt \| updatedAt` |
| `Activities` | `id \| userId \| leadId \| customerId \| dealId \| taskId \| type \| description \| metadata \| createdAt` |

All values are strings in Sheets. Dates are ISO strings, JSON is stringified. The `sheets-utils.ts` handles serialization/deserialization.

### Service Layer Pattern
Controllers are thin HTTP adapters. Business logic lives in `*.service.ts` files. Services handle:
- CRUD operations via `sheets-store.ts`
- Side effects (activity logging, deal creation)
- Status synchronization (lead status <-> deal stage)

### Activity Audit
Every mutation creates an `Activities` row automatically. Activity types: `lead_created`, `lead_updated`, `status_change`, `deal_created`, `deal_updated`, `task_created`, `task_completed`, `customer_created`, `lead_converted`, `note`.

### Soft Deletes
All CRM entities use `deletedAt` timestamp for soft deletion. Queries filter by checking `deletedAt === null` (or empty string in Sheets).

### API Architecture

All CRM routes are under `/api/crm/*` and protected by `authGuard` + `sheetsGuard` middleware.

| Module | Routes |
|--------|--------|
| Leads | `GET/POST/PATCH/DELETE /api/crm/leads` |
| Deals | `GET/POST/PATCH/DELETE /api/crm/deals`, `GET /api/crm/deals/pipeline` |
| Customers | `GET/POST/PATCH/DELETE /api/crm/customers`, `POST /api/crm/customers/convert` |
| Tasks | `GET/POST/PATCH/DELETE /api/crm/tasks` |
| Notes | `GET/POST/DELETE /api/crm/notes` |
| Activities | `GET /api/crm/activities` |
| Dashboard | `GET /api/crm/dashboard/stats` |
| Sheets | `GET /api/crm/sheets`, `POST /api/crm/sheets/select`, `POST /api/crm/sheets/create` |

### Auth Guard
`authGuard` verifies the Better Auth session and retrieves the Google access token. Priority 1: `X-Google-Access-Token` header from the frontend. Priority 2: `auth.api.getAccessToken()` server-side fallback. The token is attached to `req.googleAccessToken` for downstream middleware.

### Sheets Guard
`sheetsGuard` runs after `authGuard`. It:
1. Reads `req.googleAccessToken`
2. Reads `X-Spreadsheet-Id` header from the request
3. If missing, returns `SPREADSHEET_NOT_SELECTED` error
4. Attaches `req.spreadsheetId` for controllers/services to use

## Frontend Conventions
- Path alias: `@/` maps to `./src/`
- Components: `src/components/ui/` for Shadcn, `src/components/auth/` for auth-specific
- Providers: `src/providers/`
- Lib/utils: `src/lib/utils.ts` (cn helper)
- Auth client: `src/lib/auth-client.ts`
- API client: `src/lib/api-client.ts` (shared fetcher with X-Spreadsheet-Id header)
- Query keys: `src/lib/query-keys.ts` (MUST invalidate related keys on mutations)

### Feature Module Structure
Each feature in `src/features/<domain>/` contains:
```
features/<domain>/
├── types.ts              # Domain types (NO assignedTo/assignee fields)
├── api/
│   └── use-<domain>.ts   # TanStack Query hooks
└── components/
    ├── <domain>-columns.tsx
    ├── <domain>-form-dialog.tsx
    └── delete-<domain>-dialog.tsx
```

### Form Dialog Pattern
Forms use React Hook Form + Zod. **Critical**: When editing, use `useEffect` with `form.reset()` to populate values when the entity prop changes. `defaultValues` only applies on initial render.

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "", ... },
});

useEffect(() => {
  if (entity) {
    form.reset({
      name: entity.name || "",
      // ...
    });
  } else {
    form.reset({ name: "", ... });
  }
}, [entity, form]);
```

### Toast Notifications (Sonner)
- Use `toast.success()`, `toast.error()`, `toast.info()` from `sonner`.
- Import: `import { toast } from "sonner"`
- Toaster is mounted in `src/app/layout.tsx` with `position="top-center"` and `richColors`.
- **Pattern**: Use toast for all mutations (success + error states).

### Query Invalidation Rules
When a mutation affects multiple features, invalidate ALL related query keys:
```typescript
// After lead update
queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });

// After customer conversion
queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
```

## Auth Flow
- Better Auth client baseURL: `http://localhost:4000` (from `NEXT_PUBLIC_API_URL`)
- Backend auth endpoint: `/api/auth/*`
- Session cookie: `better-auth.session_token`
- Spreadsheet ID: stored in localStorage, sent via `X-Spreadsheet-Id` header
- Middleware protects routes: redirects unauthenticated users to `/login`, authenticated users away from `/login`.
- TanStack Query key for session: `["auth", "session"]`

### Google Sheets Connection Flow
1. After login, user lands on `/dashboard`
2. If no spreadsheet is selected, CRM API calls return `SPREADSHEET_NOT_SELECTED`
3. The dashboard shows a prompt with a link to `/select-sheet`. The header also has a "Select Spreadsheet" button
4. On `/select-sheet`, user sees existing spreadsheets from their Drive and can select one
5. Or they can create a new "My CRM Data" spreadsheet with all CRM tabs
6. The selected `spreadsheetId` is stored in localStorage and sent via `X-Spreadsheet-Id` header

### Form Error Handling Pattern
- **Zod validation errors**: Display inline below inputs using `formState.errors`.
- **Server/API errors**: Display via `toast.error()` (Sonner), NOT via `setError("root")`.
- **Loading states**: Disable submit button with `mutation.isPending`.

## Running the Project
```bash
# Install everything
bun install

# Dev (both frontend + backend)
bun run dev

# Build
bun run build
```

**No database setup needed.** The app creates the spreadsheet automatically when the user chooses "Create New Spreadsheet" on the `/select-sheet` page.

## Important Notes
- **No database**: There is NO PostgreSQL, SQLite, or any database. All data is in Google Sheets.
- **Single user per spreadsheet**: Each user gets their own "My CRM Data" spreadsheet. There is NO multi-user assignment (`assignedTo` fields removed).
- **Attachments removed**: The entire attachments feature (R2, file uploads) has been removed.
- **Better Auth stateless mode**: No `database` config in `auth.ts`. Sessions are JWT cookies.
- **Google token is server-side**: The Google access token is retrieved client-side via `authClient.getAccessToken()` and sent via `X-Google-Access-Token` header.
- **Money fields**: Store values in cents (integer) in Sheets. Display with `Intl.NumberFormat` divided by 100.
- **Pipeline sync**: Leads and deals share the same status/stage enum. Creating a lead auto-creates a deal. Updating lead status syncs deal stage. Dragging a deal in the Kanban board updates both deal stage and linked lead status.
- **Origin errors**: If you see "Invalid origin", add the frontend URL to `trustedOrigins` in `src/auth.ts`.
- **Select component**: Never use `value=""` on `<SelectItem>`. Use `value="all"` or another non-empty string for "All" options.
