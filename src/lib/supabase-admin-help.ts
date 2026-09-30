import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only client on the ADMIN database (not the sejour one), used only by the
 * help center (help_categories / help_articles + two anonymous RPCs).
 * The anon key is public. If the variables are missing the client is null and
 * the help pages show an "unavailable" state instead of crashing.
 */
const url = import.meta.env.VITE_HELP_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_HELP_SUPABASE_ANON_KEY as string | undefined;

export const helpSupabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;
