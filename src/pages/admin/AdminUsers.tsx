import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminUsers() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: places }, { data: listings }, { data: roles }] =
        await Promise.all([
          supabase.from("profiles").select("user_id, display_name, avatar_url, bio, created_at"),
          supabase.from("places").select("id, name, created_by"),
          supabase.from("listings").select("id, title, host_id"),
          supabase.from("user_roles").select("user_id, role"),
        ]);

      return (profiles ?? []).map((p: any) => ({
        ...p,
        places: (places ?? []).filter((pl: any) => pl.created_by === p.user_id),
        listings: (listings ?? []).filter((l: any) => l.host_id === p.user_id),
        roles: (roles ?? []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
      }));
    },
  });

  const filtered = (data ?? []).filter(
    (u: any) =>
      !search ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_id?.includes(search)
  );

  return (
    <AdminLayout title="Utilisateurs">
      <div className="mb-4">
        <Input
          placeholder="Rechercher par nom ou ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead>Lieux</TableHead>
              <TableHead>Séjours</TableHead>
              <TableHead>Rôles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin inline" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u: any) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar_url ?? undefined} />
                        <AvatarFallback>{u.display_name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{u.display_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(u.created_at), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm">{u.places.length}</TableCell>
                  <TableCell className="text-sm">{u.listings.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">user</span>
                      ) : (
                        u.roles.map((r: string) => (
                          <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                            {r}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
