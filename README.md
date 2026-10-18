# Ghana Missions — Evangelical Association Directory & Admin

Full-stack Next.js 14 + TypeScript + Drizzle ORM (Neon Postgres) + Cloudflare R2.

## Quickstart
1. Copy `.env.example` to `.env.local` and fill `DATABASE_URL`, `JWT_SECRET`, R2 keys.
2. `npm install`
3. `npm run db:push` (creates tables on Neon)
4. Seed admin: run `seedAdmin()` once (or insert via Studio), then login at `/admin/login`.
5. `npm run dev`

## Routes
- `/` landing, `/directory` filters + grid/list + profile modal + regional hub
- `/register` 4-step onboarding (R2 presigned uploads, faith affirmation -> PENDING_REVIEW)
- `/admin` stats, region/denomination breakdown, approvals queue, CSV export
- APIs: `GET /api/organizations`, `POST /api/register`, `POST /api/uploads/presign`, `GET|PATCH|POST /api/admin`, `POST /api/auth/login`

## Env
See `.env.example`. R2 uses S3-compatible presigned PUT URLs (`logos/`, `banners/`, `legal-docs/`, `receipts/`).
