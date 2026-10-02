//! Rust-side smoke test with anchor-litesvm. Run `anchor build` first; the .so is embedded.
//! SPL Mint state is injected with `set_account` instead of going through the token program.

use anchor_lang::{system_program, InstructionData, ToAccountMetas};
use anchor_litesvm::{AnchorLiteSVM, Keypair, Pubkey, Signer, TestHelpers};
use pred_provable::{
    accounts, instruction, CreateMarketArgs, Market, Outcome, ResolverKind, Side, MARKET_SEED,
    POSITION_SEED, SPL_MINT_LEN, SPL_TOKEN_PROGRAM_ID,
};
use solana_account::Account;

const SOL: u64 = 1_000_000_000;

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

    let market_id = 7u64;
    let (market, _) = Pubkey::find_program_address(
        &[
            MARKET_SEED,
            sponsor.pubkey().as_ref(),
            &market_id.to_le_bytes(),
        ],
        &pred_provable::ID,
    );
    let position = |owner: &Keypair| {
        Pubkey::find_program_address(
            &[POSITION_SEED, market.as_ref(), owner.pubkey().as_ref()],
            &pred_provable::ID,
        )
        .0
    };

    let create = ix(
        accounts::CreateMarket {
            sponsor: sponsor.pubkey(),
            market,
            sponsor_position: position(&sponsor),
            target: mint,
            metric_account: mint,
            system_program: system_program::ID,
        },
        instruction::CreateMarket {
            args: CreateMarketArgs {
                market_id,
                kind: ResolverKind::SupplyAtMost,
                metric_threshold: 500_000,
                cutoff_slot: 100,
                deadline_slot: 200,
                sponsor_stake: 2 * SOL,
            },
        },
    );
    ctx.execute_instruction(create, &[&sponsor])
        .unwrap()
        .assert_success();

    let bet = |bettor: &Keypair| {
        ix(
            accounts::PlaceBet {
                bettor: bettor.pubkey(),
                market,
                position: position(bettor),
                metric_account: mint,
                system_program: system_program::ID,
            },
            instruction::PlaceBet {
                side: Side::Yes,
                amount: SOL,
            },
        )
    };
    ctx.execute_instruction(bet(&doer), &[&doer])
        .unwrap()
        .assert_success();

    // The doer burns past the threshold; a sniper trying to buy the known outcome is rejected.
    ctx.svm
        .set_account(mint, mint_account(400_000, None))
        .unwrap();
    let sniped = ctx.execute_instruction(bet(&sniper), &[&sniper]).unwrap();
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

    let before = ctx.svm.get_balance(&doer.pubkey()).unwrap();
    let claim = ix(
        accounts::Claim {
            owner: doer.pubkey(),
            market,
            position: position(&doer),
        },
        instruction::Claim {},
    );
    ctx.execute_instruction(claim, &[&doer])
        .unwrap()
        .assert_success();
    // 1 SOL own stake + 2 SOL bounty, plus position rent, minus the tx fee.
    assert!(ctx.svm.get_balance(&doer.pubkey()).unwrap() - before > 3 * SOL - 10_000);
}
