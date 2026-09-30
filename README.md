# DeskTalks Backend

Express + TypeScript API (Supabase Postgres + Backblaze B2). Deployed on Vercel.

## Vercel (production)

Project: `desktalkbackend` (GitHub: `arhammshahidd/desktalkbackend` → `main`).

### Build settings

- Framework: Other / Node
- Build command: leave empty (or `npm run typecheck`)
- Output: not needed — serverless entry is `api/index.ts`
- Install: `npm install`
- Node.js: `20.x`

### Environment variables (Production)

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://desktalkfrontend.arhamq15.workers.dev` (comma-separate more origins if needed) |
| `PUBLIC_API_URL` | `https://desktalkbackend.vercel.app` (no `/api` — used for `/api/media` proxy URLs) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `JWT_SECRET` | Long random string (required) |
| `JWT_EXPIRES_IN` | `7d` |
| `B2_KEY_ID` | B2 application key ID |
| `B2_APPLICATION_KEY` | B2 application key |
| `B2_BUCKET` | Bucket name |
| `B2_REGION` | e.g. `us-west-004` |
| `B2_ENDPOINT` | e.g. `https://s3.us-west-004.backblazeb2.com` |
| `B2_PUBLIC_URL` | Public base URL for objects |

After first deploy, health check: `https://YOUR_PROJECT.vercel.app/api/health`

Then set frontend `VITE_API_BASE_URL=https://YOUR_PROJECT.vercel.app/api` and redeploy Cloudflare.

### Local development

```bash
cp .env.example .env
# fill real Supabase + B2 + JWT values
npm install
npm run dev
```

Optional admin seed: `npm run seed:admin`

## Scripts

- `npm run dev` — local API on `:4000`
- `npm run build` / `npm run typecheck`
- `npm start` — run compiled `dist` (local only; Vercel uses `api/index.ts`)
