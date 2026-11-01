import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600; // regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.qyukit.in';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/properties`,  lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/buy`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/rent`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/lease`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/commercial`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/about`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/post-property`,lastModified: new Date(), changeFrequency: 'monthly',priority: 0.6 },
    { url: `${base}/privacy`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // Dynamic property listing pages
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data } = await supabase
      .from('property_listings')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000);

    propertyPages = (data ?? []).map((p) => ({
      url: `${base}/property/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // Silently skip dynamic pages if DB unreachable at build time
  }

  return [...staticPages, ...propertyPages];
}
