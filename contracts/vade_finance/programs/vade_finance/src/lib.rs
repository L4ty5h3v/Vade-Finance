use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("3bto824ndCi9jr1zpYrkhUTtGz8JpCvNV2d5ExzdpUqJ");

const MAX_PLATFORM_FEE_BPS: u16 = 1000;
const BPS_DENOMINATOR: u64 = 10_000;
const MAX_RISK_SCORE: u8 = 100;

#[program]
pub mod vade_finance {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>, platform_fee_bps: u16) -> Result<()> {
        require!(platform_fee_bps <= MAX_PLATFORM_FEE_BPS, VadeError::FeeTooHigh);
        require_keys_eq!(ctx.accounts.treasury.mint, ctx.accounts.stable_mint.key(), VadeError::InvalidMint);

        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.verifier = ctx.accounts.verifier.key();
        config.treasury = ctx.accounts.treasury.key();
        config.stable_mint = ctx.accounts.stable_mint.key();
        config.platform_fee_bps = platform_fee_bps;
        config.paused = false;
        config.bump = ctx.bumps.config;

        emit!(PlatformInitialized {
            admin: config.admin,
            verifier: config.verifier,
            treasury: config.treasury,
            stable_mint: config.stable_mint,
            platform_fee_bps,
            ts: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    pub fn create_invoice(
        ctx: Context<CreateInvoice>,
        invoice_id_hash: [u8; 32],
        document_hash: [u8; 32],
        metadata_hash: [u8; 32],
        face_value: u64,
        purchase_price: u64,
        repayment_amount: u64,
        due_ts: i64,
        risk_score: u8,
    ) -> Result<()> {
        let config = &ctx.accounts.config;

        require!(hash_is_valid(&invoice_id_hash), VadeError::InvalidHash);
        require!(hash_is_valid(&document_hash), VadeError::InvalidHash);
        require!(hash_is_valid(&metadata_hash), VadeError::InvalidHash);

        require!(face_value > 0 && purchase_price > 0 && repayment_amount > 0, VadeError::InvalidAmount);
        require!(purchase_price <= face_value, VadeError::InvalidAmount);
        require!(repayment_amount >= purchase_price, VadeError::InvalidAmount);

        let now = Clock::get()?.unix_timestamp;
        require!(due_ts > now, VadeError::InvalidDueDate);
        require!(risk_score <= MAX_RISK_SCORE, VadeError::InvalidRiskScore);

        require_keys_eq!(ctx.accounts.stable_mint.key(), config.stable_mint, VadeError::InvalidMint);

        let invoice = &mut ctx.accounts.invoice;
        invoice.invoice_id_hash = invoice_id_hash;
        invoice.document_hash = document_hash;
        invoice.metadata_hash = metadata_hash;
        invoice.exporter = ctx.accounts.exporter.key();
        invoice.investor = None;
        invoice.face_value = face_value;
        invoice.purchase_price = purchase_price;
        invoice.repayment_amount = repayment_amount;
        invoice.platform_fee_bps = config.platform_fee_bps;
        invoice.due_ts = due_ts;
        invoice.created_ts = now;
        invoice.verified_ts = None;
        invoice.funded_ts = None;
        invoice.repaid_ts = None;
        invoice.claimed_ts = None;
        invoice.risk_score = risk_score;
        invoice.status = InvoiceStatus::Submitted;
        invoice.bump_invoice = ctx.bumps.invoice;
        invoice.bump_invoice_vault = ctx.bumps.invoice_vault;
        invoice.bump_vault_authority = ctx.bumps.vault_authority;

        emit!(InvoiceCreated {
            invoice: invoice.key(),
            exporter: invoice.exporter,
            invoice_id_hash,
            document_hash,
            metadata_hash,
            face_value,
            purchase_price,
            repayment_amount,
            due_ts,
            risk_score,
            ts: now,
        });

        Ok(())
    }

    pub fn verify_invoice(ctx: Context<VerifyInvoice>) -> Result<()> {
        let config = &ctx.accounts.config;
        ensure_verifier_or_admin(ctx.accounts.authority.key(), config)?;

        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.status == InvoiceStatus::Submitted, VadeError::InvalidStatus);

        invoice.status = InvoiceStatus::Verified;
        let now = Clock::get()?.unix_timestamp;
        invoice.verified_ts = Some(now);

        emit!(InvoiceVerified {
            invoice: invoice.key(),
            authority: ctx.accounts.authority.key(),
            ts: now,
        });

        Ok(())
    }

    pub fn list_invoice(ctx: Context<ListInvoice>) -> Result<()> {
        let config = &ctx.accounts.config;
        ensure_verifier_or_admin(ctx.accounts.authority.key(), config)?;

        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.status == InvoiceStatus::Verified, VadeError::InvalidStatus);
        invoice.status = InvoiceStatus::Listed;

        emit!(InvoiceListed {
            invoice: invoice.key(),
            authority: ctx.accounts.authority.key(),
            ts: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn fund_invoice(ctx: Context<FundInvoice>) -> Result<()> {
        let config = &ctx.accounts.config;

        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.investor.is_none(), VadeError::AlreadyFunded);
        require!(invoice.status == InvoiceStatus::Listed, VadeError::InvalidStatus);
        // Demo override: self-funding is allowed so a single wallet can run full lifecycle
        // in live presentations (create -> verify/list -> fund -> repay -> claim).

        require_keys_eq!(ctx.accounts.stable_mint.key(), config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.investor_token_account.mint, config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.exporter_token_account.mint, config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.treasury_token_account.mint, config.stable_mint, VadeError::InvalidMint);

        require_keys_eq!(ctx.accounts.investor_token_account.owner, ctx.accounts.investor.key(), VadeError::InvalidTokenAccount);
        require_keys_eq!(ctx.accounts.exporter_token_account.owner, invoice.exporter, VadeError::InvalidTokenAccount);
        require_keys_eq!(ctx.accounts.treasury_token_account.key(), config.treasury, VadeError::InvalidTokenAccount);

        let purchase_price = invoice.purchase_price;
        let fee_amount = purchase_price
            .checked_mul(u64::from(invoice.platform_fee_bps))
            .ok_or(VadeError::InvalidAmount)?
            .checked_div(BPS_DENOMINATOR)
            .ok_or(VadeError::InvalidAmount)?;
        let exporter_amount = purchase_price.checked_sub(fee_amount).ok_or(VadeError::InvalidAmount)?;

        if fee_amount > 0 {
            let fee_transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.investor_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.investor.to_account_info(),
                },
            );
            token::transfer(fee_transfer_ctx, fee_amount)?;
        }

        if exporter_amount > 0
            && ctx.accounts.investor_token_account.key() != ctx.accounts.exporter_token_account.key()
        {
            let exporter_transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.investor_token_account.to_account_info(),
                    to: ctx.accounts.exporter_token_account.to_account_info(),
                    authority: ctx.accounts.investor.to_account_info(),
                },
            );
            token::transfer(exporter_transfer_ctx, exporter_amount)?;
        }

        invoice.investor = Some(ctx.accounts.investor.key());
        invoice.status = InvoiceStatus::Funded;
        invoice.funded_ts = Some(Clock::get()?.unix_timestamp);

        emit!(InvoiceFunded {
            invoice: invoice.key(),
            investor: ctx.accounts.investor.key(),
            purchase_price,
            fee_amount,
            exporter_amount,
            ts: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn repay_invoice(ctx: Context<RepayInvoice>) -> Result<()> {
        let config = &ctx.accounts.config;

        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.status == InvoiceStatus::Funded, VadeError::InvalidStatus);

        require_keys_eq!(ctx.accounts.stable_mint.key(), config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.payer_token_account.mint, config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.invoice_vault.mint, config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.payer_token_account.owner, ctx.accounts.payer.key(), VadeError::InvalidTokenAccount);

        let repay_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_token_account.to_account_info(),
                to: ctx.accounts.invoice_vault.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(repay_ctx, invoice.repayment_amount)?;

        invoice.status = InvoiceStatus::Repaid;
        invoice.repaid_ts = Some(Clock::get()?.unix_timestamp);

        emit!(InvoiceRepaid {
            invoice: invoice.key(),
            payer: ctx.accounts.payer.key(),
            amount: invoice.repayment_amount,
            ts: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn claim_repayment(ctx: Context<ClaimRepayment>) -> Result<()> {
        let config = &ctx.accounts.config;
        let invoice_key = ctx.accounts.invoice.key();

        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.claimed_ts.is_none(), VadeError::AlreadyClaimed);
        require!(invoice.status == InvoiceStatus::Repaid, VadeError::NotRepaid);

        let investor = invoice.investor.ok_or(VadeError::Unauthorized)?;
        require_keys_eq!(investor, ctx.accounts.investor.key(), VadeError::Unauthorized);

        require_keys_eq!(ctx.accounts.stable_mint.key(), config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.invoice_vault.mint, config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.investor_token_account.mint, config.stable_mint, VadeError::InvalidMint);
        require_keys_eq!(ctx.accounts.investor_token_account.owner, investor, VadeError::InvalidTokenAccount);

        let vault_balance = ctx.accounts.invoice_vault.amount;
        require!(vault_balance > 0, VadeError::InvalidAmount);

        let authority_seeds: &[&[u8]] = &[
            b"vault_authority",
            invoice_key.as_ref(),
            &[invoice.bump_vault_authority],
        ];
        let signer_seeds: &[&[&[u8]]] = &[authority_seeds];

        let claim_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.invoice_vault.to_account_info(),
                to: ctx.accounts.investor_token_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(claim_ctx, vault_balance)?;

        invoice.status = InvoiceStatus::Claimed;
        invoice.claimed_ts = Some(Clock::get()?.unix_timestamp);

        emit!(RepaymentClaimed {
            invoice: invoice.key(),
            investor,
            amount: vault_balance,
            ts: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn mark_default(ctx: Context<MarkDefault>) -> Result<()> {
        let config = &ctx.accounts.config;
        ensure_verifier_or_admin(ctx.accounts.authority.key(), config)?;

        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.status == InvoiceStatus::Funded, VadeError::InvalidStatus);

        // Demo override: allow manual default transition from Funded without strict due-date enforcement
        // so product demos can simulate adverse outcomes deterministically on localnet.
        invoice.status = InvoiceStatus::Defaulted;

        emit!(InvoiceDefaulted {
            invoice: invoice.key(),
            authority: ctx.accounts.authority.key(),
            ts: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + PlatformConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: role authority stored in config
    pub verifier: UncheckedAccount<'info>,
    /// CHECK: validated as token account owned by token program
    pub treasury: Account<'info, TokenAccount>,
    pub stable_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    invoice_id_hash: [u8; 32],
    document_hash: [u8; 32],
    metadata_hash: [u8; 32],
    face_value: u64,
    purchase_price: u64,
    repayment_amount: u64,
    due_ts: i64,
    risk_score: u8,
)]
pub struct CreateInvoice<'info> {
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub exporter: Signer<'info>,
    #[account(
        init,
        payer = exporter,
        space = 8 + Invoice::INIT_SPACE,
        seeds = [b"invoice", exporter.key().as_ref(), invoice_id_hash.as_ref()],
        bump
    )]
    pub invoice: Account<'info, Invoice>,
    /// CHECK: PDA authority for invoice vault transfers
    #[account(
        seeds = [b"vault_authority", invoice.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = exporter,
        token::mint = stable_mint,
        token::authority = vault_authority,
        seeds = [b"invoice_vault", invoice.key().as_ref()],
        bump
    )]
    pub invoice_vault: Account<'info, TokenAccount>,
    pub stable_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct VerifyInvoice<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
}

#[derive(Accounts)]
pub struct ListInvoice<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
}

#[derive(Accounts)]
pub struct FundInvoice<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub investor: Signer<'info>,
    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
    #[account(mut)]
    pub investor_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub exporter_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub stable_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RepayInvoice<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
    #[account(
        mut,
        seeds = [b"invoice_vault", invoice.key().as_ref()],
        bump = invoice.bump_invoice_vault
    )]
    pub invoice_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer_token_account: Account<'info, TokenAccount>,
    pub stable_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRepayment<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub investor: Signer<'info>,
    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
    /// CHECK: PDA authority for invoice vault
    #[account(
        seeds = [b"vault_authority", invoice.key().as_ref()],
        bump = invoice.bump_vault_authority
    )]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"invoice_vault", invoice.key().as_ref()],
        bump = invoice.bump_invoice_vault
    )]
    pub invoice_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub investor_token_account: Account<'info, TokenAccount>,
    pub stable_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MarkDefault<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
}

