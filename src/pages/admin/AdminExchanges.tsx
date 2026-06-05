import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ExchangeRow = {
  id: string;
  listing_id: string;
  from_user_id: string;
  to_member_id: string;
  start_date: string | null;
  end_date: string | null;
  number_of_guests: number | null;
  status: string;
  created_at: string;
  listings?: { title: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Accepté",
  declined: "Refusé",
  cancelled: "Annulé",
  completed: "Terminé",
};

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "accepted" || s === "completed") return "default";
  if (s === "declined" || s === "cancelled") return "destructive";
  if (s === "pending") return "outline";
  return "secondary";
};

export default function AdminExchanges() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-exchanges"],
    queryFn: async () => {
      const [{ data: exchanges }, { data: profiles }] = await Promise.all([
        supabase
          .from("exchange_requests")
          .select("id, listing_id, from_user_id, to_member_id, start_date, end_date, number_of_guests, status, created_at, listings(title)")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, display_name"),
      ]);
      const nameById = new Map((profiles ?? []).map((p: any) => [p.user_id, p.display_name]));
      return ((exchanges ?? []) as ExchangeRow[]).map((e) => ({
        ...e,
        fromName: nameById.get(e.from_user_id) ?? e.from_user_id.slice(0, 8) + "…",
        toName: nameById.get(e.to_member_id) ?? e.to_member_id.slice(0, 8) + "…",
      }));
    },
  });

  const rows = data ?? [];
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  const renderTable = (list: typeof rows) => (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Séjour</TableHead>
            <TableHead>Demandeur</TableHead>
            <TableHead>Hôte</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Pers.</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Aucun échange
              </TableCell>
            </TableRow>
          ) : (
            list.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <Link
                    to={`/listing/${e.listing_id}`}
                    target="_blank"
                    className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                  >
                    {e.listings?.title ?? "Séjour"}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{(e as any).fromName}</TableCell>
                <TableCell className="text-sm">{(e as any).toName}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {e.start_date ? format(new Date(e.start_date), "d MMM", { locale: fr }) : "—"}
                  {" → "}
                  {e.end_date ? format(new Date(e.end_date), "d MMM yy", { locale: fr }) : "—"}
                </TableCell>
                <TableCell className="text-sm">{e.number_of_guests ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(e.status)}>{STATUS_LABELS[e.status] ?? e.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(e.created_at), "d MMM yyyy", { locale: fr })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <AdminLayout title="Échanges">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">Tous ({rows.length})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({counts.pending ?? 0})</TabsTrigger>
            <TabsTrigger value="accepted">Acceptés ({counts.accepted ?? 0})</TabsTrigger>
            <TabsTrigger value="completed">Terminés ({counts.completed ?? 0})</TabsTrigger>
            <TabsTrigger value="declined">Refusés/Annulés ({(counts.declined ?? 0) + (counts.cancelled ?? 0)})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">{renderTable(rows)}</TabsContent>
          <TabsContent value="pending" className="mt-4">{renderTable(rows.filter((r) => r.status === "pending"))}</TabsContent>
          <TabsContent value="accepted" className="mt-4">{renderTable(rows.filter((r) => r.status === "accepted"))}</TabsContent>
          <TabsContent value="completed" className="mt-4">{renderTable(rows.filter((r) => r.status === "completed"))}</TabsContent>
          <TabsContent value="declined" className="mt-4">{renderTable(rows.filter((r) => r.status === "declined" || r.status === "cancelled"))}</TabsContent>
        </Tabs>
      )}
    </AdminLayout>
  );
}
