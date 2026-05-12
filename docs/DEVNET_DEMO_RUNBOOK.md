# Vade Devnet Demo Runbook

This runbook is for the live simulation flow:

1. Wallet A (Exporter/Verifier): create invoice, verify, list
2. Wallet B (Investor): fund invoice
3. Wallet C (Payer): repay invoice
4. Wallet B (Investor): claim repayment

## 1) Deploy contract to devnet

```bash
cd contracts/vade_finance
export PATH="$HOME/.cargo/bin:$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana config set --url devnet
npm run deploy:devnet
```

If deploy fails with insufficient funds, fund `~/.config/solana/id.json` on devnet and retry.

## 2) Bootstrap mint + config

```bash
cd contracts/vade_finance
npm run bootstrap:devnet
```

Bootstrap does:
- creates 6-decimal mock USDT mint
- creates treasury ATA
- calls `initialize_platform(150)`
- writes `contracts/vade_finance/devnet-config.json`
- updates root `.env.local` with `NEXT_PUBLIC_VADE_*`

## 3) Mint demo USDT to wallets

```bash
cd contracts/vade_finance
npm run mint:devnet -- <WALLET_A_PUBKEY> 50000
npm run mint:devnet -- <WALLET_B_PUBKEY> 50000
npm run mint:devnet -- <WALLET_C_PUBKEY> 50000
```

## 4) Run frontend

```bash
cd /Users/sergeyromanov/hack4
npm run dev
```

Open `/app` and connect wallets.

## 5) Live demo flow in UI

### Wallet A (Verifier/Admin)
- Connect Wallet A
- Role: Exporter
- Portfolio -> Create Invoice
- Verification -> Verify
- Verification -> List

### Wallet B (Investor)
- Switch wallet in top-right wallet menu
- Role: Investor
- Marketplace -> Fund Invoice

### Wallet C (Payer)
- Switch wallet
- Verification -> Simulate Repayment

### Wallet B (Investor)
- Switch back to Wallet B
- Verification -> Claim

## Notes
- `Reject` is intentionally not wired to on-chain because Phase 1 scope did not include `reject_invoice`.
- All settlement uses base units with 6 decimals under the hood.
- No backend is used; interactions are direct wallet -> devnet transactions.
