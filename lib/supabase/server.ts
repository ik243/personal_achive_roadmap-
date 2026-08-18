import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabaseClientEnv } from "./env";

export async function createClient() {
  const { url, anonKey } = assertSupabaseClientEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component context — ignore
        }
      },
    },
  });
}
