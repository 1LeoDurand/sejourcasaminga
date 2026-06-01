/**
 * process-email-queue — dispatche les emails en attente via Resend.
 * Remplace la passerelle Lovable (sendLovableEmail / LOVABLE_API_KEY).
 *
 * Secrets requis dans Supabase :
 *   RESEND_API_KEY     — clé API Resend (re_xxx)
 *   SUPABASE_URL       — auto-injecté
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injecté
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

const MAX_RETRIES = 5
const DEFAULT_BATCH_SIZE = 10
const DEFAULT_SEND_DELAY_MS = 200
const DEFAULT_AUTH_TTL_MINUTES = 15
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60

type SupabaseClient = ReturnType<typeof createClient>
interface QueueMessage { msg_id: number; read_ct: number; message: Record<string, unknown>; enqueued_at?: string }

function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = parts[1].replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
    return JSON.parse(atob(payload)) as Record<string, unknown>
  } catch { return null }
}

async function moveToDlq(supabase: SupabaseClient, queue: string, msg: QueueMessage, reason: string): Promise<void> {
  const payload = msg.message
  await supabase.from('email_send_log').insert({
    message_id: payload.message_id,
    template_name: (payload.label || queue) as string,
    recipient_email: payload.to,
    status: 'dlq',
    error_message: reason,
  })
  const { error } = await supabase.rpc('move_to_dlq', {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload,
  })
  if (error) console.error('Failed to move message to DLQ', { queue, msg_id: msg.msg_id, reason, error })
}

async function sendViaResend(apiKey: string, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: payload.from as string,
      to: payload.to as string,
      subject: payload.subject as string,
      html: payload.html as string,
      text: payload.text as string,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err: { status: number; message: string; retryAfterSeconds?: number } = {
      status: res.status,
      message: `Resend error ${res.status}: ${JSON.stringify(body)}`,
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After')
      err.retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60
    }
    throw err
  }
}

Deno.serve(async (req) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables (RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }
  const token = authHeader.slice('Bearer '.length).trim()
  const claims = parseJwtClaims(token)
  if (claims?.role !== 'service_role') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Rate-limit check + queue config
  const { data: state } = await supabase
    .from('email_send_state')
    .select('retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes')
    .single()

  if (state?.retry_after_until && new Date(state.retry_after_until) > new Date()) {
    return new Response(JSON.stringify({ skipped: true, reason: 'rate_limited' }), { headers: { 'Content-Type': 'application/json' } })
  }

  const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE
  const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS
  const ttlMinutes: Record<string, number> = {
    auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
    transactional_emails: state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES,
  }

  let totalProcessed = 0

  for (const queue of ['auth_emails', 'transactional_emails']) {
    const { data: messages, error: readError } = await supabase.rpc('read_email_batch', {
      queue_name: queue, batch_size: batchSize, vt: 30,
    })

    if (readError) { console.error('Failed to read email batch', { queue, error: readError }); continue }
    if (!messages?.length) continue

    // Build failed-attempts counter from send log
    const messageIds = Array.from(new Set(messages.map((m: QueueMessage) => m?.message?.message_id as string).filter(Boolean)))
    const failedAttemptsByMessageId = new Map<string, number>()
    if (messageIds.length > 0) {
      const { data: failedRows } = await supabase.from('email_send_log').select('message_id').in('message_id', messageIds).eq('status', 'failed')
      for (const row of failedRows ?? []) {
        if (row?.message_id) failedAttemptsByMessageId.set(row.message_id, (failedAttemptsByMessageId.get(row.message_id) ?? 0) + 1)
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i] as QueueMessage
      const payload = msg.message
      const failedAttempts = typeof payload?.message_id === 'string'
        ? (failedAttemptsByMessageId.get(payload.message_id) ?? 0)
        : msg.read_ct ?? 0

      // TTL check
      const queuedAt = payload.queued_at ?? msg.enqueued_at
      if (queuedAt) {
        const ageMs = Date.now() - new Date(queuedAt as string).getTime()
        if (ageMs > ttlMinutes[queue] * 60 * 1000) {
          await moveToDlq(supabase, queue, msg, `TTL exceeded (${ttlMinutes[queue]} min)`)
          continue
        }
      }

      // Max retries check
      if (failedAttempts >= MAX_RETRIES) {
        await moveToDlq(supabase, queue, msg, `Max retries (${MAX_RETRIES}) exceeded`)
        continue
      }

      // Duplicate send guard
      if (payload.message_id) {
        const { data: alreadySent } = await supabase.from('email_send_log').select('id').eq('message_id', payload.message_id).eq('status', 'sent').maybeSingle()
        if (alreadySent) {
          await supabase.rpc('delete_email', { queue_name: queue, message_id: msg.msg_id })
          continue
        }
      }

      try {
        await sendViaResend(resendApiKey, payload)

        await supabase.from('email_send_log').insert({
          message_id: payload.message_id,
          template_name: payload.label || queue,
          recipient_email: payload.to,
          status: 'sent',
        })
        await supabase.rpc('delete_email', { queue_name: queue, message_id: msg.msg_id })
        totalProcessed++

      } catch (error: unknown) {
        const err = error as { status?: number; message?: string; retryAfterSeconds?: number }
        const errorMsg = err.message ?? String(error)
        console.error('Email send failed', { queue, msg_id: msg.msg_id, error: errorMsg })

        if (err.status === 429) {
          await supabase.from('email_send_log').insert({ message_id: payload.message_id, template_name: payload.label || queue, recipient_email: payload.to, status: 'rate_limited', error_message: errorMsg.slice(0, 1000) })
          const retryAfterSecs = err.retryAfterSeconds ?? 60
          await supabase.from('email_send_state').update({ retry_after_until: new Date(Date.now() + retryAfterSecs * 1000).toISOString(), updated_at: new Date().toISOString() }).eq('id', 1)
          return new Response(JSON.stringify({ processed: totalProcessed, stopped: 'rate_limited' }), { headers: { 'Content-Type': 'application/json' } })
        }

        if (err.status === 403 || err.status === 401 || err.status === 422) {
          await moveToDlq(supabase, queue, msg, errorMsg.slice(0, 1000))
          return new Response(JSON.stringify({ processed: totalProcessed, stopped: 'permanent_error', status: err.status }), { headers: { 'Content-Type': 'application/json' } })
        }

        await supabase.from('email_send_log').insert({ message_id: payload.message_id, template_name: payload.label || queue, recipient_email: payload.to, status: 'failed', error_message: errorMsg.slice(0, 1000) })
        if (typeof payload?.message_id === 'string') failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1)
      }

      if (i < messages.length - 1) await new Promise((r) => setTimeout(r, sendDelayMs))
    }
  }

  return new Response(JSON.stringify({ processed: totalProcessed }), { headers: { 'Content-Type': 'application/json' } })
})
