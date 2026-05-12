# vade_finance Frontend Mapping (Phase 0)

## Goal
Map existing Vade `/app` actions and statuses to the proposed Solana contract interface without implementing integration yet.

## Current `/app` Observations Reused in Contract Design
Observed in current code flow:
- User roles in UI: `Exporter`, `Investor`
- Verification actions: `Verify`, `Reject`, `Simulate Repayment`, `Mark Default`
- Marketplace action: `Fund Invoice`
- Invoice creation: `Create Invoice`
- Detail view: invoice account-like snapshot with hashes/status

Observed statuses already used in app data/UI:
- `Submitted`, `Verified`, `Listed`, `Funded`, `Repaid`, `Rejected`, `Defaulted`

Contract adds two canonical statuses that are not fully surfaced as separate UI actions today:
- `Cancelled`
- `Claimed`

## Action-to-Instruction Mapping
| Frontend Action | Contract Instruction | Notes |
|---|---|---|
| Create Invoice | `create_invoice` | Exporter submits hashes, amounts, due date, risk score |
| Verify | `verify_invoice` | Verifier gate before listing |
| Reject | `reject_invoice` | Verifier rejection path |
| List | `list_invoice` | Explicit listing step after verify |
| Fund | `fund_invoice` | Investor funds purchase price into vault |
| Simulate Repayment | `repay_invoice` | MVP uses payer simulation in UI |
| Claim | `claim_repayment` | Investor claims repaid funds minus fee |
| Mark Default | `mark_default` | Manual default transition in MVP |
| Cancel | `cancel_invoice` | Exporter-only, before funding |
| View Details | Read `Invoice` account | Fetch state + hashes + timestamps |

## Suggested UI Status Mapping
| On-chain Status | UI Badge |
|---|---|
| `Submitted` | Submitted |
| `Verified` | Verified |
| `Listed` | Listed |
| `Funded` | Funded |
| `Repaid` | Repaid |
| `Claimed` | Claimed |
| `Rejected` | Rejected |
| `Defaulted` | Defaulted |
| `Cancelled` | Cancelled |

## Responsibility Split

### On-chain Responsibilities
- Authoritative invoice lifecycle state machine.
- Custody of funded and repaid amounts via invoice vault.
- Role-based authorization enforcement.
- Fee computation and split at claim time.
- Immutable hash anchoring and event emission.

### Off-chain / Backend Responsibilities
- Document storage (PDFs, shipment proofs, legal files).
- KYB/KYC process and compliance checks.
- Duplicate detection and fraud screening.
- Risk model scoring pipeline.
- Indexing/subgraph-style read model for fast UI queries.
- Notification and workflow automation (due/default reminders).

## Security Notes for Frontend Integration (Future)
- Never trust client-side role checks as security; enforce roles on-chain.
- Always derive and verify expected PDAs client-side before sending tx.
- Validate mint and token account constraints in instruction account builders.
- Treat hashes as immutable evidence references, not plaintext data.
- Display explicit prototype disclaimer during devnet simulations.

## Test Matrix (Frontend to Contract)
| Case | Frontend Trigger | Expected Contract Outcome |
|---|---|---|
| Exporter submits valid invoice | Create Invoice | `InvoiceCreated`, status `Submitted` |
| Verifier approves | Verify | `InvoiceVerified`, status `Verified` |
| Verifier lists | List | `InvoiceListed`, status `Listed` |
| Investor funds listed invoice | Fund | `InvoiceFunded`, status `Funded` |
| Payer repays funded invoice | Simulate Repayment | `InvoiceRepaid`, status `Repaid` |
| Investor claims repaid invoice | Claim | `RepaymentClaimed`, status `Claimed` |
| Verifier rejects submitted invoice | Reject | `InvoiceRejected`, status `Rejected` |
| Verifier marks default | Mark Default | `InvoiceDefaulted`, status `Defaulted` |
| Exporter cancels unfunded invoice | Cancel | `InvoiceCancelled`, status `Cancelled` |

## Open Design Decisions Before Phase 1 Contract Build
- Whether `list_invoice` must be explicit or auto-triggered by `verify_invoice`.
- Whether repayment must be exact amount or at-least amount.
- Whether `mark_default` requires due-date + grace-period validation.
- How to represent verifier/admin split in production governance.
- Whether `claim_repayment` should remain available when protocol is paused.
- Stablecoin naming and mint policy for devnet (`USDT` branding vs actual mint source).

## Out of Scope in Phase 0
- No Anchor/Rust program implementation.
- No deployment scripts.
- No frontend wallet/transaction integration.
- No API/backend implementation changes.
