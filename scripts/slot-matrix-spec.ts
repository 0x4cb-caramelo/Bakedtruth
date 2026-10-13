/**
 * Purpose: the expectations of the slot matrix: what each account slot of each instruction is, and
 *          which BrotError a refused mutation gets, from the checks order of checks.rs (arguments,
 *          signer and writable flags, distinct, system and event slots, account loads, roles, rules).
 * Version: 0.0.2
 * Sprint:  04 (lane F: slot matrix). Expectations are predictions from the contract and are checked
 *          by tests/brot/slot-matrix.test.ts at integration. The scaffold of Sprints 14–15 (2026-10-13) adds the
 *          five new instructions, disabled until their lanes, and the slot kinds of `ReferralLink` and `SealedFee`.
 */
import { CAMPAIGN, ENTRY, GLOBAL_CONFIG, JOIN } from "../tests/brot/structs";
import { REFERRAL_LINK, SEALED_FEE } from "../tests/brot/structs-14-15";
import { layoutSize } from "../tests/brot/layouts";

/** What a slot is. Only signers and writable slots are in the matrix; the rest need no kind. */
export type Kind =
  | "admin"
  | "pending"
  | "team"
  | "payer"
  | "stored"
  | "config"
  | "campaign"
  | "entry"
  | "join"
  | "vault"
  | "feeVault"
  | "referral"
  | "sealedFee";

export type Slot = {
  kind: Kind;
  /** The account is created by the instruction: its address is a PDA it derives, never an existing account. */
  create?: boolean;
  /** `stored` only: the error when the wallet is not the stored key, or GAP when no error is named yet. */
  stored?: string;
  /** A stranger's error, or "accept" when a stranger is a valid payer (not a refusal, so no case). */
  stranger?: string;
};

/** A refusal with no named error yet: the case is listed as a gap, not run (see the report). */
export const GAP = "GAP";

const ROLE_ERROR: Partial<Record<Kind, string>> = {
  admin: "NotAdmin",
  pending: "NotPendingAdmin",
  team: "NotTeamMember",
};
export const roleError = (kind: Kind) => ROLE_ERROR[kind];

/** Account types a slot may be given in a type case (the brief's list; `System` is the stranger case). */
export const TYPES = ["Token", "Config", "Campaign", "Entry", "Join"] as const;
/** Sprints 14 and 15's accounts are sources of the alias cases only: no type case gives them to other slots yet. */
export type Source = (typeof TYPES)[number] | "Wallet" | "Vault" | "ReferralLink" | "SealedFee";

/** Data sizes: a zero-data PDA is `Vault`; the rest come from the kit's layouts. */
export const SIZE: Record<Source, number> = {
  Wallet: 0,
  Token: 165,
  Config: layoutSize(GLOBAL_CONFIG),
  Campaign: layoutSize(CAMPAIGN),
  Entry: layoutSize(ENTRY),
  Join: layoutSize(JOIN),
  Vault: 0,
  ReferralLink: layoutSize(REFERRAL_LINK),
  SealedFee: layoutSize(SEALED_FEE),
};

const C = { kind: "config" } as const;
const CAMP = { kind: "campaign" } as const;
const VAULT = { kind: "vault" } as const;
const FEE = { kind: "feeVault" } as const;
const CONFIG_ADMIN = { admin: { kind: "admin" }, config: C } as const;

