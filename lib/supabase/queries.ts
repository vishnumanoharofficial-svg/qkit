import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { PropertyListing } from '@/lib/types';

/**
 * Queries lib — always uses service role key for reliable server-side access.
 * No mock data fallbacks: if DB is unavailable, return empty arrays.
 */

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export async function getListings(filters?: {
  status?: string;
  transaction_type?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const supabase = getClient();
    let query = supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary)', { count: 'exact' });

    if (filters?.status)           query = (query as any).eq('status', filters.status);
    if (filters?.transaction_type) query = (query as any).eq('transaction_type', filters.transaction_type);

    query = (query as any).order('created_at', { ascending: false });

    if (filters?.offset !== undefined && filters?.limit) {
      query = (query as any).range(filters.offset, filters.offset + filters.limit - 1);
    } else if (filters?.limit) {
      query = (query as any).limit(filters.limit);
    }

    const { data, error, count } = await (query as any);
    if (error) throw error;
    return { data: data ?? [], count: count ?? 0, error: null };
  } catch (e) {
    console.error('getListings error:', e);
    return { data: [] as PropertyListing[], count: 0, error: e };
  }
}

export async function getListingBySlug(slug: string) {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary,sort_order)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function createListing(listing: Partial<PropertyListing>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('property_listings')
    .insert([listing as any])
    .select()
    .single();
  return { data, error };
}

export async function updateListingStatus(id: string, status: string, extra?: Record<string, unknown>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('property_listings')
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteListing(id: string) {
  const supabase = getClient();
  const { error } = await supabase
    .from('property_listings')
    .delete()
    .eq('id', id);
  return { error };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  try {
    const supabase = getClient();
    const [published, pending, allListings, users, enquiries] = await Promise.all([
      supabase.from('property_listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('property_listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('property_listings').select('id', { count: 'exact', head: true }),
      supabase.from('app_users').select('id', { count: 'exact', head: true }),
      supabase.from('enquiries').select('id', { count: 'exact', head: true }),
    ]);
    return {
      total_listings:   (allListings.count  ?? 0),
      published_listings: (published.count  ?? 0),
      pending_listings: (pending.count      ?? 0),
      total_users:      (users.count        ?? 0),
      total_enquiries:  (enquiries.count    ?? 0),
      // alias used by admin page
      verified_listings: (published.count   ?? 0),
      featured_listings: 0,
    };
  } catch (e) {
    console.error('getDashboardStats error:', e);
    return {
      total_listings: 0, published_listings: 0, pending_listings: 0,
      total_users: 0, total_enquiries: 0, verified_listings: 0, featured_listings: 0,
    };
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(limit = 50) {
  try {
    const supabase = getClient();
    const { data, error, count } = await supabase
      .from('app_users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return { data: data ?? [], count: count ?? 0 };
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
