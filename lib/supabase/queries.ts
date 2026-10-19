import { createClient } from '@/lib/supabase/server';
import { MOCK_LISTINGS, MOCK_STATS } from '@/lib/mock-data';
import type { PropertyListing } from '@/lib/types';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('your-project');
};

// ─── Listings ─────────────────────────────────────────────────────────────────

export async function getListings(filters?: {
  status?: string;
  transaction_type?: string;
  limit?: number;
  offset?: number;
}) {
  if (!isSupabaseConfigured()) {
    return { data: MOCK_LISTINGS, count: MOCK_LISTINGS.length, error: null };
  }
  try {
    const supabase = createClient();
    let query = (supabase as any)
      .from('property_listings')
      .select('*, media:property_media(*), locality:localities(*, city:cities(*))', { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.transaction_type) query = query.eq('transaction_type', filters.transaction_type);
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);

    query = query.order('created_at', { ascending: false });
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0, error: null };
  } catch (e) {
    console.error('getListings error:', e);
    return { data: MOCK_LISTINGS, count: MOCK_LISTINGS.length, error: null };
  }
}

export async function getListingBySlug(slug: string) {
  if (!isSupabaseConfigured()) {
    return MOCK_LISTINGS.find(l => l.slug === slug) || null;
  }
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from('property_listings')
      .select('*, media:property_media(*), locality:localities(*, city:cities(*))')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  } catch {
    return MOCK_LISTINGS.find(l => l.slug === slug) || null;
  }
}

export async function createListing(listing: Partial<PropertyListing>) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('property_listings')
    .insert([listing])
    .select()
    .single();
  return { data, error };
}

export async function updateListingStatus(id: string, status: string) {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('property_listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteListing(id: string) {
  const supabase = createClient();
  const { error } = await (supabase as any)
    .from('property_listings')
    .delete()
    .eq('id', id);
  return { error };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) return MOCK_STATS;
  try {
    const supabase = createClient();
    const [listings, pending, users, featured] = await Promise.all([
      (supabase as any).from('property_listings').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      (supabase as any).from('property_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
      (supabase as any).from('property_listings').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    ]);
    return {
      total_listings: listings.count || 0,
      pending_listings: pending.count || 0,
      total_users: users.count || 0,
      featured_listings: featured.count || 0,
    };
  } catch {
    return MOCK_STATS;
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(limit = 50) {
  if (!isSupabaseConfigured()) return { data: [], count: 0 };
  try {
    const supabase = createClient();
    const { data, error, count } = await (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  } catch {
    return { data: [], count: 0 };
  }
}

// ─── Slug generator ───────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now().toString(36);
}