/** Per instruction: the slots that sign or are writable (the others are not in the matrix). */
export const SPEC: Record<string, Record<string, Slot>> = {
  AdminInitializeConfig: {
    authority: { kind: "payer", stranger: "UpgradeAuthorityMismatch" },
    config: { ...C, create: true },
    feeVault: { ...FEE, create: true },
  },
  AdminSetTeam: CONFIG_ADMIN,
  AdminSetCreationParams: CONFIG_ADMIN,
  AdminSetFeeRecipient: CONFIG_ADMIN,
  AdminTransferAdmin: CONFIG_ADMIN,
  AdminAcceptAdmin: { newAdmin: { kind: "pending" }, config: C },
  TeamPauseEntries: { teamMember: { kind: "team" }, config: C },
  AdminResumeEntries: CONFIG_ADMIN,
  UserOpenCampaign: {
    creator: { kind: "payer", stranger: "accept" },
    config: C,
    campaign: { ...CAMP, create: true },
    vault: { ...VAULT, create: true },
  },
  UserJoinCampaign: {
    baker: { kind: "payer", stranger: "PdaMismatch" },
    campaign: CAMP,
    vault: VAULT,
    entry: { kind: "entry", create: true },
    join: { kind: "join", create: true },
  },
  ResolveCampaign: { campaign: CAMP },
  TeamConfirmResult: { teamMember: { kind: "team" }, config: C, campaign: CAMP },
  TeamVoidCampaign: { teamMember: { kind: "team" }, config: C, campaign: CAMP },
  TeamOpenContest: { teamMember: { kind: "team" }, campaign: CAMP },
  FinalizeCampaign: { campaign: CAMP, config: C },
  SettleEntry: {
    entry: { kind: "entry" },
    campaign: CAMP,
    vault: VAULT,
    baker: { kind: "stored", stored: "WrongBaker" },
  },
  SettleCreatorShare: { campaign: CAMP, vault: VAULT, creator: { kind: "stored", stored: "WrongCreator" } },
  CollectFee: { campaign: CAMP, vault: VAULT, feeVault: FEE },
  SettlePrize: { campaign: CAMP, vault: VAULT, recipient: { kind: "stored", stored: "WrongCreator" } },
  CloseCampaign: {
    campaign: CAMP,
    vault: VAULT,
    rentPayer: { kind: "stored", stored: "RentPayerNotStored" },
    feeVault: FEE,
  },
  SweepFees: { feeVault: FEE, feeRecipient: { kind: "stored", stored: "FeeRecipientMismatch" } },
  TallyLateJoins: { campaign: CAMP, entry: { kind: "entry" }, baker: { kind: "stored", stored: "WrongBaker" } },
  // The scaffold of Sprints 14–15 (2026-10-13): disabled below until each lane lands.
  UserLinkReferrer: {
    referee: { kind: "payer", stranger: "PdaMismatch" },
    referralLink: { kind: "referral", create: true },
  },
  RereadCampaign: { campaign: CAMP, config: C },
  AdminDecideContest: { admin: { kind: "admin" }, config: C, campaign: CAMP },
  SponsorJoinCampaign: {
    sponsor: { kind: "payer", stranger: "PdaMismatch" },
    campaign: CAMP,
    vault: VAULT,
    entry: { kind: "entry", create: true },
    join: { kind: "join", create: true },
    sealedFee: { kind: "sealedFee", create: true },
  },
  SettleSealedFee: {
    sealedFee: { kind: "sealedFee" },
    campaign: CAMP,
    sponsor: { kind: "stored", stored: "WrongSponsor" },
    feeVault: FEE,
  },
};

/**
 * Pairs of writable slots that must hold different accounts (`checks::distinct`, DuplicateAccount):
 * each recipient against the vault, the vault against the fee vault, and the campaign's own pairs
 * the opening and the join already check.
 */
export const DISTINCT: Record<string, [string, string][]> = {
  AdminInitializeConfig: [["config", "feeVault"]],
  UserOpenCampaign: [["campaign", "vault"]],
  UserJoinCampaign: [
    ["campaign", "vault"],
    ["entry", "vault"],
    ["entry", "campaign"],
  ],
  SettleEntry: [["baker", "vault"]],
  SettleCreatorShare: [["creator", "vault"]],
  CollectFee: [["feeVault", "vault"]],
  SettlePrize: [["recipient", "vault"]],
  CloseCampaign: [
    ["rentPayer", "vault"],
    ["feeVault", "vault"],
  ],
  SweepFees: [["feeRecipient", "feeVault"]],
  // Sprint 14, lane L14B: the re-read and the admin's decision check their two writable slots differ first.
  RereadCampaign: [["campaign", "config"]],
  AdminDecideContest: [["config", "campaign"]],
};

/**
 * The program's own refusal where the generic rule guessed another. Each one is the program's check order
 * (owner, length, tag, address; distinct before the loads; a system-owned empty account is closed), read from
 * the instruction. Key: `instruction|category|slot|detail`, detail `Type` for a type case, `with<i>` for an alias.
 */
