# OUTLAW

Collectif indépendant — boutique, événements, paiement Stripe, remise en main propre à l'université.

## Stack

TanStack Start (Vite) · React 19 · Tailwind v4 · Stripe Checkout · Resend · Vercel Cron

## Paiement

Après paiement, un numéro `#OUTLAW-XXXX` est généré. Confirmation par e-mail. Retrait à l'université uniquement.

## Admin

`/admin` — accès privé (hors navigation publique).

## Déploiement

Vercel. Variables nécessaires :

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `STRIPE_WEBHOOK_SECRET` (après création du webhook)
- `CRON_SECRET`
- `DATABASE_URL` (Postgres / Neon en production)

Cron quotidien 09:00 UTC : `/api/cron/reminders`
