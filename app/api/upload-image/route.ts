import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

const BUCKET = 'property-images';
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// POST /api/upload-image — authenticated image upload for property listings
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Please log in to upload images' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WebP' }, { status: 400 });
    }
    if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
      return NextResponse.json({ error: `File too large. Max ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `properties/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    // Auto-create bucket if missing
    if (error?.message.includes('not found') || error?.message.includes('Bucket')) {
      await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE_MB * 1024 * 1024,
        allowedMimeTypes: ALLOWED_TYPES,
      });
      const retry = await supabase.storage
        .from(BUCKET)
        .upload(fileName, buffer, { contentType: file.type, upsert: false });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[upload-image]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return NextResponse.json({ url: urlData.publicUrl, path: fileName });
  } catch (err) {
    console.error('[POST /api/upload-image]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
