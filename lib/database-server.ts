import { createClient } from "@lumina/db-shim"

/**
 * Database server client — L1 migration (2026-09-15)
 *
 * COMPAT SHIM — DO NOT REMOVE. Keeps the historical `getDatabaseServerClient`
 * export so all API routes work unchanged. Underneath, queries now run on
 * self-hosted PostgreSQL via @lumina/db-shim (PostgREST-compatible surface
 * over `pg`), pointed at DATABASE_URL (central-postgres-vps1).
 *
 * The former @supabase/ssr cookie client is gone: nothing in this app calls
 * `.auth.*` (Supabase Auth never had users here) — cookies were vestigial.
 * See docs/05-audit/L1-supabase-residual-audit-2026-09-15.md.
 */
export async function getDatabaseServerClient() {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL || ""
  return createClient(url, "")
}
