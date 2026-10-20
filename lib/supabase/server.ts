import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client.
 * Uses the SERVICE ROLE KEY (bypasses RLS) for all server-side operations.
 * This is safe because it only runs on the server (API routes, Server Components).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer service role key for server-side; fall back to anon key
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return createMockClient();
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createMockClient() {
  const noOp = async () => ({ data: null, error: new Error('Supabase not configured') });
  const mockQuery: Record<string, unknown> = {};
  const chain = () => mockQuery;
  ['select','insert','update','upsert','delete','eq','neq','in','gte','lte',
   'like','ilike','order','limit','range','maybeSingle','throwOnError'].forEach(m => {
    mockQuery[m] = chain;
  });
  mockQuery['single'] = noOp;
  mockQuery['then'] = (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null, count: 0 });

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: null }),
      },
    },
    from: (_table: string) => mockQuery,
    rpc: async () => ({ data: null, error: null }),
    storage: {
      from: () => ({
        upload: noOp,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as ReturnType<typeof createSupabaseClient>;
}
