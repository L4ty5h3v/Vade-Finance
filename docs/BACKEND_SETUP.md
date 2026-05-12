# Vade Backend Setup (Dev Mode)

This backend is implemented as Next.js App Router Route Handlers under `src/app/api/v1/*`.

## What is included

- PostgreSQL data model via Prisma (`prisma/schema.prisma`)
- Wallet signature auth (challenge + verify)
- Session cookies
- RBAC with always-on dev mode bypass
- Invoice lifecycle endpoints
- Funding/repayment/claim balance bookkeeping in DB
- Audit logs
- Optional Redis/BullMQ queue hook for verification jobs

## Quick start

1. Copy env:

```bash
cp .env.example .env.local
```

2. Start infra:

```bash
docker compose -f docker-compose.backend.yml up -d
```

3. Generate Prisma client + run migration:

```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name init_vade_backend
```

4. Start app:

```bash
npm run dev
```

5. Health check:

```bash
curl http://localhost:3000/api/v1/health
```

## API surface

- `POST /api/v1/auth/challenge`
- `POST /api/v1/auth/verify`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me`
- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/invoices/:invoiceId`
- `POST /api/v1/invoices/:invoiceId/verify`
- `POST /api/v1/invoices/:invoiceId/list`
- `POST /api/v1/invoices/:invoiceId/fund`
- `POST /api/v1/invoices/:invoiceId/repay`
- `POST /api/v1/invoices/:invoiceId/claim`
- `POST /api/v1/invoices/:invoiceId/default`
- `GET /api/v1/history`
- `GET /api/v1/balance`
- `POST /api/v1/balance`

## Dev mode behavior

`VADE_DEV_MODE=true` means:

- role guards are bypassed for action permissions
- same wallet can create/verify/list/fund/repay/claim/default
- useful for demo and fast QA flows

Note: status transition checks still apply.

## Data responsibilities

- On-chain: hashes, lifecycle, settlement events, token movement proofs.
- Backend/DB: user profiles, invoice metadata, docs references, operational history, audit logs, local balances for demo UX.

