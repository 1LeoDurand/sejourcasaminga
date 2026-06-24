// Server-side dispatcher for new-message notifications.
// Looks up the conversation, recipient(s) and sender, then enqueues
// a transactional email via send-transactional-email for each recipient
// other than the sender.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  message_id: string
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
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

  const { message_id } = body
  if (!message_id) {
    return jsonResponse({ error: 'message_id is required' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Fetch the message + conversation + listing
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_user_id, content, conversations(id, listings(title))')
    .eq('id', message_id)
    .maybeSingle()

  if (msgError || !message) {
    console.error('Message not found', { message_id, msgError })
    return jsonResponse({ error: 'Message not found' }, 404)
  }

  // All conversation participants
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', message.conversation_id)

  const recipientIds = (participants || [])
    .map((p) => p.user_id)
    .filter((id) => id !== message.sender_user_id)

  if (recipientIds.length === 0) {
    return jsonResponse({ success: true, sent: 0, warning: 'No recipients' })
  }

  // Sender display name
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', message.sender_user_id)
    .maybeSingle()

  // Recipients profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .in('user_id', recipientIds)

  const listing: any = (message as any).conversations?.listings
  const listingTitle: string | undefined = listing?.title

  const trimmedPreview = (message.content || '').trim()
  const messagePreview =
    trimmedPreview.length > 200 ? `${trimmedPreview.slice(0, 200)}…` : trimmedPreview

  // Resolve emails + send
  const dispatches = await Promise.all(
    recipientIds.map(async (uid) => {
      const { data: userResp } = await supabase.auth.admin.getUserById(uid)
      const email = userResp?.user?.email
      if (!email) return null
      const profile = profiles?.find((p) => p.user_id === uid)
      return {
        to: email,
        data: {
          recipientName: profile?.display_name,
          senderName: senderProfile?.display_name,
          messagePreview,
          conversationId: message.conversation_id,
          listingTitle,
        },
        key: `message-${message.id}-to-${uid}`,
      }
    })
  )

  const valid = dispatches.filter((d): d is NonNullable<typeof d> => d !== null)

  const results = await Promise.allSettled(
    valid.map(async (d) => {
      const resp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: 'new-message',
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
    console.error('Some new-message dispatches failed', { failed })
  }

  return jsonResponse({
    success: true,
    sent: results.length - failed.length,
    failed: failed.length,
  })
})
