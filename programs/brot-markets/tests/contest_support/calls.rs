//! Purpose: the contest's four instructions for the Mollusk tests (Sprint 14, lane L14B), in the frozen slot order
//!          with every account they name (open, re-read, decide, and the lapse through `finalize_campaign`), run on
//!          the program's SBF binary at a clock the test sets; and what a test reads back.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B)

use brot_markets::{
    constants::EVENT_AUTHORITY,
    instructions::ix,
    layout::ZeroCopy,
    state::{config::GlobalConfig, enums::OperatingLevel},
    ID,
};
use mollusk_svm::{program::create_program_account_loader_v3, result::InstructionResult};
use solana_account::Account;
use solana_instruction::{AccountMeta, Instruction};
use solana_pubkey::Pubkey;

use super::data::{campaign_address, config_data, MINT};
use crate::world::{after, World, SOL, SYSTEM};

fn wallet() -> Account {
    Account::new(SOL, 0, &SYSTEM)
}

fn event_accounts() -> [(Pubkey, Account); 2] {
    [
        (EVENT_AUTHORITY, Account::default()),
        (ID, create_program_account_loader_v3(&ID)),
    ]
}

fn instruction(discriminator: u8, args: &[u8], accounts: Vec<AccountMeta>) -> Instruction {
    let mut data = vec![discriminator];
    data.extend_from_slice(args);
    let mut metas = accounts;
    metas.push(AccountMeta::new_readonly(EVENT_AUTHORITY, false));
    metas.push(AccountMeta::new_readonly(ID, false));
    Instruction {
        program_id: ID,
        accounts: metas,
        data,
    }
}

/// One contest instruction with every account it names: its signer (a funded wallet), the config, the campaign
/// and, for the re-read, the mint (in the metric and the proof slot).
pub struct Call {
    pub instruction: Instruction,
    pub accounts: Vec<(Pubkey, Account)>,
}

impl Call {
    /// Runs the call with the clock at `now`.
    pub fn at(&self, world: &mut World, now: i64) -> InstructionResult {
        world.mollusk.sysvars.clock.unix_timestamp = now;
        world.run(&self.instruction, &self.accounts)
    }

    /// The same call with `data` as the config (a paused one, say).
    pub fn with_config(mut self, world: &World, data: Vec<u8>) -> Self {
        for (address, account) in self.accounts.iter_mut() {
            if *address == world.config {
                *account = world.owned(data.clone());
            }
        }
        self
    }

    /// The same call with `meta` in slot `index` (and `account` at its address when it is new).
    pub fn with_slot(mut self, index: usize, meta: AccountMeta, account: Account) -> Self {
        if !self
            .accounts
            .iter()
            .any(|(address, _)| *address == meta.pubkey)
        {
            self.accounts.push((meta.pubkey, account));
        }
        self.instruction.accounts[index] = meta;
        self
    }
}

/// `team_open_contest` signed by `signer`; the config of `config_data`.
pub fn open_contest(world: &World, signer: Pubkey, campaign: Vec<u8>) -> Call {
    let (address, ..) = campaign_address();
    let metas = vec![
        AccountMeta::new_readonly(signer, true),
        AccountMeta::new_readonly(world.config, false),
        AccountMeta::new(address, false),
    ];
    let config = config_data(world, OperatingLevel::Normal);
    let mut accounts = vec![(signer, wallet()), (world.config, world.owned(config))];
    accounts.push((address, world.owned(campaign)));
    accounts.extend(event_accounts());
    let instruction = instruction(ix::TEAM_OPEN_CONTEST, &[], metas);
    Call {
        instruction,
        accounts,
    }
}

/// `reread_campaign` by no signer, `metric` at the mint's address in the metric slot (and in the proof slot, which
/// this kind never reads); the config of `config_data`.
pub fn reread(world: &World, campaign: Vec<u8>, metric: Account) -> Call {
    let (address, ..) = campaign_address();
    let metas = vec![
        AccountMeta::new(address, false),
        AccountMeta::new(world.config, false),
        AccountMeta::new_readonly(MINT, false),
        AccountMeta::new_readonly(MINT, false),
    ];
    let config = config_data(world, OperatingLevel::Normal);
    let mut accounts = vec![
        (address, world.owned(campaign)),
        (world.config, world.owned(config)),
    ];
    accounts.push((MINT, metric));
    accounts.extend(event_accounts());
    Call {
        instruction: instruction(ix::REREAD_CAMPAIGN, &[], metas),
        accounts,
    }
}

/// `admin_decide_contest(decision, void_reason, note_hash)` signed by `signer`.
pub fn decide(
    world: &World,
    signer: Pubkey,
    campaign: Vec<u8>,
    args: [u8; 2],
    note: [u8; 32],
) -> Call {
    let (address, ..) = campaign_address();
    let metas = vec![
        AccountMeta::new_readonly(signer, true),
        AccountMeta::new(world.config, false),
        AccountMeta::new(address, false),
    ];
    let config = config_data(world, OperatingLevel::Normal);
    let mut accounts = vec![(signer, wallet()), (world.config, world.owned(config))];
    accounts.push((address, world.owned(campaign)));
    accounts.extend(event_accounts());
    let mut data = args.to_vec();
    data.extend_from_slice(&note);
    Call {
        instruction: instruction(ix::ADMIN_DECIDE_CONTEST, &data, metas),
        accounts,
    }
}

/// `finalize_campaign` by no signer.
pub fn finalize(world: &World, campaign: Vec<u8>) -> Call {
    let (address, ..) = campaign_address();
    let metas = vec![
        AccountMeta::new(address, false),
        AccountMeta::new(world.config, false),
    ];
    let config = config_data(world, OperatingLevel::Normal);
    let mut accounts = vec![
        (address, world.owned(campaign)),
        (world.config, world.owned(config)),
    ];
    accounts.extend(event_accounts());
    Call {
        instruction: instruction(ix::FINALIZE_CAMPAIGN, &[], metas),
        accounts,
    }
}

/// The campaign's bytes after a successful call.
pub fn stored(result: &InstructionResult) -> Vec<u8> {
    after(result, &campaign_address().0).data.clone()
}

/// The config's open count after a successful call.
pub fn open_count(result: &InstructionResult, world: &World) -> u32 {
    let data = &after(result, &world.config).data;
    GlobalConfig::from_bytes(data)
        .expect("exact length")
        .open_campaigns
        .get()
}
