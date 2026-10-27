use anchor_lang::prelude::*;

declare_id!("FEdxfZUSTb9eUd74A4WiYbPkGjYxkdwGhSgbf1xWb9iB");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        c.authority = ctx.accounts.authority.key();
        c.count = 0;
        c.bump = ctx.bumps.counter;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        c.count = c.count.checked_add(1).ok_or(CounterError::Overflow)?;
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", authority.key().as_ref()], bump)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, seeds = [b"counter", authority.key().as_ref()], bump = counter.bump,
        has_one = authority @ CounterError::Unauthorized)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum CounterError {
    #[msg("Only the counter's authority can do this")]
    Unauthorized,
    #[msg("Counter overflowed")]
    Overflow,
}
