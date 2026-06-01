// Edge function: send J+3 reminder to users who signed up 3 days ago
// and haven't created/claimed any place AND haven't published any listing.
// Triggered daily via pg_cron.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    // Find users who signed up between 3 and 4 days ago (24h window)
    // and have NOT yet been sent the reminder.
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()

    const { data: candidates, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, created_at, reminder_sent_at')
      .lte('created_at', threeDaysAgo)
      .gte('created_at', fourDaysAgo)
      .is('reminder_sent_at', null)

    if (profilesError) throw profilesError

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: 'No candidates' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userIds = candidates.map((c) => c.user_id)

    // Find which of them already have at least one place (created or claimed)
    const { data: places } = await supabase
      .from('places')
      .select('created_by')
      .in('created_by', userIds)

    // And which have at least one listing
    const { data: listings } = await supabase
      .from('listings')
      .select('host_id')
      .in('host_id', userIds)

    const usersWithPlace = new Set((places ?? []).map((p: any) => p.created_by))
    const usersWithListing = new Set((listings ?? []).map((l: any) => l.host_id))

    const toRemind = candidates.filter(
      (c) => !usersWithPlace.has(c.user_id) && !usersWithListing.has(c.user_id)
    )

    let sent = 0
    const errors: Array<{ user_id: string; error: string }> = []

    for (const profile of toRemind) {
      // Get user's email from auth
      const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(profile.user_id)
      if (userErr || !userData?.user?.email) {
        errors.push({ user_id: profile.user_id, error: userErr?.message ?? 'no email' })
        continue
      }
      const email = userData.user.email
      const firstName = (profile.display_name ?? '').split(' ')[0] || undefined

      const { error: invokeErr } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'profile-incomplete-reminder',
          recipientEmail: email,
          idempotencyKey: `reminder-j3-${profile.user_id}`,
          templateData: { firstName },
        },
      })

      if (invokeErr) {
        errors.push({ user_id: profile.user_id, error: invokeErr.message })
        continue
      }

      // Mark as reminded so we never re-send
      await supabase
        .from('profiles')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('user_id', profile.user_id)

      sent++
    }

    return new Response(
      JSON.stringify({
        ok: true,
        candidates: candidates.length,
        eligible: toRemind.length,
        sent,
        errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('send-engagement-reminders error', e)
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
