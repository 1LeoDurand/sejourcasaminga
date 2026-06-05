import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReportTargetType = "listing" | "place" | "profile" | "review";
export type ReportStatus = "pending" | "reviewed" | "dismissed";

const ADMIN_EMAIL = "1leodurand@gmail.com";

export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: "fake_listing", label: "Annonce fausse ou trompeuse" },
  { value: "misleading_info", label: "Informations incorrectes" },
  { value: "inappropriate_content", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement ou comportement abusif" },
  { value: "spam", label: "Spam ou publicité" },
  { value: "other", label: "Autre raison" },
];

export const REPORT_REASON_LABELS: Record<string, string> = Object.fromEntries(
  REPORT_REASONS.map((r) => [r.value, r.label])
);

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  listing: "Séjour",
  place: "Lieu",
  profile: "Profil",
  review: "Avis",
};

export interface CreateReportInput {
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details?: string;
  /** Optional display name of the reporter, used only for the admin email. */
  reporter_name?: string;
}

export interface ReportRow {
  id: string;
  created_at: string;
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export function useCreateReport() {
  return useMutation({
    mutationFn: async (input: CreateReportInput) => {
      const { reporter_name, ...row } = input;
      const { data, error } = await supabase
        .from("reports" as any)
        .insert(row)
        .select()
        .single();
      if (error) throw error;

      // Alert the moderation inbox (non-blocking for UX).
      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "report-received",
            recipientEmail: ADMIN_EMAIL,
            idempotencyKey: `report-${(data as any).id}`,
            templateData: {
              targetType: input.target_type,
              targetId: input.target_id,
              reason: input.reason,
              details: input.details || "",
              reporterName: reporter_name || "Membre",
              submittedAt: new Date().toLocaleString("fr-FR"),
            },
          },
        })
        .catch((err) => console.warn("Report email error:", err));

      return data;
    },
  });
}

export function useAllReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ReportRow[];
    },
  });
}

export function useUpdateReportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      reviewerId,
    }: {
      id: string;
      status: ReportStatus;
      reviewerId: string;
    }) => {
      const { error } = await supabase
        .from("reports" as any)
        .update({
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }),
  });
}
