# FASTER Scale

A mobile- and desktop-friendly app for people in recovery **and** betrayed partners to complete the
FASTER Scale (adapted from *The Genesis Process* by Michael Dye, as used by Pure Desire Ministries),
track it over time, get reminders, and loop in accountability partners.

## Features (PoC)

- **Two scale versions**: "In recovery" (Relapse) and "Betrayed partner" (Regression), chosen at sign-up.
- **Guided check-in**: one stage per step (Part One), Part Two "most powerful behavior" + 3 questions,
  optional weekly group check-in questions, notes, review. Drafts autosave locally.
- **History**: trend chart of the lowest stage reached, stage distribution, most frequent behaviors.
- **Accountability partners**: email alert when a check-in reaches a chosen stage, optional alert after
  N days without a check-in, private no-login partner view link (behaviors shared only if opted in).
- **Reminders**: daily/weekday schedule in the user's timezone via email and/or web push (PWA).
- **Restoration checklist** with autosave, **resources** by stage, crisis banner (988) on crisis behaviors.
- Notification log so you can see everything sent on your behalf.

## Stack

SvelteKit 3 (Svelte 5, adapter-node) · Tailwind v4 · shadcn-svelte · Drizzle ORM · Postgres ·
Resend (email, optional) · web-push (VAPID, optional). Reminders run on an in-process 1-minute scheduler.

## Local dev

```bash
cp .env.example .env   # point DATABASE_URL at a local Postgres
npm install
npm run db:migrate
npm run dev
```

Generate new migrations after editing `src/lib/server/db/schema.ts` with `npx drizzle-kit generate`.
Migrations run automatically on `npm start`.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string |
| `PUBLIC_BASE_URL` | yes | e.g. `https://faster.ebrouwer.dev` (used in email links) |
| `RESEND_API_KEY` | no | Without it, emails are logged in-app instead of sent |
| `EMAIL_FROM` | no | Defaults to `FASTER Scale <faster@ebrouwer.dev>` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | no | Enables web push (`npx web-push generate-vapid-keys`) |
| `VAPID_SUBJECT` | no | `mailto:` or `https:` contact for push services |

## Deployment

Railway project `faster-scale`: `web` service (this repo) + `Postgres`. Build `npm run build`,
start `npm start` (runs migrations, then `node build`).
