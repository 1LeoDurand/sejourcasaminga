import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type LinkInput = { url: string; type: "internal" | "external" | "anchor"; source_page?: string };

async function checkOne(link: LinkInput, origin: string) {
  const result: any = {
    url: link.url,
    type: link.type,
    source_page: link.source_page ?? null,
    status_code: null,
    redirect_to: null,
    error_message: null,
    severity: "info",
    suggestion: null,
  };

  if (link.type === "anchor") {
    // Anchors cannot be reliably resolved server-side; flag info.
    result.severity = "info";
    result.suggestion = "Vérifier que la section existe dans la page cible.";
    return result;
  }

  const fullUrl = link.type === "internal" ? new URL(link.url, origin).toString() : link.url;

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 10_000);
    const res = await fetch(fullUrl, { method: "HEAD", redirect: "manual", signal: ctrl.signal });
    clearTimeout(timeout);

    let status = res.status;
    // Some servers reject HEAD; retry GET
    if (status === 405 || status === 501) {
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), 10_000);
      const res2 = await fetch(fullUrl, { method: "GET", redirect: "manual", signal: ctrl2.signal });
      clearTimeout(t2);
      status = res2.status;
      if (status >= 300 && status < 400) result.redirect_to = res2.headers.get("location");
    } else if (status >= 300 && status < 400) {
      result.redirect_to = res.headers.get("location");
    }

    result.status_code = status;

    if (status === 404) {
      result.severity = "critical";
      result.suggestion =
        link.type === "internal"
          ? `Route introuvable. Vérifier la définition dans App.tsx ou le slug.`
          : "Page externe introuvable (404).";
    } else if (status >= 500) {
      result.severity = "critical";
      result.suggestion = "Erreur serveur sur la cible.";
    } else if (status >= 300 && status < 400) {
      result.severity = "warning";
      result.suggestion = `Redirection ${status} → ${result.redirect_to ?? "?"}. Mettre à jour le lien.`;
    } else if (status >= 200 && status < 300) {
      result.severity = "info";
    } else if (status >= 400) {
      result.severity = "warning";
      result.suggestion = `Statut ${status} retourné.`;
    }
  } catch (e: any) {
    result.error_message = e.message ?? String(e);
    result.severity = link.type === "internal" ? "critical" : "warning";
    result.suggestion = e.name === "AbortError" ? "Timeout (>10s)." : "Impossible de joindre l'URL.";
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const links: LinkInput[] = body.links ?? [];
    const origin: string = body.origin ?? "https://casaminga.com";

    if (!Array.isArray(links) || links.length === 0) {
      return new Response(JSON.stringify({ error: "no_links" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: scan, error: scanErr } = await admin
      .from("link_scans")
      .insert({ started_by: userData.user.id, status: "running", total_links: links.length })
      .select()
      .single();
    if (scanErr) throw scanErr;

    // Limit concurrency
    const out: any[] = [];
    const CONC = 8;
    for (let i = 0; i < links.length; i += CONC) {
      const batch = await Promise.all(links.slice(i, i + CONC).map((l) => checkOne(l, origin)));
      out.push(...batch);
    }

    const rows = out.map((r) => ({ ...r, scan_id: scan.id }));
    await admin.from("link_scan_results").insert(rows);

    const counts = { critical: 0, warning: 0, info: 0, ok: 0 };
    for (const r of out) {
      if (r.severity === "critical") counts.critical++;
      else if (r.severity === "warning") counts.warning++;
      else counts.info++;
      if (r.status_code && r.status_code >= 200 && r.status_code < 300) counts.ok++;
    }

    await admin
      .from("link_scans")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        critical_count: counts.critical,
        warning_count: counts.warning,
        info_count: counts.info,
        ok_count: counts.ok,
      })
      .eq("id", scan.id);

    return new Response(JSON.stringify({ scan_id: scan.id, results: out, counts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
