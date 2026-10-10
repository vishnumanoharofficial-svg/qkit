import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// POST /api/payments/create-order
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { plan_id, listing_id, amount_paise } = await request.json();
    if (!amount_paise || amount_paise < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create Razorpay order server-side
    const rzpKeyId     = process.env.RZP_KEY_ID!;
    const rzpKeySecret = process.env.RZP_KEY_SECRET!;
    const auth = Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString('base64');

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount:   amount_paise,
        currency: 'INR',
        notes:    { user_id: user.id, plan_id: plan_id || '', listing_id: listing_id || '' },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.text();
      throw new Error(`Razorpay order creation failed: ${err}`);
    }

    const rzpOrder = await rzpRes.json();

    // Store order in DB
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        listing_id: listing_id || null,
        plan_id:    plan_id    || null,
        amount:     amount_paise,
        currency:   'INR',
        status:     'created',
        razorpay_order_id: rzpOrder.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      order_id:    order.id,
      rzp_order_id: rzpOrder.id,
      amount:      amount_paise,
      currency:    'INR',
      key_id:      rzpKeyId,
    });
  } catch (err) {
    console.error('[POST /api/payments/create-order]', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
