//! Rust-side smoke test with anchor-litesvm. Run `anchor build` first; the .so is embedded.
//! The metric mint, the USDC mint and USDC balances are injected with `set_account`; the
//! outcome mints and the vault are real, created by the program through the SPL Token
//! program that LiteSVM ships.

use anchor_lang::{system_program, InstructionData, ToAccountMetas};
use anchor_litesvm::{AnchorLiteSVM, Pubkey, Signer, TestHelpers};
use anchor_spl::associated_token::{self, get_associated_token_address};
use anchor_spl::token;
use pred_provable::{
    accounts, instruction, CreateMarketArgs, Market, Outcome, ResolverKind, MARKET_SEED,
    NO_MINT_SEED, SPL_MINT_LEN, SPL_TOKEN_ACCOUNT_LEN, SPL_TOKEN_PROGRAM_ID, USDC_MINT, VAULT_SEED,
    YES_MINT_SEED,
};
use solana_account::Account;

const SOL: u64 = 1_000_000_000;
const USDC: u64 = 1_000_000;

fn token_amount(ctx: &anchor_litesvm::AnchorContext, account: &Pubkey) -> u64 {
    let data = ctx.svm.get_account(account).unwrap().data;
    u64::from_le_bytes(data[64..72].try_into().unwrap())
}

fn mint_account(supply: u64, authority: Option<Pubkey>) -> Account {
    let mut data = vec![0u8; SPL_MINT_LEN];
    if let Some(authority) = authority {
        data[0..4].copy_from_slice(&1u32.to_le_bytes());
        data[4..36].copy_from_slice(authority.as_ref());
    }
    data[36..44].copy_from_slice(&supply.to_le_bytes());
    data[44] = 6;
    data[45] = 1;
    Account {
        lamports: SOL,
        data,
        owner: SPL_TOKEN_PROGRAM_ID,
        executable: false,
        rent_epoch: 0,
    }
}

/// An initialized SPL token account holding `amount` of `mint` for `owner`.
fn token_account(mint: &Pubkey, owner: &Pubkey, amount: u64) -> Account {
    let mut data = vec![0u8; SPL_TOKEN_ACCOUNT_LEN];
    data[0..32].copy_from_slice(mint.as_ref());
    data[32..64].copy_from_slice(owner.as_ref());
    data[64..72].copy_from_slice(&amount.to_le_bytes());
    data[108] = 1;
    Account {
        lamports: SOL,
        data,
        owner: SPL_TOKEN_PROGRAM_ID,
        executable: false,
        rent_epoch: 0,
    }
}

/// Gives `owner` an associated USDC account holding `amount` and returns its address.
fn fund_usdc(ctx: &mut anchor_litesvm::AnchorContext, owner: &Pubkey, amount: u64) -> Pubkey {
    let account = get_associated_token_address(owner, &USDC_MINT);
    ctx.svm
        .set_account(account, token_account(&USDC_MINT, owner, amount))
        .unwrap();
    account
}

fn ix<A: ToAccountMetas, D: InstructionData>(accounts: A, data: D) -> anchor_litesvm::Instruction {
    anchor_litesvm::Instruction {
        program_id: pred_provable::ID,
        accounts: accounts.to_account_metas(None),
        data: data.data(),
    }
}

