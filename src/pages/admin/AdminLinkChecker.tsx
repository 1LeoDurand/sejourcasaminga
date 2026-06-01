import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  buildScanList,
  runScan,
  toCsv,
  type LinkResult,
  type LinkSeverity,
  type LinkType,
} from "@/tools/checkBrokenLinks";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function severityVariant(s: LinkSeverity): "destructive" | "secondary" | "outline" {
  if (s === "critical") return "destructive";
  if (s === "warning") return "secondary";
  return "outline";
}

export default function AdminLinkChecker() {
  const [results, setResults] = useState<LinkResult[]>([]);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<LinkType | "all">("all");
  const [sevFilter, setSevFilter] = useState<LinkSeverity | "all">("all");

  // Load latest scan on mount
  useEffect(() => {
    (async () => {
      const { data: scans } = await supabase
        .from("link_scans")
        .select("id, finished_at, started_at")
        .order("started_at", { ascending: false })
        .limit(1);
      const scan = scans?.[0];
      if (!scan) return;
      setLastScanAt(scan.finished_at ?? scan.started_at);
      const { data: rows } = await supabase
        .from("link_scan_results")
        .select("*")
        .eq("scan_id", scan.id)
        .order("severity", { ascending: true });
      if (rows) setResults(rows as unknown as LinkResult[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (sevFilter !== "all" && r.severity !== sevFilter) return false;
      if (search && !r.url.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [results, typeFilter, sevFilter, search]);

  const counts = useMemo(() => {
    const c = { critical: 0, warning: 0, info: 0 };
    results.forEach((r) => c[r.severity]++);
    return c;
  }, [results]);

  const handleRescan = async () => {
    setRunning(true);
    try {
      const links = buildScanList();
      const data = await runScan(links);
      setResults(data.results);
      setLastScanAt(new Date().toISOString());
      toast({
        title: "Scan terminé",
        description: `${data.results.length} liens · ${data.counts.critical} critiques`,
      });
    } catch (e: any) {
      toast({ title: "Erreur scan", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const exportFile = (kind: "json" | "csv") => {
    const blob =
      kind === "json"
        ? new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" })
        : new Blob([toCsv(filtered)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `link-scan-${Date.now()}.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Vérification des liens">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-display">{results.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-destructive">Critiques</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-display text-destructive">{counts.critical}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avertissements</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-display">{counts.warning}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Info</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-display">{counts.info}</CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleRescan} disabled={running}>
            {running ? <Loader2 className="animate-spin" /> : <RefreshCw />} Relancer le scan
          </Button>
          <Button variant="outline" onClick={() => exportFile("json")} disabled={!filtered.length}>
            <Download /> JSON
          </Button>
          <Button variant="outline" onClick={() => exportFile("csv")} disabled={!filtered.length}>
            <Download /> CSV
          </Button>
          {lastScanAt && (
            <span className="text-sm text-muted-foreground ml-auto">
              Dernier scan : {format(new Date(lastScanAt), "PPp", { locale: fr })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Rechercher une URL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="internal">Internes</SelectItem>
              <SelectItem value="external">Externes</SelectItem>
              <SelectItem value="anchor">Ancres</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sevFilter} onValueChange={(v) => setSevFilter(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="warning">Avertissement</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead className="w-32">Sévérité</TableHead>
                  <TableHead>Suggestion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      Aucun résultat. Lance un scan pour démarrer.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs max-w-md truncate">
                        <a
                          href={r.type === "internal" ? r.url : r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          {r.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>{r.status_code ?? "—"}</TableCell>
                      <TableCell className="capitalize">{r.type}</TableCell>
                      <TableCell>
                        <Badge variant={severityVariant(r.severity)}>{r.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.suggestion ?? r.error_message ?? "—"}
                        {r.redirect_to && (
                          <div className="text-xs mt-1">→ {r.redirect_to}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
