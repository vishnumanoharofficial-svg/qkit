import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// POST /api/payments/verify — called after Razorpay checkout completes
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // Server-side signature verification — NEVER trust client-side verification
    const body       = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RZP_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      console.warn('[payments/verify] Signature mismatch', { razorpay_order_id, user_id: user.id });
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Fetch our order record
    const { data: dbOrder, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .single();

    if (orderErr || !dbOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Record verified payment
    const { error: payErr } = await supabase.from('payments').insert({
      order_id: dbOrder.id,
      razorpay_payment_id,
      razorpay_signature,
      status:      'verified',
      verified_at: new Date().toISOString(),
    });
    if (payErr) throw payErr;

    // Mark order as paid
    await supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', dbOrder.id);

    // Activate promotion / subscription based on plan
    if (dbOrder.plan_id) {
      const { data: plan } = await supabase.from('plans').select('*').eq('id', dbOrder.plan_id).single();
      if (plan) {
        const expiresAt = new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from('subscriptions').insert({
          user_id:    user.id,
          plan_id:    plan.id,
          status:     'active',
          starts_at:  new Date().toISOString(),
          expires_at: expiresAt,
        });
        // If listing-based promotion
        if (dbOrder.listing_id && ['featured','premium'].includes(plan.type)) {
          await supabase.from('property_listings')
            .update({ is_featured: true, updated_at: new Date().toISOString() })
            .eq('id', dbOrder.listing_id);
          await supabase.from('promotions').insert({
            listing_id: dbOrder.listing_id,
            type:       'featured',
            starts_at:  new Date().toISOString(),
            ends_at:    expiresAt,
            order_id:   dbOrder.id,
          });
        }
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'payment_verified',
      entity_type: 'payments', entity_id: dbOrder.id,
      new_value: { razorpay_payment_id, amount: dbOrder.amount },
    });

    return NextResponse.json({ success: true, payment_id: razorpay_payment_id });
  } catch (err) {
    console.error('[POST /api/payments/verify]', err);
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}
