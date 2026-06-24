// Server-side dispatcher: looks up emails + listing/place/profile data,
// then invokes send-transactional-email for the right template.
// Triggered by the client after an exchange request is created or its status changes.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

type EventType = 'created' | 'accepted' | 'declined'

interface RequestBody {
  exchange_request_id: string
  event: EventType
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return iso
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const { exchange_request_id, event } = body
  if (!exchange_request_id || !event) {
    return jsonResponse({ error: 'exchange_request_id and event are required' }, 400)
  }
  if (!['created', 'accepted', 'declined'].includes(event)) {
    return jsonResponse({ error: 'Invalid event' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Fetch exchange request with listing + place
  const { data: request, error: reqError } = await supabase
    .from('exchange_requests')
    .select('id, from_user_id, to_member_id, message, start_date, end_date, number_of_guests, status, listings(id, title, places(name))')
    .eq('id', exchange_request_id)
    .maybeSingle()

  if (reqError || !request) {
    console.error('Exchange request not found', { exchange_request_id, reqError })
    return jsonResponse({ error: 'Exchange request not found' }, 404)
  }

  // Fetch profiles (for display names)
  const userIds = [request.from_user_id, request.to_member_id]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .in('user_id', userIds)

  const guestProfile = profiles?.find((p) => p.user_id === request.from_user_id)
  const hostProfile = profiles?.find((p) => p.user_id === request.to_member_id)

  // Fetch emails from auth.users via admin API
  const { data: guestUser } = await supabase.auth.admin.getUserById(request.from_user_id)
  const { data: hostUser } = await supabase.auth.admin.getUserById(request.to_member_id)

  const guestEmail = guestUser?.user?.email
  const hostEmail = hostUser?.user?.email

  const listing: any = request.listings || {}
  const placeName: string | undefined = listing?.places?.name

  const baseData = {
    guestName: guestProfile?.display_name,
    hostName: hostProfile?.display_name,
    listingTitle: listing?.title,
    placeName,
    startDate: formatDate(request.start_date),
    endDate: formatDate(request.end_date),
    guests: request.number_of_guests ?? undefined,
    message: request.message ?? undefined,
  }

  // Build the list of emails to dispatch for this event
  const dispatches: Array<{ template: string; to?: string; data: Record<string, unknown>; key: string }> = []

  if (event === 'created') {
    if (guestEmail) {
      dispatches.push({
        template: 'exchange-request-sent',
        to: guestEmail,
        data: baseData,
        key: `exchange-${request.id}-sent`,
      })
    }
    if (hostEmail) {
      dispatches.push({
        template: 'exchange-request-received',
        to: hostEmail,
        data: baseData,
        key: `exchange-${request.id}-received`,
      })
    }
  } else if (event === 'accepted') {
    if (guestEmail) {
      dispatches.push({
        template: 'exchange-request-accepted',
        to: guestEmail,
        data: baseData,
        key: `exchange-${request.id}-accepted`,
      })
    }
  } else if (event === 'declined') {
    if (guestEmail) {
      dispatches.push({
        template: 'exchange-request-declined',
        to: guestEmail,
        data: baseData,
        key: `exchange-${request.id}-declined`,
      })
    }
  }

  if (dispatches.length === 0) {
    console.warn('No recipients found for exchange notification', { event, exchange_request_id })
    return jsonResponse({ success: true, sent: 0, warning: 'No recipients' })
  }

  // Invoke send-transactional-email for each dispatch (direct fetch avoids JWT forwarding issues)
  const results = await Promise.allSettled(
    dispatches.map(async (d) => {
      const resp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: d.template,
          recipientEmail: d.to,
          idempotencyKey: d.key,
          templateData: d.data,
        }),
      })
      const result = await resp.json()
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${JSON.stringify(result)}`)
      return result
    })
  )

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length > 0) {
    console.error('Some dispatches failed', { failed })
  }

  return jsonResponse({
    success: true,
    sent: results.length - failed.length,
    failed: failed.length,
  })
})
