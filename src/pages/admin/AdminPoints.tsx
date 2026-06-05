import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  useAllPointBalances,
  useAllPointTransactions,
  useAdjustPoints,
  POINT_TYPE_LABELS,
  POINT_TYPE_ICONS,
  type AdminPointRow,
} from "@/hooks/use-points";
import { Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

function AdjustDialog({ row }: { row: AdminPointRow }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const adjust = useAdjustPoints();

  const submit = () => {
    const n = parseInt(amount, 10);
    if (!n || !description.trim()) return;
    adjust.mutate(
      { userId: row.user_id, amount: n, description: description.trim() },
      {
        onSuccess: (newBal) => {
          toast({ title: "Solde ajusté", description: `Nouveau solde : ${newBal} pts` });
          setOpen(false);
          setAmount("");
          setDescription("");
        },
        onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3 w-3" /> Ajuster
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajuster les points — {row.display_name ?? row.user_id.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="amount">Montant (négatif pour retirer)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="ex: 50 ou -20"
            />
          </div>
          <div>
            <Label htmlFor="desc">Motif *</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: correction bug, geste commercial…"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Solde actuel : <strong>{row.balance} pts</strong>
          </p>
          <Button className="w-full" onClick={submit} disabled={adjust.isPending || !amount || !description.trim()}>
            {adjust.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Appliquer l'ajustement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPoints() {
  const { data: balances, isLoading: loadingBalances } = useAllPointBalances();
  const { data: transactions, isLoading: loadingTx } = useAllPointTransactions(150);
  const [search, setSearch] = useState("");

  const filtered = (balances ?? []).filter(
    (b) => !search || b.display_name?.toLowerCase().includes(search.toLowerCase()) || b.user_id.includes(search)
  );

  return (
    <AdminLayout title="Points">
      <Tabs defaultValue="balances" className="w-full">
        <TabsList>
          <TabsTrigger value="balances">Soldes ({balances?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="mt-4 space-y-4">
          <Input
            placeholder="Rechercher par nom ou ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>Solde</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBalances ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin inline" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Aucun solde
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => (
                    <TableRow key={b.user_id}>
                      <TableCell>
                        <p className="font-medium text-sm">{b.display_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground font-mono">{b.user_id.slice(0, 8)}…</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-sm">{b.balance} pts</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AdjustDialog row={b} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Membre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTx ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin inline" />
                    </TableCell>
                  </TableRow>
                ) : (transactions ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune transaction
                    </TableCell>
                  </TableRow>
                ) : (
                  (transactions ?? []).map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(t.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{t.user_id.slice(0, 8)}…</TableCell>
                      <TableCell className="text-sm">
                        {POINT_TYPE_ICONS[t.type] ?? "•"} {POINT_TYPE_LABELS[t.type] ?? t.type}
                      </TableCell>
                      <TableCell>
                        <span className={t.amount >= 0 ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                          {t.amount >= 0 ? "+" : ""}{t.amount}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.description ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
