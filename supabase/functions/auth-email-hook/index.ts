/**
 * auth-email-hook — Supabase "Send Email" Auth Hook.
 *
 * Remplace la passerelle Lovable. Reçoit le payload de Supabase Auth,
 * rend les templates React Email et enqueue via pgmq.
 *
 * Configuration Supabase Dashboard :
 *   Authentication → Hooks → "Send Email"
 *   URL : https://giekhaohqksirsadkfnt.supabase.co/functions/v1/auth-email-hook
 *
 * Aucun secret spécifique requis (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY auto-injectés).
 */
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://sejour.casaminga.com'
const FROM_ADDRESS = `${SITE_NAME} <noreply@sejour.casaminga.com>`

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirmez votre adresse email — Casa Minga',
  invite: "Vous avez été invité·e — Casa Minga",
  magiclink: 'Votre lien de connexion — Casa Minga',
  recovery: 'Réinitialisez votre mot de passe — Casa Minga',
  email_change: 'Confirmez votre nouvel email — Casa Minga',
  reauthentication: 'Votre code de vérification — Casa Minga',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<Record<string, unknown>>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = parts[1].replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
    return JSON.parse(atob(payload)) as Record<string, unknown>
  } catch { return null }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Vérifier que la requête vient bien de Supabase (service_role JWT)
  const authHeader = req.headers.get('Authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) {
    const claims = parseJwtClaims(authHeader.slice(7).trim())
    if (claims?.role !== 'service_role') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // Supabase Auth Hook payload format:
  // { user: { email, ... }, email_data: { token, token_hash, redirect_to, verification_type, site_url, ... } }
  const emailData = body.email_data as Record<string, string> | undefined
  const user = body.user as Record<string, unknown> | undefined
  const emailType = emailData?.verification_type ?? emailData?.type ?? ''
  const recipientEmail = user?.email as string | undefined

  if (!recipientEmail || !emailType) {
    console.error('Missing email or verification_type in auth hook payload', { body })
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.warn('Unknown email type — falling back to Supabase default', { emailType })
    // Return empty object: Supabase will use its default templates
    return new Response(JSON.stringify({}), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    recipient: recipientEmail,
    confirmationUrl: emailData?.redirect_to ?? emailData?.url ?? SITE_URL,
    token: emailData?.token,
    email: recipientEmail,
    newEmail: emailData?.email_new,
  }

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps as Record<string, unknown>))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps as Record<string, unknown>), { plainText: true })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const messageId = crypto.randomUUID()

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: recipientEmail,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: {
      message_id: messageId,
      to: recipientEmail,
      from: FROM_ADDRESS,
      subject: EMAIL_SUBJECTS[emailType] ?? 'Notification — Casa Minga',
      html,
      text,
      purpose: 'transactional',
      label: emailType,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', { error: enqueueError, emailType, recipientEmail })
    await supabase.from('email_send_log').insert({ message_id: messageId, template_name: emailType, recipient_email: recipientEmail, status: 'failed', error_message: 'Failed to enqueue email' })
    // On retourne quand même 200 — Supabase retombera sur ses templates par défaut
    return new Response(JSON.stringify({}), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  console.log('Auth email enqueued', { emailType, recipientEmail })
  return new Response(JSON.stringify({}), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
