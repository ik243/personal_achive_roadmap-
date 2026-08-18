import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./env";

export function createClient() {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured || !url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}

export function isSupabaseEnabled() {
  return getSupabaseConfig().isConfigured;
}
