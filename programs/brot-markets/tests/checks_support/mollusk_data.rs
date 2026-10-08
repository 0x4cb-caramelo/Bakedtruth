//! Purpose: what the checks negatives run in Mollusk: the config's bytes and the two admin
//!          instructions in the frozen slot order, built from the crate's own structs, with the
//!          accounts of a fresh deployment and the outside accounts a test swaps in.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio), lane A

use brot_markets::{
    constants::{BPF_LOADER_UPGRADEABLE_ID as LOADER, EVENT_AUTHORITY},
    instructions::admin::{initialize_config::InitializeConfigArgs, set_team::SetTeamArgs},
    instructions::ix,
    layout::{LeU16, LeU32, LeU64, ZeroCopy},
    state::config::{CreationParams, GlobalConfig},
    state::{AccountTag, LAYOUT_VERSION},
    ID,
};
use mollusk_svm::program::{create_program_account_loader_v3, keyed_account_for_system_program};
use solana_account::Account;
use solana_instruction::{AccountMeta, Instruction};
use solana_pubkey::Pubkey;

use super::{key, Accounts, World, AUTHORITY_FUNDS, SOL, SYSTEM};

/// The Pyth SOL/USD feed id (D-f).
const SOL_USD_FEED: [u8; 32] = [
    0xef, 0x0d, 0x8b, 0x6f, 0xda, 0x2c, 0xeb, 0xa4, 0x1d, 0xa1, 0x5d, 0x40, 0x95, 0xd1, 0xda, 0x39,
    0x2a, 0x0d, 0x2f, 0x8e, 0xd0, 0xc6, 0xc7, 0xbc, 0x0f, 0x4c, 0xfa, 0xc8, 0xc2, 0x80, 0xb5, 0x6d,
];

/// The creation parameters of the founder's decisions, as `tests/brot/flows.ts` has them.
pub fn default_params() -> CreationParams {
    CreationParams {
        opening_fee_usd: LeU64::new(500),
        opening_prize_bps: LeU16::new(9_000),
        fee_bps: LeU16::new(1_000),
        one_sided_fee_bps: LeU16::new(100),
        creator_share_bps: LeU16::new(100),
        max_open_campaigns: LeU32::new(1_000),
        min_entry_lamports: LeU64::new(10_000_000),
        sol_usd_feed_id: SOL_USD_FEED,
        max_price_age: LeU32::new(120),
        max_price_conf_bps: LeU16::new(50),
        campaign_max_age: LeU32::new(120),
    }
}

/// A loader-owned ProgramData account (state 3, a slot, `Option<Pubkey>`, some code).
pub fn program_data(authority: Option<&Pubkey>) -> Account {
    let mut data = 3u32.to_le_bytes().to_vec();
    data.extend_from_slice(&1u64.to_le_bytes());
    match authority {
        Some(authority) => {
            data.push(1);
            data.extend_from_slice(authority.as_ref());
        }
        None => data.extend_from_slice(&[0; 33]),
    }
    data.extend_from_slice(&[0x7F; 64]);
    Account {
        lamports: SOL,
        data,
        owner: LOADER,
        executable: false,
        rent_epoch: 0,
    }
}

/// A PDA of `seeds` under this program with a valid bump below the canonical one.
pub fn non_canonical(seeds: &[&[u8]]) -> Pubkey {
    let (_, canonical) = Pubkey::find_program_address(seeds, &ID);
    (0..canonical)
        .rev()
        .find_map(|bump| {
            let bump_seed = [bump];
            let mut with_bump = seeds.to_vec();
            with_bump.push(&bump_seed);
            Pubkey::create_program_address(&with_bump, &ID).ok()
        })
        .expect("a valid bump below the canonical one")
}

/// `instruction` with slot `index` replaced by `meta`.
pub fn with_slot(mut instruction: Instruction, index: usize, meta: AccountMeta) -> Instruction {
    instruction.accounts[index] = meta;
    instruction
}

fn instruction(discriminator: u8, args: &[u8], accounts: Vec<AccountMeta>) -> Instruction {
    let mut data = vec![discriminator];
    data.extend_from_slice(args);
    Instruction {
        program_id: ID,
        accounts,
        data,
    }
}

impl World {
    /// The config as `admin_initialize_config` leaves it, with no team.
    pub fn config_data(&self) -> Vec<u8> {
        let mut data = vec![0u8; GlobalConfig::LEN];
        let config = GlobalConfig::from_bytes_mut(&mut data).expect("exact length");
        config.tag = AccountTag::GlobalConfig as u8;
        config.version = LAYOUT_VERSION;
        config.bump = self.config_bump;
        config.fee_vault_bump = self.fee_vault_bump;
        config.admin = self.admin;
        config.fee_recipient = self.fee_recipient;
        config.params = default_params();
        data
    }

    /// `admin_initialize_config` signed by the upgrade authority.
    pub fn init_ix(&self) -> Instruction {
        let (admin, fee_recipient, params) = (self.admin, self.fee_recipient, default_params());
        let args = InitializeConfigArgs {
            admin,
            fee_recipient,
            params,
        };
        let accounts = vec![
            AccountMeta::new(self.authority, true),
            AccountMeta::new(self.config, false),
            AccountMeta::new(self.fee_vault, false),
            AccountMeta::new_readonly(self.program_data, false),
            AccountMeta::new_readonly(SYSTEM, false),
            AccountMeta::new_readonly(EVENT_AUTHORITY, false),
            AccountMeta::new_readonly(ID, false),
        ];
        instruction(ix::ADMIN_INITIALIZE_CONFIG, args.as_bytes(), accounts)
    }

    /// The accounts of a fresh deployment for `init_ix`: nothing exists at either PDA yet.
    pub fn init_accounts(&self) -> Accounts {
        vec![
            (self.authority, Account::new(AUTHORITY_FUNDS, 0, &SYSTEM)),
            (self.config, Account::default()),
            (self.fee_vault, Account::default()),
            (self.program_data, program_data(Some(&self.authority))),
            keyed_account_for_system_program(),
            (EVENT_AUTHORITY, Account::default()),
            (ID, create_program_account_loader_v3(&ID)),
        ]
    }

    /// `admin_set_team` signed by the admin, setting one team key.
    pub fn set_team_ix(&self) -> Instruction {
        let mut team = [Pubkey::default(); 5];
        team[0] = key(0x7E);
        let args = SetTeamArgs { team_len: 1, team };
        let accounts = vec![
            AccountMeta::new_readonly(self.admin, true),
            AccountMeta::new(self.config, false),
            AccountMeta::new_readonly(EVENT_AUTHORITY, false),
            AccountMeta::new_readonly(ID, false),
        ];
        instruction(ix::ADMIN_SET_TEAM, args.as_bytes(), accounts)
    }

    /// The accounts of `set_team_ix` with `config` at the config address.
    pub fn set_team_accounts(&self, config: Account) -> Accounts {
        vec![
            (self.admin, Account::new(SOL, 0, &SYSTEM)),
            (self.config, config),
            (EVENT_AUTHORITY, Account::default()),
            (ID, create_program_account_loader_v3(&ID)),
        ]
    }
}
