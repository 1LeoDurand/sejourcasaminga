// Creates a Stripe Checkout Session for the membership fee and returns its URL.
// The authenticated member is identified from their JWT; the webhook later records
// the payment using the session's client_reference_id (= user id).

import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!supabaseUrl || !serviceKey || !stripeKey) {
    return json({ error: 'Server configuration error' }, 500)
  }

  // Identify the caller from their JWT.
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const admin = createClient(supabaseUrl, serviceKey)
  const { data: { user }, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !user) return json({ error: 'Unauthorized' }, 401)

  // Price is the single source of truth (euros) -> Stripe expects cents.
  const { data: priceEur } = await admin.rpc('get_membership_price')
  const unitAmount = Math.round(Number(priceEur ?? 89) * 100)

  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() })
  const origin = req.headers.get('origin') ?? 'https://sejour.casaminga.com'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: { name: 'Adhésion Casa Minga Séjours' },
        },
      }],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      metadata: { user_id: user.id, kind: 'membership' },
      success_url: `${origin}/verification?paid=1`,
      cancel_url: `${origin}/verification?canceled=1`,
    })
    return json({ url: session.url })
  } catch (e) {
    console.error('Stripe session error', (e as Error).message)
    return json({ error: 'Could not create checkout session' }, 500)
  }
})
