# OUTLAW

Collectif indépendant — boutique, événements, paiement Stripe, remise en main propre à l'université.

## Stack

TanStack Start (Vite) · React 19 · Tailwind v4 · Stripe Checkout · Resend · Neon Postgres · Vercel Cron

## Paiement

Après paiement, un numéro `#OUTLAW-XXXX` est généré. Confirmation par e-mail. Retrait à l'université uniquement.

Webhook Stripe : `POST /api/stripe/webhook` (événement `checkout.session.completed`).

## Admin

`/admin` — accès privé (hors navigation publique).

## Déploiement

Vercel. Variables serveur (jamais dans le code) :

- `DATABASE_URL` — Neon Postgres (pooler, `sslmode=require`)
- `STRIPE_SECRET_KEY` — `sk_test_…` ou `sk_live_…` (pas de clé restreinte `rk_`)
- `STRIPE_WEBHOOK_SECRET` — `whsec_…`
- `CRON_SECRET` — Bearer pour `/api/cron/reminders`
- `RESEND_API_KEY` / `RESEND_FROM`

Schéma : `migrations/*.sql`, appliqué au build via `npm run db:migrate` (pas Prisma).

Cron quotidien 09:00 UTC : `/api/cron/reminders`