#[account]
#[derive(InitSpace)]
pub struct PlatformConfig {
    pub admin: Pubkey,
    pub verifier: Pubkey,
    pub treasury: Pubkey,
    pub stable_mint: Pubkey,
    pub platform_fee_bps: u16,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Invoice {
    pub invoice_id_hash: [u8; 32],
    pub document_hash: [u8; 32],
    pub metadata_hash: [u8; 32],
    pub exporter: Pubkey,
    pub investor: Option<Pubkey>,
    pub face_value: u64,
    pub purchase_price: u64,
    pub repayment_amount: u64,
    pub platform_fee_bps: u16,
    pub due_ts: i64,
    pub created_ts: i64,
    pub verified_ts: Option<i64>,
    pub funded_ts: Option<i64>,
    pub repaid_ts: Option<i64>,
    pub claimed_ts: Option<i64>,
    pub risk_score: u8,
    pub status: InvoiceStatus,
    pub bump_invoice: u8,
    pub bump_invoice_vault: u8,
    pub bump_vault_authority: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Copy, PartialEq, Eq)]
pub enum InvoiceStatus {
    Submitted,
    Verified,
    Listed,
    Funded,
    Repaid,
    Claimed,
    Defaulted,
}

#[event]
pub struct PlatformInitialized {
    pub admin: Pubkey,
    pub verifier: Pubkey,
    pub treasury: Pubkey,
    pub stable_mint: Pubkey,
    pub platform_fee_bps: u16,
    pub ts: i64,
}

