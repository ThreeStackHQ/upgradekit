# UpgradeKit

> Feature gates & paywall widgets for indie SaaS

UpgradeKit lets you add upgrade prompts to your SaaS app when users hit locked features — without writing custom gating logic.

## Packages

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js 14 dashboard app |
| `packages/db` | Drizzle ORM schema & migrations |
| `packages/widget` | Embeddable JS widget (coming soon) |
| `packages/config` | Shared TypeScript & ESLint config |

## Tech Stack

- **Next.js 14** (App Router, TypeScript strict)
- **PostgreSQL** + **Drizzle ORM**
- **NextAuth.js v5** (GitHub + Google OAuth)
- **TailwindCSS** + **Radix UI**
- **pnpm workspaces** + **Turborepo**

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

## Environment Variables

See `apps/web/.env.example` for required environment variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate with `openssl rand -base64 32`)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth app
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth app

## Database Schema

- `users` — OAuth user accounts
- `gates` — Feature gate definitions (headline, CTA, trigger type)
- `gate_impressions` — Widget impression events
- `gate_conversions` — Upgrade click events
- `subscriptions` — Stripe billing (Free / Pro / Business)

## Sprints

- ✅ **1.1** Monorepo Setup (Turborepo + pnpm workspaces)
- ✅ **1.2** Database Schema (Drizzle ORM + migrations)
- ✅ **1.3** Next.js App Shell (TailwindCSS + Radix UI)
- ✅ **1.4** Authentication (NextAuth v5, GitHub + Google OAuth)

---

Built by [ThreeStack](https://threestack.io)
