import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/locations/popular
 * Returns taluks and town/panchayats that have published listings,
 * ordered by listing count descending.
 * Used to power the "Explore by Location" cards on the homepage.
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch all published listings — just the location columns we need
    const { data, error } = await supabase
      .from('property_listings')
      .select('taluk, town_panchayat, city')
      .eq('status', 'published');

    if (error) throw error;

    const rows = data ?? [];

    // Count by town_panchayat first (most specific)
    const townCount: Record<string, number> = {};
    const talukCount: Record<string, number> = {};

    for (const row of rows) {
      const town = row.town_panchayat || row.city;
      const taluk = row.taluk;

      if (town && town.toLowerCase() !== 'kottayam') {
        townCount[town] = (townCount[town] ?? 0) + 1;
      }
      if (taluk) {
        talukCount[taluk] = (talukCount[taluk] ?? 0) + 1;
      }
    }

    // Build town entries (filter: at least 1 listing)
    const towns = Object.entries(townCount)
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({
        name,
        type: 'town' as const,
        count,
        filterKey: 'town_panchayat',
        filterValue: name,
      }));

    // Build taluk entries — only include if not already well-covered by towns
    const taluks = Object.entries(talukCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        type: 'taluk' as const,
        count,
        filterKey: 'taluk',
        filterValue: name,
      }));

    // Merge: show towns first, then any taluk not already represented
    const townTaluks = new Set(
      towns.map(t => {
        // Find which taluk this town belongs to — approximate by checking if taluk name is substring
        const tl = Object.keys(talukCount).find(tk =>
          t.name.toLowerCase().includes(tk.toLowerCase()) ||
          tk.toLowerCase().includes(t.name.toLowerCase())
        );
        return tl ?? '';
      })
    );

    const extraTaluks = taluks.filter(t => !townTaluks.has(t.name)).slice(0, 3);

    const locations = [...towns, ...extraTaluks].slice(0, 10);

    return NextResponse.json({ locations, total: rows.length });
  } catch (err) {
    console.error('[GET /api/locations/popular]', err);
    return NextResponse.json({ locations: [], total: 0 });
  }
}
