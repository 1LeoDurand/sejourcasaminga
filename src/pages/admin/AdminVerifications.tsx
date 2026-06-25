import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Eye, CreditCard, CheckCircle2, XCircle, FileX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// ─── Types ───────────────────────────────────────────────────────────────────

type VerifStatus = "none" | "pending" | "verified" | "rejected";

interface VerifRow {
  user_id: string;
  status: VerifStatus;
  id_doc_path: string | null;
  payment_method: string | null;
  paid_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadgeVariant(
  status: VerifStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "verified":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminVerifications() {
  const { t } = useTranslation();

  const [rows, setRows] = useState<VerifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<VerifStatus | "all">("pending");

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<VerifRow | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Action loading per user
  const [loadingUsers, setLoadingUsers] = useState<Record<string, boolean>>({});

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("member_verification")
        .select("*, profiles:user_id(display_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRows((data as VerifRow[]) ?? []);
    } catch (e: any) {
      toast({
        title: t("adminVerifications.errorLoad"),
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // ── View document ──────────────────────────────────────────────────────────

  const handleViewDoc = async (row: VerifRow) => {
    if (!row.id_doc_path) return;
    try {
      const { data, error } = await supabase.storage
        .from("identity-docs")
        .createSignedUrl(row.id_doc_path, 60);
      if (error || !data?.signedUrl) throw error ?? new Error("No URL");
      window.open(data.signedUrl, "_blank");
    } catch (e: any) {
      toast({
        title: t("adminVerifications.errorDoc"),
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // ── Delete identity document (RGPD) ─────────────────────────────────────────
  // The GDPR notice promises the document is erased after review. Called after a
  // successful approve/reject decision. Non-blocking: a failure only warns — the
  // recorded decision stands. Never log the path.
  const deleteIdentityDoc = async (path: string | null) => {
    if (!path) return;
    try {
      const { error } = await supabase.storage.from("identity-docs").remove([path]);
      if (error) throw error;
    } catch {
      toast({
        title: t("adminVerifications.docDeleteWarnTitle"),
        description: t("adminVerifications.docDeleteWarnDesc"),
        variant: "destructive",
      });
    }
  };

  // ── Mark paid ─────────────────────────────────────────────────────────────

  const handleMarkPaid = async (row: VerifRow) => {
    setLoadingUsers((prev) => ({ ...prev, [row.user_id]: true }));
    try {
      const { error } = await (supabase as any).rpc("mark_member_paid", {
        _user_id: row.user_id,
        _method: "transfer",
      });
      if (error) throw error;
      toast({ title: t("adminVerifications.paidSuccess") });
      await fetchVerifications();
    } catch (e: any) {
      toast({
        title: t("adminVerifications.errorGeneric"),
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [row.user_id]: false }));
    }
  };

  // ── Approve ───────────────────────────────────────────────────────────────

  const handleApprove = async (row: VerifRow) => {
    setLoadingUsers((prev) => ({ ...prev, [row.user_id]: true }));
    try {
      const { error } = await (supabase as any).rpc("review_member_verification", {
        _user_id: row.user_id,
        _approve: true,
        _note: "",
      });
      if (error) throw error;
      // RGPD: erase the identity document once the decision is recorded.
      await deleteIdentityDoc(row.id_doc_path);
      toast({ title: t("adminVerifications.approveSuccess") });
      await fetchVerifications();
    } catch (e: any) {
      const msg: string = e?.message ?? "";
      if (msg.includes("NOT_PAID")) {
        toast({
          title: t("adminVerifications.notPaidTitle"),
          description: t("adminVerifications.notPaidDesc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("adminVerifications.errorGeneric"),
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [row.user_id]: false }));
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────

  const openRejectDialog = (row: VerifRow) => {
    setRejectTarget(row);
    setRejectNote("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      const { error } = await (supabase as any).rpc("review_member_verification", {
        _user_id: rejectTarget.user_id,
        _approve: false,
        _note: rejectNote,
      });
      if (error) throw error;
      // RGPD: erase the identity document once the decision is recorded.
      await deleteIdentityDoc(rejectTarget.id_doc_path);
      toast({ title: t("adminVerifications.rejectSuccess") });
      setRejectDialogOpen(false);
      await fetchVerifications();
    } catch (e: any) {
      toast({
        title: t("adminVerifications.errorGeneric"),
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title={t("adminVerifications.title")}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as VerifStatus | "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("adminVerifications.filterAll")}</SelectItem>
            <SelectItem value="pending">{t("adminVerifications.statusPending")}</SelectItem>
            <SelectItem value="verified">{t("adminVerifications.statusVerified")}</SelectItem>
            <SelectItem value="rejected">{t("adminVerifications.statusRejected")}</SelectItem>
            <SelectItem value="none">{t("adminVerifications.statusNone")}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={fetchVerifications} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">{t("adminVerifications.refresh")}</span>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminVerifications.colMember")}</TableHead>
                <TableHead>{t("adminVerifications.colStatus")}</TableHead>
                <TableHead>{t("adminVerifications.colPayment")}</TableHead>
                <TableHead>{t("adminVerifications.colSubmitted")}</TableHead>
                <TableHead className="text-right">{t("adminVerifications.colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    {t("adminVerifications.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const busy = !!loadingUsers[row.user_id];
                  const displayName =
                    row.profiles?.display_name ?? row.user_id.slice(0, 8) + "…";
                  const avatarUrl = row.profiles?.avatar_url;

                  return (
                    <TableRow key={row.user_id}>
                      {/* Member */}
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[140px]">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="h-8 w-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium truncate max-w-[160px]">
                            {displayName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant={statusBadgeVariant(row.status)}>
                          {t(`adminVerifications.status${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`)}
                        </Badge>
                      </TableCell>

                      {/* Payment */}
                      <TableCell className="text-sm">
                        {row.paid_at ? (
                          <span className="text-green-600 dark:text-green-400">
                            {format(new Date(row.paid_at), "d MMM yyyy", { locale: fr })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("adminVerifications.notPaid")}
                          </span>
                        )}
                      </TableCell>

                      {/* Submitted at */}
                      <TableCell className="text-sm text-muted-foreground">
                        {row.created_at
                          ? format(new Date(row.created_at), "d MMM yyyy", { locale: fr })
                          : "—"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Identity document — viewable only before review;
                              erased (RGPD) once verified/rejected. */}
                          {row.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!row.id_doc_path || busy}
                              onClick={() => handleViewDoc(row)}
                              title={t("adminVerifications.viewDoc")}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">
                                {t("adminVerifications.viewDoc")}
                              </span>
                            </Button>
                          ) : row.id_doc_path ? (
                            <span
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                              title={t("adminVerifications.docDeletedHint")}
                            >
                              <FileX className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">
                                {t("adminVerifications.docDeleted")}
                              </span>
                            </span>
                          ) : null}

                          {/* Mark paid (only if not yet paid) */}
                          {!row.paid_at && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => handleMarkPaid(row)}
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline ml-1">
                                {t("adminVerifications.markPaid")}
                              </span>
                            </Button>
                          )}

                          {/* Approve */}
                          {row.status === "pending" && (
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => handleApprove(row)}
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline ml-1">
                                {t("adminVerifications.approve")}
                              </span>
                            </Button>
                          )}

                          {/* Reject */}
                          {row.status === "pending" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busy}
                              onClick={() => openRejectDialog(row)}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">
                                {t("adminVerifications.reject")}
                              </span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("adminVerifications.rejectDialogTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("adminVerifications.rejectDialogDesc")}
          </p>
          <Textarea
            placeholder={t("adminVerifications.rejectNotePlaceholder")}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
            className="mt-2"
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejectLoading}
            >
              {t("adminVerifications.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectLoading}
            >
              {rejectLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="ml-1">{t("adminVerifications.rejectConfirm")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
