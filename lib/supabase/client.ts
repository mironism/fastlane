import { createBrowserClient } from '@supabase/ssr';

// Create a single instance that will be reused
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Return existing instance if it exists
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new instance only if it doesn't exist
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseClient;
}

// Export the client directly for hooks that need a stable reference
export const supabase = createClient(); 