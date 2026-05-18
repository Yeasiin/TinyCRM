# CRM Monorepo - Agent Guidelines

## Tech Stack
- **Monorepo**: Bun workspaces (`apps/*`, `packages/*`)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v3
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth (email/password only)
- **UI**: Shadcn UI (Radix base)
- **Forms**: React Hook Form + Zod
- **State/Server**: TanStack Query (query-key based)
- **Notifications**: Sonner (Shadcn-recommended toast library)
- **Package Manager**: Bun exclusively

## Installation Rules
- **Always** use `bun add` or `bun install` for packages. Never manually edit `package.json`.
- **Never** use `npm install`, `yarn add`, or `pnpm add`.
- For Shadcn components, prefer `npx shadcn add <component>`.
- If `npx shadcn init` fails (known bug), manually set up the base config but still use `bun add` for dependencies.

## Environment Variables

### Backend (`apps/backend/.env`)
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/crm
PORT=4000
```

### Frontend (`apps/frontend/.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Note**: `.env` files are gitignored. Copy from `.env.example` when setting up.

## Backend Conventions
- Database connection: `src/db/index.ts`
- Drizzle schema: `src/db/schema.ts`
- Auth config: `src/auth.ts`
- **Critical**: Mount `toNodeHandler(auth)` BEFORE `express.json()` in Express.
- CORS must allow `http://localhost:3000` with `credentials: true`.
- Better Auth `trustedOrigins` must include the frontend URL (`http://localhost:3000`).
- Environment variable for DB: `DATABASE_URL`
- Drizzle scripts: `db:push`, `db:generate`, `db:migrate`

### Better Auth Configuration Example
```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: ["http://localhost:3000"], // Must include frontend URL
});
```

## Frontend Conventions
- Path alias: `@/` maps to `./src/`
- Components: `src/components/ui/` for Shadcn, `src/components/auth/` for auth-specific
- Providers: `src/providers/`
- Lib/utils: `src/lib/utils.ts` (cn helper)
- Validations: `src/lib/validations/`
- Auth client: `src/lib/auth-client.ts`
- Query keys: `src/lib/query-keys.ts`

## Toast Notifications (Sonner)
- Use `toast.success()`, `toast.error()`, `toast.info()` from `sonner`.
- Import: `import { toast } from "sonner"`
- Toaster is mounted in `src/app/layout.tsx` with `position="top-center"` and `richColors`.
- **Pattern**: Use toast for all auth mutations (success + error states).
- **Example**:
```typescript
const mutation = useMutation({
  mutationFn: async () => { /* ... */ },
  onSuccess: () => {
    toast.success("Success!", { description: "Operation completed." });
  },
  onError: (error) => {
    toast.error("Error", { description: error.message });
  },
});
```

## Auth Flow
- Better Auth client baseURL: `http://localhost:4000` (from `NEXT_PUBLIC_API_URL`)
- Backend auth endpoint: `/api/auth/*`
- Session cookie: `better-auth.session_token`
- Middleware protects routes: redirects unauthenticated users to `/login`, authenticated users away from `/login`.
- TanStack Query key for session: `["auth", "session"]`

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

# Database push
bun run --cwd apps/backend db:push
```

## Database Setup (Local Development)
Ensure PostgreSQL is running locally:
```bash
# Default connection string
postgres://postgres:postgres@localhost:5432/crm
```

## Important Notes
- Better Auth `signUp.email` returns `{ data, error }` - always check `error`.
- React Hook Form + Zod via `@hookform/resolvers/zod`.
- All auth mutations are wrapped in `useMutation` with proper loading states.
- Environment variables are loaded automatically by Bun (no `dotenv` package needed).
- **Origin errors**: If you see "Invalid origin", add the frontend URL to `trustedOrigins` in `src/auth.ts`.
