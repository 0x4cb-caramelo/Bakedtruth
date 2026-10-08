/**
 * Purpose: the program's addresses for the LiteSVM tests: ids, seeds, discriminators, PDAs and
 *          the known outside accounts (Pyth, the loader). Mirrors programs/brot-markets/src
 *          (constants.rs, instructions/mod.rs).
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); frozen at the sprint's opening with the program's contract
 */
import { address, getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";

export const PROGRAM_ID = address("6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN");
export const PROGRAM_SO = "target/deploy/brot_markets.so";
export const SYSTEM_PROGRAM_ID = address("11111111111111111111111111111111");
export const LOADER_V3_ID = address("BPFLoaderUpgradeab1e11111111111111111111111");
export const PYTH_RECEIVER_ID = address("rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp");
export const PYTH_LEGACY_RECEIVER_ID = address("rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ");
export const PYTH_PUSH_ORACLE_ID = address("pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou");
/** PDA `["__event_authority"]` of the program (bump 254), checked in tests/brot/kit.test.ts. */
export const EVENT_AUTHORITY = address("E5CgcK5xs4YfPdBLnCWTAA9ruStbTqLjEzTxtVaRuB5o");

export const hex = (h: string) => Uint8Array.from(h.match(/../g)!.map((b) => parseInt(b, 16)));
export const SOL_USD_FEED_ID = hex("ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d");
export const BTC_USD_FEED_ID = hex("e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43");
/** The sponsored push-oracle accounts (shard 0), the same on devnet and mainnet. */
export const SOL_USD_ACCOUNT = address("7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE");
export const BTC_USD_ACCOUNT = address("APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5");

export const SOL = 1_000_000_000n;
export const DAY = 86_400n;
export const HOUR = 3_600n;

/** Instruction discriminators: the first byte of the instruction data. */
export const IX = {
  ADMIN_INITIALIZE_CONFIG: 0,
  ADMIN_SET_TEAM: 1,
  ADMIN_SET_CREATION_PARAMS: 2,
  ADMIN_SET_FEE_RECIPIENT: 3,
  ADMIN_TRANSFER_ADMIN: 4,
  ADMIN_ACCEPT_ADMIN: 5,
  TEAM_PAUSE_ENTRIES: 6,
  ADMIN_RESUME_ENTRIES: 7,
  USER_OPEN_CAMPAIGN: 8,
  USER_JOIN_CAMPAIGN: 9,
  EMIT_EVENT: 0xff,
} as const;

export const ReaderKind = {
  PriceTouch: 0,
  SupplyAtMost: 1,
  DammV2LockedAtLeast: 2,
  StakePoolTvlAtLeast: 3,
  StakeAtLeast: 4,
} as const;
export const Status = { Open: 0, InReview: 1, Contested: 2, Settling: 3, Settled: 4 } as const;
export const Side = { Yes: 0, No: 1 } as const;
export const Direction = { Above: 0, Below: 1 } as const;
export const OperatingLevel = { Normal: 0, EntriesHalted: 1 } as const;
export const ConfigChange = { Team: 0, CreationParams: 1, FeeRecipient: 2, PendingAdmin: 3, Admin: 4 } as const;
export const AccountTag = { GlobalConfig: 1, Campaign: 2, Entry: 3 } as const;

const text = (s: string) => new TextEncoder().encode(s);
const key = (a: Address) => getAddressEncoder().encode(a);
export const u64le = (v: bigint) => {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, v, true);
  return b;
};

type Seeds = Parameters<typeof getProgramDerivedAddress>[0]["seeds"];
const pda = async (seeds: Seeds, programAddress: Address = PROGRAM_ID) =>
  (await getProgramDerivedAddress({ programAddress, seeds }))[0];

export const configPda = () => pda([text("config")]);
export const feeVaultPda = () => pda([text("fee_vault")]);
export const campaignPda = (id: bigint) => pda([text("campaign"), u64le(id)]);
export const vaultPda = (campaign: Address) => pda([text("vault"), key(campaign)]);
export const entryPda = (campaign: Address, baker: Address) => pda([text("entry"), key(campaign), key(baker)]);
export const eventAuthorityPda = () => pda([text("__event_authority")]);
/** The program's ProgramData account under the upgradeable loader. */
export const programDataPda = () => pda([key(PROGRAM_ID)], LOADER_V3_ID);
/** The sponsored Pyth account of a feed: seeds `[shard 0 as u16 LE, feed_id]` under the push oracle. */
export const sponsoredPriceAccount = (feedId: Uint8Array) => pda([new Uint8Array([0, 0]), feedId], PYTH_PUSH_ORACLE_ID);
