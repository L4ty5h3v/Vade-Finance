# ExportFlow TR

A premium fintech/web3 frontend MVP for Turkish SME exporters — helping them unlock early working capital from buyer-confirmed export invoices without waiting 30–90 days for payment.

## Product Summary

ExportFlow TR connects three parties:

- **Exporter** — Turkish SME submits a buyer-confirmed invoice + document bundle
- **Verifier** — Trusted reviewer checks documents, assigns a confidence score, prepares attestation
- **Investor** — Funds the invoice at a discount; exporter receives capital now, investor earns a return at maturity

The platform earns a small fee per deal. A planned Solana proof layer will record verifier attestations and stablecoin funding events on-chain (not implemented in this MVP).

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Landing page: `/`
- App interface: `/app`

## What Is Implemented

- **Premium landing page** with React Three Fiber 3D pipeline sculpture (Invoice Artifact → Verification Engine → Funding Node)
- **Flow section** — visual 6-step workflow
- **Deal example** — $50,000 invoice waterfall breakdown
- **Proof layer section** — planned Solana infrastructure display
- **7-tab MVP app interface:**
  - Overview — KPI cards, workflow, featured invoice
  - Exporter — invoice list, document checklist, status timeline, 5-step Create Invoice modal
  - Verifier — verification queue, risk signals, confidence meter, Mark as Verified / Needs Review / Reject actions
  - Investor — marketplace cards, deal details, funding simulation modal
  - Deal Economics — interactive calculator with live chart (Recharts)
  - Solana Proof — fake transaction timeline with labeled attestation hashes
  - Demo Flow — stage-by-stage story walkthrough for hackathon judges

## What Is Mocked / Simulated

- All invoice data is local React state (no API, no database)
- Document uploads are simulated (filename + generated hash, no real file stored)
- Blockchain/Solana integration is not real (labeled Planned/Simulated/Future throughout)
- Authentication is not real (demo mode, no login)
- Stablecoin escrow is not real
- All financial figures are for demonstration only

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- React Three Fiber + @react-three/drei + @react-three/postprocessing (3D hero)
- Lucide React (icons)
- Recharts (Deal Economics calculator chart)

## Next Steps

1. Connect real invoice submission API (backend)
2. Implement real document upload + SHA-256 hashing
3. Integrate Solana program for verifier attestation recording
4. Add stablecoin (USDC) escrow program for funding events
5. Real authentication (wallet connect or traditional auth)
6. Verifier onboarding and KYB flow
7. Investor accreditation and limits

---

Frontend MVP · Mock data only · No real financial product · Built for demonstration purposes.
