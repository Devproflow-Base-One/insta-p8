import { createClient } from "@lumina/db-shim"

type DbClient = ReturnType<typeof createClient>

let _admin: DbClient | null = null

/**
 * Privileged DB client — L1 migration (2026-09-15)
 *
 * COMPAT SHIM — DO NOT REMOVE. Keeps the historical `getSupabaseAdmin` export
 * and this filename so `lib/unlock-tracking.ts` / `lib/supabase-migrate.ts`
 * keep working. Now backed by @lumina/db-shim over DATABASE_URL
 * (central-postgres-vps1). Self-hosted Postgres has no PostgREST role
 * separation; authorization is enforced in route handlers.
 *
 * Used for: schema migrations, server-side background work, unlock-attempt
 * tracking. Never expose to the client.
 */
export function getSupabaseAdmin(): DbClient {
  if (_admin) return _admin
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!url) {
    throw new Error("[db-admin] Missing DATABASE_URL (central-postgres-vps1)")
  }
  _admin = createClient(url, "")
  return _admin
}
