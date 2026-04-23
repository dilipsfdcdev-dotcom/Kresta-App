/**
 * Supabase database types.
 *
 * This file is a STUB for Phase 1. After running the stack at least once,
 * regenerate with:
 *
 *     npm run gen:types
 *
 * which calls `supabase gen types typescript --local` and overwrites this
 * file with the actual schema. Supabase-js queries will then be fully typed.
 *
 * Until then we keep the types permissive so the foundation scaffolding
 * compiles without hand-rolled types that drift from the real schema.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Domain-level enums kept for use in the UI. These mirror the Postgres ENUMs
// declared in the migrations. When database types are regenerated these will
// be re-exported from there instead.
export type ProjectStatus = "Planning" | "Acquiring" | "Selling" | "Completed";
export type AccountType = "Savings" | "Current" | "CashOnHand" | "Other";
export type UserRole = "owner" | "admin" | "staff" | "viewer";
