import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MailWarning, MailCheck, Ban } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  const v = (s || "").toLowerCase();
  if (v.includes("sent") || v.includes("delivered") || v.includes("ok")) return "default";
  if (v.includes("fail") || v.includes("error") || v.includes("bounce")) return "destructive";
  if (v.includes("suppress") || v.includes("skip")) return "secondary";
  return "outline";
};

export default function AdminEmails() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-emails"],
    queryFn: async () => {
      const [{ data: log }, { data: suppressed }] = await Promise.all([
        supabase
          .from("email_send_log" as any)
          .select("id, message_id, template_name, recipient_email, status, error_message, created_at")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("suppressed_emails" as any)
          .select("id, email, reason, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      return { log: (log ?? []) as any[], suppressed: (suppressed ?? []) as any[] };
    },
  });

  const log = data?.log ?? [];
  const suppressed = data?.suppressed ?? [];
  const failed = log.filter((l) => statusVariant(l.status) === "destructive");
  const sent = log.filter((l) => statusVariant(l.status) === "default");

  return (
    <AdminLayout title="E-mails">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <MailCheck className="h-7 w-7 text-emerald-600" />
                <div>
                  <p className="text-2xl font-semibold">{sent.length}</p>
                  <p className="text-xs text-muted-foreground">Envoyés (200 derniers)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <MailWarning className="h-7 w-7 text-destructive" />
                <div>
                  <p className="text-2xl font-semibold">{failed.length}</p>
                  <p className="text-xs text-muted-foreground">En échec</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Ban className="h-7 w-7 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold">{suppressed.length}</p>
                  <p className="text-xs text-muted-foreground">Adresses supprimées</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="log" className="w-full">
            <TabsList>
              <TabsTrigger value="log">Journal ({log.length})</TabsTrigger>
              <TabsTrigger value="failed">Échecs ({failed.length})</TabsTrigger>
              <TabsTrigger value="suppressed">Suppressions ({suppressed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="log" className="mt-4">{renderLog(log)}</TabsContent>
            <TabsContent value="failed" className="mt-4">{renderLog(failed)}</TabsContent>
            <TabsContent value="suppressed" className="mt-4">
              <div className="rounded-lg border bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppressed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Aucune adresse supprimée
                        </TableCell>
                      </TableRow>
                    ) : (
                      suppressed.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-sm">{s.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{s.reason ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(s.created_at), "d MMM yyyy", { locale: fr })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AdminLayout>
  );

  function renderLog(rows: any[]) {
    return (
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Erreur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun envoi
                </TableCell>
              </TableRow>
            ) : (
              rows.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(l.created_at), "d MMM HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm font-mono">{l.template_name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{l.recipient_email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(l.status)}>{l.status ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-destructive max-w-[220px] truncate" title={l.error_message ?? ""}>
                    {l.error_message ?? ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}
