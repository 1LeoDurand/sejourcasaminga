// Weekly digest email: scheduled every Monday 10:00 UTC via pg_cron.
// Sends a personalized recap (matching habitats, new dates, articles, events).

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://casaminga.com'
const INACTIVE_DAYS = 30
const MAX_HABITATS = 4
const MAX_AVAILABILITIES = 3
const MAX_ARTICLES = 2
const MAX_EVENTS = 3

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  } catch {
    return d
  }
}
function fmtRange(start: string, end: string) {
  return `${fmtDate(start)} → ${fmtDate(end)}`
}

function shouldSendToday(settings: any, today = new Date()): boolean {
  if (!settings) return true
  if (settings.weekly_digest === false) return false
  const freq = settings.frequency ?? 'weekly'
  if (freq === 'never') return false
  const preferredDay = typeof settings.preferred_day === 'number' ? settings.preferred_day : 1
  // 0=Sunday … 1=Monday … 6=Saturday
  if (today.getUTCDay() !== preferredDay) return false
  if (freq === 'monthly') {
    // first preferred-day of month
    return today.getUTCDate() <= 7
  }
  if (freq === 'biweekly') {
    const week = Math.floor((today.getTime() / (1000 * 60 * 60 * 24 * 7)))
    return week % 2 === 0
  }
  return true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    // Optional dry-run / single-user testing
    let onlyUserId: string | null = null
    let force = false
    try {
      const body = await req.json()
      onlyUserId = body?.user_id ?? null
      force = body?.force === true
    } catch { /* no body */ }

    const today = new Date()
    const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch eligible profiles
    let profilesQuery = supabase
      .from('profiles')
      .select('user_id, display_name, email_settings')
    if (onlyUserId) profilesQuery = profilesQuery.eq('user_id', onlyUserId)
    const { data: profiles, error: profilesError } = await profilesQuery
    if (profilesError) throw profilesError

    // Preferences for all users (for personalization)
    const userIds = (profiles ?? []).map((p) => p.user_id)
    const { data: prefsRows } = await supabase
      .from('user_preferences')
      .select('user_id, preferred_values, preferred_habitat_types, preferred_regions')
      .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])
    const prefsByUser = new Map<string, any>()
    for (const p of prefsRows ?? []) prefsByUser.set(p.user_id, p)

    // Suppressed emails
    const { data: suppressed } = await supabase
      .from('suppressed_emails')
      .select('email')
    const suppressedSet = new Set((suppressed ?? []).map((s: any) => (s.email as string).toLowerCase()))

    // Fetch recent content once (shared across users)
    const { data: recentPlaces } = await supabase
      .from('places')
      .select('id, slug, name, type, region, image, values, environment_type, created_at')
      .eq('published', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(60)

    const { data: recentAvailabilities } = await supabase
      .from('availabilities')
      .select('id, listing_id, start_date, end_date, created_at, listings:listing_id(id, title, slug, place_id, places:place_id(name, region, slug))')
      .eq('status', 'available')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false })
      .limit(25)

    const { data: recentArticles } = await supabase
      .from('blog_posts')
      .select('title, slug, excerpt, published_at')
      .eq('is_published', true)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(MAX_ARTICLES)

    const { data: upcomingEvents } = await supabase
      .from('habitat_events')
      .select('id, title, date_start, place_id, places:place_id(name, slug)')
      .eq('is_public', true)
      .gte('date_start', today.toISOString())
      .order('date_start', { ascending: true })
      .limit(20)

    let sent = 0
    let skipped = 0
    const errors: Array<{ user_id: string; error: string }> = []

    for (const profile of profiles ?? []) {
      const settings = profile.email_settings ?? { weekly_digest: true, frequency: 'weekly', preferred_day: 1 }
      if (!force && !shouldSendToday(settings, today)) {
        skipped++
        continue
      }

      // Active in last 30 days
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id)
      const email = authUser?.user?.email
      const lastSignIn = authUser?.user?.last_sign_in_at
      if (!email) { skipped++; continue }
      if (suppressedSet.has(email.toLowerCase())) { skipped++; continue }
      if (!force && lastSignIn && lastSignIn < cutoff) { skipped++; continue }

      const prefs = prefsByUser.get(profile.user_id)
      const wantedValues: string[] = prefs?.preferred_values ?? []
      const wantedTypes: string[] = prefs?.preferred_habitat_types ?? []
      const wantedRegions: string[] = prefs?.preferred_regions ?? []

      // Score & pick habitats
      const scored = (recentPlaces ?? []).map((p: any) => {
        const pValues: string[] = p.values ?? []
        const valueOverlap = wantedValues.length
          ? pValues.filter((v) => wantedValues.includes(v)).length / wantedValues.length
          : 0
        const typeMatch = wantedTypes.length ? (wantedTypes.includes(p.type) || wantedTypes.includes(p.environment_type) ? 1 : 0) : 0
        const regionMatch = wantedRegions.length ? (wantedRegions.includes(p.region) ? 1 : 0) : 0
        const matchPct = Math.round((valueOverlap * 0.6 + typeMatch * 0.25 + regionMatch * 0.15) * 100)
        return { ...p, matchPct }
      }).sort((a: any, b: any) => b.matchPct - a.matchPct)

      const habitats = scored.slice(0, MAX_HABITATS).map((h: any) => ({
        id: h.id,
        slug: h.slug,
        name: h.name,
        region: h.region,
        type: h.type,
        image: h.image,
        matchPct: h.matchPct > 0 ? h.matchPct : undefined,
      }))

      const availabilities = (recentAvailabilities ?? []).slice(0, MAX_AVAILABILITIES).map((a: any) => {
        const listing = a.listings
        const place = listing?.places
        return {
          habitat: place?.name ?? listing?.title ?? 'Habitat',
          region: place?.region,
          dates: fmtRange(a.start_date, a.end_date),
          url: `${SITE_URL}/habitat/${place?.slug ?? ''}`,
        }
      })

      const articles = (recentArticles ?? []).map((a: any) => ({
        title: a.title,
        excerpt: (a.excerpt ?? '').slice(0, 110),
        url: `${SITE_URL}/blog/${a.slug}`,
      }))

      const events = (upcomingEvents ?? []).slice(0, MAX_EVENTS).map((e: any) => ({
        title: e.title,
        habitat: e.places?.name ?? 'Casa Minga',
        date: fmtDate(e.date_start),
        url: `${SITE_URL}/habitat/${e.places?.slug ?? ''}`,
      }))

      // If absolutely nothing to share, skip
      if (habitats.length === 0 && availabilities.length === 0 && articles.length === 0 && events.length === 0) {
        skipped++
        continue
      }

      const firstName = (profile.display_name ?? '').split(' ')[0] || undefined
      const isoWeek = `${today.getUTCFullYear()}-W${Math.ceil(((today.getTime() - Date.UTC(today.getUTCFullYear(),0,1)) / 86400000 + new Date(Date.UTC(today.getUTCFullYear(),0,1)).getUTCDay() + 1) / 7)}`

      const { error: invokeErr } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'weekly-digest',
          recipientEmail: email,
          idempotencyKey: `weekly-digest-${profile.user_id}-${isoWeek}`,
          templateData: {
            firstName,
            habitats,
            availabilities,
            articles,
            events,
            preferencesUrl: `${SITE_URL}/edit-profile`,
          },
        },
      })

      if (invokeErr) {
        errors.push({ user_id: profile.user_id, error: invokeErr.message })
        continue
      }

      await supabase
        .from('profiles')
        .update({ weekly_digest_last_sent_at: new Date().toISOString() })
        .eq('user_id', profile.user_id)

      sent++
    }

    return new Response(
      JSON.stringify({ ok: true, sent, skipped, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('send-weekly-digest error', e)
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