#[event]
pub struct InvoiceCreated {
    pub invoice: Pubkey,
    pub exporter: Pubkey,
    pub invoice_id_hash: [u8; 32],
    pub document_hash: [u8; 32],
    pub metadata_hash: [u8; 32],
    pub face_value: u64,
    pub purchase_price: u64,
    pub repayment_amount: u64,
    pub due_ts: i64,
    pub risk_score: u8,
    pub ts: i64,
}

#[event]
pub struct InvoiceVerified {
    pub invoice: Pubkey,
    pub authority: Pubkey,
    pub ts: i64,
}

#[event]
pub struct InvoiceListed {
    pub invoice: Pubkey,
    pub authority: Pubkey,
    pub ts: i64,
}

#[event]
pub struct InvoiceFunded {
    pub invoice: Pubkey,
    pub investor: Pubkey,
    pub purchase_price: u64,
    pub fee_amount: u64,
    pub exporter_amount: u64,
    pub ts: i64,
}

#[event]
pub struct InvoiceRepaid {
    pub invoice: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
    pub ts: i64,
}

#[event]
pub struct RepaymentClaimed {
    pub invoice: Pubkey,
    pub investor: Pubkey,
    pub amount: u64,
    pub ts: i64,
}

#[event]
pub struct InvoiceDefaulted {
    pub invoice: Pubkey,
    pub authority: Pubkey,
    pub ts: i64,
}

#[error_code]
pub enum VadeError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid status transition")]
    InvalidStatus,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid due date")]
    InvalidDueDate,
    #[msg("Invalid hash")]
    InvalidHash,
    #[msg("Invoice already funded")]
    AlreadyFunded,
    #[msg("Exporter cannot fund own invoice")]
    CannotFundOwnInvoice,
    #[msg("Invoice is not repaid")]
    NotRepaid,
    #[msg("Repayment already claimed")]
    AlreadyClaimed,
    #[msg("Platform fee too high")]
    FeeTooHigh,
    #[msg("Invalid stable mint")]
    InvalidMint,
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("Invalid risk score")]
    InvalidRiskScore,
}

fn ensure_verifier_or_admin(authority: Pubkey, config: &PlatformConfig) -> Result<()> {
    require!(authority == config.admin || authority == config.verifier, VadeError::Unauthorized);
    Ok(())
}

fn hash_is_valid(hash: &[u8; 32]) -> bool {
    hash.iter().any(|byte| *byte != 0)
}
