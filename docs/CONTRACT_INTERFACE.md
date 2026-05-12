# vade_finance Contract Interface (Phase 0)

## Scope
This document defines a **non-implementation** interface for the Solana MVP program `vade_finance`.
No deployment, no frontend integration, and no on-chain code is included in Phase 0.

## Product Flow (MVP)
`Exporter creates invoice -> Verifier lists it -> Investor funds -> Payer repays (simulated) -> Investor claims`

MVP constraints:
- One invoice has one investor.
- No fractional ownership.
- No private document data on-chain.
- PDFs remain off-chain.
- On-chain stores hashes, lifecycle status, and payment state only.
- Settlement token is mock stablecoin on devnet (USDT/USDC-style SPL mint).

## Program
- Program name: `vade_finance`
- Network target: `Solana Devnet` (MVP)

## Actors
- `admin`: protocol config authority
- `verifier`: verification/listing authority
- `exporter`: creates and optionally cancels own invoice before funding
- `investor`: funds listed invoice and claims repayment
- `payer`: party that sends repayment funds into invoice vault

## Status Enum
Canonical lifecycle statuses:
- `Submitted`
- `Verified`
- `Listed`
- `Funded`
- `Repaid`
- `Claimed`
- `Rejected`
- `Defaulted`
- `Cancelled`

Happy path:
`Submitted -> Verified -> Listed -> Funded -> Repaid -> Claimed`

## PDA Seeds
- `config`: `["config"]`
- `invoice`: `["invoice", exporter_pubkey, invoice_id_hash]`
- `invoice_vault`: `["invoice_vault", invoice_pubkey]`
- `vault_authority`: `["vault_authority", invoice_pubkey]`

## Accounts

### PlatformConfig
| Field | Type | Notes |
|---|---|---|
| `admin` | `Pubkey` | Admin authority |
| `verifier` | `Pubkey` | Verifier authority |
| `treasury` | `Pubkey` | Token account or treasury owner (MVP decision pending) |
| `stable_mint` | `Pubkey` | Allowed settlement mint |
| `platform_fee_bps` | `u16` | Fee in basis points |
| `paused` | `bool` | Protocol pause switch |
| `bump` | `u8` | PDA bump |

### Invoice
| Field | Type | Notes |
|---|---|---|
| `invoice_id_hash` | `[u8; 32]` | Hash of external invoice identifier |
| `document_hash` | `[u8; 32]` | Hash of invoice/legal documents |
| `metadata_hash` | `[u8; 32]` | Hash of normalized metadata blob |
| `exporter` | `Pubkey` | Invoice creator |
| `investor` | `Option<Pubkey>` | Set once funded |
| `face_value` | `u64` | Expected repayment principal |
| `purchase_price` | `u64` | Investor funding amount |
| `repayment_amount` | `u64` | Amount payer must repay |
| `platform_fee_bps` | `u16` | Fee snapshot at creation/funding |
| `due_ts` | `i64` | Due timestamp (unix seconds) |
| `created_ts` | `i64` | Creation timestamp |
| `verified_ts` | `Option<i64>` | Verification timestamp |
| `funded_ts` | `Option<i64>` | Funding timestamp |
| `repaid_ts` | `Option<i64>` | Repayment timestamp |
| `claimed_ts` | `Option<i64>` | Claim timestamp |
| `risk_score` | `u8` | MVP bounded score (see checks) |
| `status` | `u8/enum` | Lifecycle status |
| `bumps` | struct | Stored bumps for invoice/vault PDAs |

## Instruction Interface

### 1) `initialize_platform`
- Args:
  - `verifier: Pubkey`
  - `treasury: Pubkey`
  - `stable_mint: Pubkey`
  - `platform_fee_bps: u16`
- Accounts:
  - `admin` signer
  - `platform_config` PDA (`["config"]`)
  - `system_program`
- Allowed caller: `admin`
- Status transition: N/A
- Checks:
  - Config must be uninitialized.
  - `platform_fee_bps` within max bound.
- Effects:
  - Creates and stores protocol config.
- Event: `PlatformInitialized`

### 2) `update_config`
- Args:
  - `new_verifier: Option<Pubkey>`
  - `new_treasury: Option<Pubkey>`
  - `new_platform_fee_bps: Option<u16>`
  - `new_stable_mint: Option<Pubkey>`
- Accounts:
  - `admin` signer
  - `platform_config`
- Allowed caller: `admin`
- Status transition: N/A
- Checks:
  - Caller equals `platform_config.admin`.
  - New fee in bounds.
- Effects:
  - Updates selected config fields.
- Event: `ConfigUpdated`

### 3) `create_invoice`
- Args:
  - `invoice_id_hash: [u8; 32]`
  - `document_hash: [u8; 32]`
  - `metadata_hash: [u8; 32]`
  - `face_value: u64`
  - `purchase_price: u64`
  - `repayment_amount: u64`
  - `due_ts: i64`
  - `risk_score: u8`
- Accounts:
  - `exporter` signer
  - `platform_config`
  - `invoice` PDA
  - `invoice_vault` token account PDA
  - `vault_authority` PDA
  - `stable_mint`
  - `token_program`, `associated_token_program`, `system_program`, `rent`
- Allowed caller: `exporter`
- Status transition: `None -> Submitted`
- Checks:
  - Protocol not paused.
  - Hash inputs not zero.
  - Amount relationships valid (`purchase_price <= face_value`, `repayment_amount >= purchase_price`).
  - Due date in future.
  - Risk score in accepted range.
  - Mint equals config mint.
