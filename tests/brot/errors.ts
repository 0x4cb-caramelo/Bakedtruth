/**
 * Purpose: the program's custom error codes by name, so tests assert the exact refusal (X0.7). The map
 *          moved to the SDK in Sprint 05 (packages/sdk/src/read/errors/codes.ts); the kit re-exports it,
 *          and tests/brot/idl.test.ts and tests/sdk/contract-source.test.ts check it against error.rs.
 * Version: 0.0.3
 * Sprint:  02 (pot core on Pinocchio); 6071 to 6090 in 03, 6091 to 6147 in 04; the SDK's since 05
 */
export { BROT_ERROR_CODES as BrotError, type BrotErrorName } from "@brot/sdk/read";
