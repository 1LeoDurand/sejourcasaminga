import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReportTargetType = "listing" | "place" | "profile" | "review";

export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: "fake_listing", label: "Annonce fausse ou trompeuse" },
  { value: "misleading_info", label: "Informations incorrectes" },
  { value: "inappropriate_content", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement ou comportement abusif" },
  { value: "spam", label: "Spam ou publicité" },
  { value: "other", label: "Autre raison" },
];

export interface CreateReportInput {
  reporter_user_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details?: string;
}

export function useCreateReport() {
  return useMutation({
    mutationFn: async (input: CreateReportInput) => {
      const { data, error } = await supabase
        .from("reports" as any)
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
}