- Effects:
  - Creates invoice state and vault account.
- Event: `InvoiceCreated`

### 4) `verify_invoice`
- Args:
  - `risk_score: u8` (optional overwrite model can be chosen)
- Accounts:
  - `verifier` signer
  - `platform_config`
  - `invoice`
- Allowed caller: `verifier`
- Status transition: `Submitted -> Verified`
- Checks:
  - Protocol not paused.
  - Caller equals configured verifier.
  - Current status is `Submitted`.
- Effects:
  - Marks verified and sets `verified_ts`.
- Event: `InvoiceVerified`

### 5) `reject_invoice`
- Args:
  - `reason_code: u16` (MVP optional)
- Accounts:
  - `verifier` signer
  - `platform_config`
  - `invoice`
- Allowed caller: `verifier`
- Status transition: `Submitted|Verified -> Rejected`
- Checks:
  - Protocol not paused.
  - Authorized verifier.
  - Invoice not funded.
- Effects:
  - Marks rejected.
- Event: `InvoiceRejected`

### 6) `list_invoice`
- Args: none
- Accounts:
  - `verifier` signer
  - `platform_config`
  - `invoice`
- Allowed caller: `verifier`
- Status transition: `Verified -> Listed`
- Checks:
  - Protocol not paused.
  - Authorized verifier.
  - Current status is `Verified`.
- Effects:
  - Marks listed.
- Event: `InvoiceListed`

### 7) `cancel_invoice`
- Args: none
- Accounts:
  - `exporter` signer
  - `platform_config`
  - `invoice`
- Allowed caller: `exporter` (owner)
- Status transition: `Submitted|Verified|Listed -> Cancelled`
- Checks:
  - Protocol not paused.
  - Caller equals `invoice.exporter`.
  - Not funded.
- Effects:
  - Prevents future funding.
- Event: `InvoiceCancelled`

### 8) `fund_invoice`
- Args: none
- Accounts:
  - `investor` signer
  - `platform_config`
  - `invoice`
  - `investor_token_account`
  - `invoice_vault`
  - `stable_mint`
  - `token_program`
- Allowed caller: `investor`
- Status transition: `Listed -> Funded`
- Checks:
  - Protocol not paused.
  - Current status is `Listed`.
  - Invoice has no investor yet.
  - Investor is not exporter.
  - Token mint matches config.
  - Investor token account valid.
- Effects:
  - Transfers `purchase_price` to vault.
  - Sets `investor` and `funded_ts`.
- Event: `InvoiceFunded`

### 9) `repay_invoice`
- Args:
  - `amount: u64`
- Accounts:
  - `payer` signer
  - `platform_config`
  - `invoice`
  - `payer_token_account`
  - `invoice_vault`
  - `stable_mint`
  - `token_program`
- Allowed caller: `payer`
- Status transition: `Funded -> Repaid`
- Checks:
  - Protocol not paused.
  - Current status is `Funded`.
  - `amount >= repayment_amount` (exact vs minimum open decision).
  - Token mint/account validity.
- Effects:
  - Transfers repayment into vault.
  - Sets `repaid_ts`.
- Event: `InvoiceRepaid`

### 10) `claim_repayment`
- Args: none
- Accounts:
  - `investor` signer
  - `platform_config`
  - `invoice`
  - `invoice_vault`
  - `investor_token_account`
  - `treasury_token_account`
  - `vault_authority`
  - `token_program`
- Allowed caller: `investor` recorded in invoice
- Status transition: `Repaid -> Claimed`
- Checks:
  - Protocol not paused.
  - Current status is `Repaid`.
  - Caller equals `invoice.investor`.
  - Not already claimed.
- Effects:
  - Computes fee from `platform_fee_bps` snapshot.
  - Transfers fee to treasury and remainder to investor.
  - Sets `claimed_ts`.
- Event: `RepaymentClaimed`

### 11) `mark_default`
- Args: none
- Accounts:
  - `verifier` signer
  - `platform_config`
  - `invoice`
- Allowed caller: `verifier` (or admin, open decision)
- Status transition: `Funded -> Defaulted`
- Checks:
  - Protocol not paused.
  - Authorized caller.
  - Current status is `Funded`.
  - Default policy condition met (time-based/manual, open decision).
- Effects:
  - Marks defaulted.
- Event: `InvoiceDefaulted`

### 12) `set_pause`
- Args:
  - `paused: bool`
- Accounts:
  - `admin` signer
  - `platform_config`
- Allowed caller: `admin`
- Status transition: N/A
- Checks:
  - Caller equals config admin.
- Effects:
  - Toggles protocol pause.
- Event: `ProtocolPaused`

## Events
- `PlatformInitialized`
- `ConfigUpdated`
- `InvoiceCreated`
- `InvoiceVerified`
- `InvoiceListed`
- `InvoiceRejected`
- `InvoiceCancelled`
- `InvoiceFunded`
- `InvoiceRepaid`
- `RepaymentClaimed`
- `InvoiceDefaulted`
- `ProtocolPaused`

## Errors
- `ProtocolPaused`
- `Unauthorized`
- `InvalidStatus`
- `InvalidAmount`
- `InvalidDueDate`
- `InvalidHash`
- `AlreadyFunded`
- `CannotFundOwnInvoice`
- `NotRepaid`
- `AlreadyClaimed`
- `FeeTooHigh`
- `InvalidMint`
- `InvalidTokenAccount`
- `InvalidRiskScore`
- `CannotCancelFundedInvoice`
