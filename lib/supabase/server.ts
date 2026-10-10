import type { CookieOptions } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return createMockClient();
  }

  // Dynamic import so build doesn't fail without env vars
  const { createServerClient } = require('@supabase/ssr');
  const { cookies } = require('next/headers');
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Components
        }
      },
    },
  });
}

function createMockClient() {
  const noOp = async () => ({ data: null, error: new Error('Supabase not configured') });
  const mockQuery: Record<string, unknown> = {};
  const chain = () => mockQuery;
  ['select','insert','update','upsert','delete','eq','neq','in','gte','lte',
   'like','ilike','order','limit','range'].forEach(m => { mockQuery[m] = chain; });
  mockQuery['single'] = noOp;
  mockQuery['then'] = (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null, count: 0 });

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: (_table: string) => mockQuery,
    storage: {
      from: () => ({
        upload: noOp,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as ReturnType<typeof import('@supabase/ssr').createServerClient>;
}
