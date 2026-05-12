# vade_finance State Machine (Phase 0)

## Canonical States
- `Submitted`
- `Verified`
- `Listed`
- `Funded`
- `Repaid`
- `Claimed`
- `Rejected`
- `Defaulted`
- `Cancelled`

## Primary Lifecycle
`Submitted -> Verified -> Listed -> Funded -> Repaid -> Claimed`

## Transition Matrix
| From | Action | To | Caller |
|---|---|---|---|
| `None` | `create_invoice` | `Submitted` | Exporter |
| `Submitted` | `verify_invoice` | `Verified` | Verifier |
| `Submitted` | `reject_invoice` | `Rejected` | Verifier |
| `Submitted` | `cancel_invoice` | `Cancelled` | Exporter |
| `Verified` | `list_invoice` | `Listed` | Verifier |
| `Verified` | `reject_invoice` | `Rejected` | Verifier |
| `Verified` | `cancel_invoice` | `Cancelled` | Exporter |
| `Listed` | `fund_invoice` | `Funded` | Investor |
| `Listed` | `cancel_invoice` | `Cancelled` | Exporter |
| `Funded` | `repay_invoice` | `Repaid` | Payer |
| `Funded` | `mark_default` | `Defaulted` | Verifier/Admin (TBD) |
| `Repaid` | `claim_repayment` | `Claimed` | Investor |

Terminal states in MVP:
- `Claimed`
- `Rejected`
- `Defaulted`
- `Cancelled`

## Invariants
- One invoice has at most one investor.
- Funding is all-or-nothing (no fractional tranches).
- `investor` is immutable after funding.
- Invoice cannot be cancelled once funded.
- Private invoice content never stored on-chain.
- Only document/metadata hashes are stored on-chain.
- Settlement token mint must equal `PlatformConfig.stable_mint`.

## Pause Semantics
When `PlatformConfig.paused = true`:
- Mutating lifecycle instructions should fail with `ProtocolPaused`.
- Recommended allowed operations while paused:
  - `set_pause` (admin only)
  - optional read-only RPCs/events (off-chain indexers continue to read)

Open choice:
- Whether `claim_repayment` should remain allowed during pause for user fund safety.

## Time and Default Rules
- `due_ts` must be future at creation.
- `mark_default` currently modeled as explicit authority action, not automatic cron.
- Optional rule for production:
  - allow default only if `now > due_ts + grace_period`.

## Consistency With Existing `/app` Flow
Current app already models and exposes:
- statuses: `Submitted`, `Verified`, `Listed`, `Funded`, `Repaid`, `Rejected`, `Defaulted`
- actions: create, verify, reject, fund, simulate repayment, mark default

State machine additions for contract completeness:
- `Cancelled`
- `Claimed`

## Security Notes
- Enforce signer checks per role for every transition.
- Enforce status preconditions strictly.
- Use checked arithmetic for fee and payout calculations.
- Validate all token accounts and mint ownership.
- Snapshot fee at invoice level to avoid retroactive fee changes.
- Consider replay/front-run mitigation via strict status transitions and PDA derivations.

## Test Matrix (State Machine)
| Scenario | Expected Result |
|---|---|
| Create with valid inputs | `Submitted` |
| Verify from `Submitted` | `Verified` |
| List from `Verified` | `Listed` |
| Fund from `Listed` by non-exporter | `Funded` |
| Fund from non-`Listed` | `InvalidStatus` |
| Fund own invoice | `CannotFundOwnInvoice` |
| Repay from `Funded` | `Repaid` |
| Claim before repaid | `NotRepaid` |
| Claim from `Repaid` by investor | `Claimed` |
| Claim twice | `AlreadyClaimed` |
| Cancel funded invoice | `CannotCancelFundedInvoice` |
| Pause then try mutate | `ProtocolPaused` |
| Wrong mint/token account | `InvalidMint`/`InvalidTokenAccount` |

## Open Design Decisions
- Exact role for `mark_default`: verifier only vs verifier + admin.
- Should `claim_repayment` be allowed when protocol is paused.
- Repay amount policy: exact equal vs greater-or-equal and refund logic.
- Treasury account model: treasury owner PDA vs explicit treasury token account.
- Risk score schema: bounded numeric only vs enum classes with off-chain mapping.
