import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEvent =
  | "page_view"
  | "favorite_added"
  | "message_sent"
  | "stay_requested";

export async function trackEvent(
  event_type: AnalyticsEvent,
  opts: { page?: string; reference_id?: string | null; metadata?: Record<string, unknown> } = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("analytics_events" as any).insert({
      event_type,
      page: opts.page ?? null,
      reference_id: opts.reference_id ?? null,
      metadata: opts.metadata ?? null,
      user_id: user?.id ?? null,
    });
  } catch (e) {
    // Silent: analytics must never break UX
    console.debug("analytics error", e);
  }
}