export const OVERRIDES: Record<string, { expect: string; why: string }> = {
  "UserJoinCampaign|type|entry|Config": {
    expect: "WrongLength",
    why: "length is checked before the PDA (owner, length, tag, PDA)",
  },
  "UserJoinCampaign|type|entry|Campaign": { expect: "WrongLength", why: "length is checked before the PDA" },
  "UserJoinCampaign|type|entry|Join": { expect: "WrongLength", why: "a Join is 96 bytes, not an Entry's 116" },
  "TeamConfirmResult|alias|campaign|with1": {
    expect: "DuplicateAccount",
    why: "distinct from the config runs before the load",
  },
  "TeamVoidCampaign|alias|campaign|with1": {
    expect: "DuplicateAccount",
    why: "distinct from the config runs before the load",
  },
  "FinalizeCampaign|alias|config|with0": {
    expect: "DuplicateAccount",
    why: "distinct before either account is borrowed (no runtime borrow error)",
  },
  "SettleEntry|stranger|entry": { expect: "AlreadySettled", why: "a system-owned empty account is a closed Entry" },
  "UserJoinCampaign|alias|join|with0": {
    expect: "DuplicateAccount",
    why: "checks::distinct against the slot the join must differ from, before any load",
  },
  "UserJoinCampaign|alias|join|with2": {
    expect: "DuplicateAccount",
    why: "checks::distinct against the slot the join must differ from, before any load",
  },
  "UserJoinCampaign|alias|join|with3": {
    expect: "DuplicateAccount",
    why: "checks::distinct against the slot the join must differ from, before any load",
  },
  "UserJoinCampaign|alias|join|with4": {
    expect: "DuplicateAccount",
    why: "checks::distinct against the slot the join must differ from, before any load",
  },
  "TallyLateJoins|stranger|baker": {
    expect: "PdaMismatch",
    why: "tally derives the Entry's address from the baker before comparing the stored key",
  },
  "TallyLateJoins|type|baker|Token": { expect: "PdaMismatch", why: "as above" },
  "TallyLateJoins|type|baker|Config": { expect: "PdaMismatch", why: "as above" },
  "TallyLateJoins|type|baker|Campaign": { expect: "PdaMismatch", why: "as above" },
  "TallyLateJoins|type|baker|Entry": { expect: "PdaMismatch", why: "as above" },
  "TallyLateJoins|type|baker|Join": { expect: "PdaMismatch", why: "as above" },
  "TallyLateJoins|alias|entry|with0": {
    expect: "DuplicateAccount",
    why: "distinct from the campaign precedes the loads",
  },
  "TallyLateJoins|alias|baker|with0": {
    expect: "DuplicateAccount",
    why: "distinct from the campaign precedes the loads",
  },
  "TallyLateJoins|alias|baker|with1": { expect: "DuplicateAccount", why: "distinct from the entry precedes the loads" },
  "SettleEntry|type|campaign|Config": {
    expect: "EntryNotOnCampaign",
    why: "stored_keys compares the entry's campaign before the campaign's length (by design)",
  },
  "SettleEntry|type|campaign|Entry": { expect: "EntryNotOnCampaign", why: "as above" },
  "SettleEntry|type|campaign|Join": { expect: "EntryNotOnCampaign", why: "as above" },
  "SettleEntry|alias|campaign|with0": {
    expect: "DuplicateAccount",
    why: "the entry is the earlier slot; distinct checks the pair",
  },
  "SettleEntry|alias|vault|with0": {
    expect: "DuplicateAccount",
    why: "distinct from the entry precedes the vault's address",
  },
  "SettleEntry|alias|vault|with1": {
    expect: "DuplicateAccount",
    why: "distinct from the campaign precedes the vault's address",
  },
  "CollectFee|alias|feeVault|with1": {
    expect: "PdaMismatch",
    why: "the vault is the program's, the fee vault's address is not",
  },
  "SettlePrize|alias|recipient|with1": {
    expect: "WrongCreator",
    why: "the recipient must be the stored creator before any distinct",
  },
  "CloseCampaign|stranger|campaign": { expect: "AlreadyClosed", why: "a system-owned empty campaign is a closed one" },
  "CloseCampaign|alias|rentPayer|with1": {
    expect: "RentPayerNotStored",
    why: "the stored rent payer is checked before distinct",
  },
  "CloseCampaign|alias|feeVault|with1": {
    expect: "PdaMismatch",
    why: "the fee vault's address is checked before distinct",
  },
  "SweepFees|alias|feeRecipient|with1": {
    expect: "FeeRecipientMismatch",
    why: "the stored fee recipient is checked before distinct",
  },
};

export const overrideOf = (key: string, generic: string) => OVERRIDES[key]?.expect ?? generic;

/**
 * Instructions disabled by decision (2026-10-09), and the stubs of the scaffold of Sprints 14–15 (2026-10-13): every
 * case is refused with the one error. The baseline is refused too, so the matrix checks that the refusal moves no
 * lamport. One entry per line: each lane deletes its own when it lands.
 */
export const DISABLED: Record<string, string> = {
  UserLinkReferrer: "UnknownInstruction",
  SponsorJoinCampaign: "UnknownInstruction",
  SettleSealedFee: "UnknownInstruction",
};

/** The source type of a slot's current account, as a type case or an alias sees it. */
export function typeOf(slot: Slot): Source {
  if (slot.kind === "vault" || slot.kind === "feeVault") return "Vault";
  if (slot.kind === "config") return "Config";
  if (slot.kind === "campaign") return "Campaign";
  if (slot.kind === "entry") return "Entry";
  if (slot.kind === "join") return "Join";
  if (slot.kind === "referral") return "ReferralLink";
  if (slot.kind === "sealedFee") return "SealedFee";
  return "Wallet";
}

/**
 * The error when the account of `src` sits in the writable slot `slot` (the slot's own address is
 * not used: the account is not the one the slot expects). Order: signer, then the account loads.
 */
export function swapError(slot: Slot, src: Source): string {
  if (slot.kind === "payer" || slot.kind === "admin" || slot.kind === "team" || slot.kind === "pending") {
    return "MissingSignature"; // a program account or a token account has no key to sign
  }
  if (slot.kind === "stored") return slot.stored ?? GAP;
  if (slot.create) return "PdaMismatch"; // a created slot names a PDA; any other address fails it
  if (src === "Wallet" || src === "Token") return "WrongOwner";
  if (slot.kind === "vault" || slot.kind === "feeVault") return "PdaMismatch";
  return SIZE[src] !== SIZE[typeOf(slot)] ? "WrongLength" : "WrongTag";
}

/** A stranger in the slot: a fresh System-owned account (or a fresh signer when the slot signs). */
export function strangerError(slot: Slot): string {
  if (slot.kind === "payer") return slot.stranger ?? "accept";
  if (slot.kind === "stored") return slot.stored ?? GAP;
  if (slot.create) return "PdaMismatch";
  return "WrongOwner";
}
