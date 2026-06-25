// Stripe webhook. On `checkout.session.completed` for a membership payment, records
// the payment on member_verification (service role — trusted server context).
// verify_jwt is false: authenticity is enforced via the Stripe signature.

import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response('Server configuration error', { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() })
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch (err) {
    console.error('Webhook signature verification failed', (err as Error).message)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id ?? (session.metadata?.user_id as string | undefined)
    if (userId) {
      const admin = createClient(supabaseUrl, serviceKey)
      const now = new Date().toISOString()
      const { error } = await admin
        .from('member_verification')
        .upsert(
          { user_id: userId, payment_method: 'stripe', paid_at: now, updated_at: now },
          { onConflict: 'user_id' },
        )
      if (error) {
        console.error('Failed to record membership payment', error.message)
        return new Response('DB error', { status: 500 })
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
