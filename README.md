# Vade Finance

**From invoice to liquidity instantly.**
**Live domain:** [vade.finance](https://vade.finance)

## What This Product Actually Does (Degen Version)

Exporters are stuck holding IOUs for 30-90 days.  
We turn those dead invoices into live liquidity.

Flow is simple:
- exporter uploads a real trade invoice
- platform verifies docs + risk
- investor funds it at a discount
- repayment and claim events are tracked on Solana

In plain English:  
**future cash gets pulled into the present**, and everyone sees the same state machine instead of trusting vibes and spreadsheets.

This is not a meme coin front-end.  
This is invoice rails for real-world trade credit, packaged like a clean crypto product.

## Product Roles

| Role | What they do |
| --- | --- |
| Exporter | Creates invoice, gets verified, receives early liquidity |
| Investor | Funds verified invoices, then claims repayment |

Core rules:
- legal docs stay off-chain
- hashes + lifecycle events go on-chain
- statuses are human-readable but deterministic

## Status Flow

1. `Submitted` - invoice created
2. `Verified` - verification passed
3. `Listed` - open for funding
4. `Funded` - investor committed capital
5. `Repaid` - payer sent repayment
6. `Claimed` - investor claimed payout

No fluff: this is a runnable demo flow you can test in [vade.finance/app](https://vade.finance/app).

## Repo Map

- `src/app` - landing, product pages, app shell
- `src/app/api/v1` - backend API route handlers
- `src/components` - UI and domain components
- `src/lib/server` - backend auth/RBAC/invoice logic
- `prisma/schema.prisma` - PostgreSQL schema
- `contracts/vade_finance` - Anchor/Solana demo contracts
- `docs` - runbook and contract/flow specs

## Devnet Demo

Full runbook:
- `docs/DEVNET_DEMO_RUNBOOK.md`

High-level sequence:
1. deploy contract to devnet
2. bootstrap mint/config
3. mint test USDT
4. run Exporter -> Investor -> Payer -> Investor

## Backend (DB + API)

Runbook:
- `docs/BACKEND_SETUP.md`

Stack:
- PostgreSQL + Prisma
- Next.js Route Handlers (`/api/v1/*`)
- Optional Redis/BullMQ for async verification jobs

Project setting:
- backend runs in always-on `dev mode` (`VADE_DEV_MODE=true`) for demo speed

## Important

- **Demo/pilot**, not production.
- Not financial advice.
- Real launch requires full compliance and regulatory setup.

---

TL;DR:  
**Vade Finance turns export invoices into liquid, trackable on-chain credit primitives with a clear UX for both sides of the deal.**