#[test]
fn burn_goal_pays_yes_and_blocks_snipers() {
    let mut ctx = AnchorLiteSVM::build_with_program(
        pred_provable::ID,
        include_bytes!("../../../target/deploy/pred_provable.so"),
    );
    ctx.svm.warp_to_slot(1);

    let sponsor = ctx.svm.create_funded_account(10 * SOL).unwrap();
    let doer = ctx.svm.create_funded_account(10 * SOL).unwrap();
    let sniper = ctx.svm.create_funded_account(10 * SOL).unwrap();
    let mint = Pubkey::new_unique();
    ctx.svm
        .set_account(mint, mint_account(1_000_000, None))
        .unwrap();
    ctx.svm
        .set_account(USDC_MINT, mint_account(1_000_000 * USDC, None))
        .unwrap();
    let sponsor_usdc = fund_usdc(&mut ctx, &sponsor.pubkey(), 10 * USDC);
    let doer_usdc = fund_usdc(&mut ctx, &doer.pubkey(), 10 * USDC);
    fund_usdc(&mut ctx, &sniper.pubkey(), 10 * USDC);

    let market_id = 7u64;
    let (market, _) = Pubkey::find_program_address(
        &[
            MARKET_SEED,
            sponsor.pubkey().as_ref(),
            &market_id.to_le_bytes(),
        ],
        &pred_provable::ID,
    );
    let (yes_mint, _) =
        Pubkey::find_program_address(&[YES_MINT_SEED, market.as_ref()], &pred_provable::ID);
    let (no_mint, _) =
        Pubkey::find_program_address(&[NO_MINT_SEED, market.as_ref()], &pred_provable::ID);
    let (vault, _) =
        Pubkey::find_program_address(&[VAULT_SEED, market.as_ref()], &pred_provable::ID);
    let doer_yes = get_associated_token_address(&doer.pubkey(), &yes_mint);

    let create = ix(
        accounts::CreateMarket {
            sponsor: sponsor.pubkey(),
            market,
            yes_mint,
            no_mint,
            usdc_mint: USDC_MINT,
            vault,
            sponsor_usdc_account: sponsor_usdc,
            target: mint,
            metric_account: mint,
            token_program: token::ID,
            system_program: system_program::ID,
        },
        instruction::CreateMarket {
            args: CreateMarketArgs {
                market_id,
                kind: ResolverKind::SupplyAtMost,
                metric_threshold: 500_000,
                cutoff_slot: 100,
                deadline_slot: 200,
                yes_price_bps: 1_000,
                sponsor_budget: 2 * USDC,
            },
        },
    );
    ctx.execute_instruction(create, &[&sponsor])
        .unwrap()
        .assert_success();

    let buy = |buyer: &Pubkey| {
        ix(
            accounts::BuyYes {
                buyer: *buyer,
                market,
                metric_account: mint,
                yes_mint,
                buyer_yes_account: get_associated_token_address(buyer, &yes_mint),
                usdc_mint: USDC_MINT,
                vault,
                buyer_usdc_account: get_associated_token_address(buyer, &USDC_MINT),
                token_program: token::ID,
                associated_token_program: associated_token::ID,
                system_program: system_program::ID,
            },
            instruction::BuyYes { amount: USDC },
        )
    };
    ctx.execute_instruction(buy(&doer.pubkey()), &[&doer])
        .unwrap()
        .assert_success();
    assert_eq!(token_amount(&ctx, &doer_yes), USDC);
    // The sponsor's NO is booked on the market, not minted to a token account it controls.
    let state: Market = ctx.get_account(&market).unwrap();
    assert_eq!(state.sponsor_no, USDC);
    assert!(!ctx.account_exists(&get_associated_token_address(&sponsor.pubkey(), &no_mint)));
    // 2 USDC budget + 0.1 USDC price; the budget covered the other 0.9.
    assert_eq!(token_amount(&ctx, &vault), 2 * USDC + USDC / 10);

    // The doer burns past the threshold; a sniper trying to buy the known outcome is rejected.
    ctx.svm
        .set_account(mint, mint_account(400_000, None))
        .unwrap();
    let sniped = ctx
        .execute_instruction(buy(&sniper.pubkey()), &[&sniper])
        .unwrap();
    assert!(!sniped.is_success());
    assert!(sniped.logs().iter().any(|l| l.contains("MetricAlreadyMet")));

    let resolve = ix(
        accounts::Resolve {
            market,
            metric_account: mint,
        },
        instruction::Resolve {},
    );
    ctx.execute_instruction(resolve, &[&doer])
        .unwrap()
        .assert_success();
    let state: Market = ctx.get_account(&market).unwrap();
    assert_eq!(state.outcome, Outcome::Yes);

    let before = token_amount(&ctx, &doer_usdc);
    let redeem = ix(
        accounts::Redeem {
            owner: doer.pubkey(),
            market,
            winning_mint: yes_mint,
            owner_tokens: doer_yes,
            usdc_mint: USDC_MINT,
            vault,
            owner_usdc_account: doer_usdc,
            token_program: token::ID,
        },
        instruction::Redeem {},
    );
    ctx.execute_instruction(redeem, &[&doer])
        .unwrap()
        .assert_success();
    // 1 USDC per YES, paid out of the vault.
    assert_eq!(token_amount(&ctx, &doer_usdc) - before, USDC);
    assert_eq!(token_amount(&ctx, &vault), 2 * USDC + USDC / 10 - USDC);
    assert!(!ctx.account_exists(&doer_yes));
}
