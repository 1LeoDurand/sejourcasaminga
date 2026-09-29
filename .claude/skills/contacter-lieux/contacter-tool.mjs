#!/usr/bin/env node
// Helper of the /contacter-lieux skill (no dependencies).
//
//   node contacter-tool.mjs check <dir>   validate <dir>/contacts.json against the ingestion contract
//   node contacter-tool.mjs sql   <dir>   write <dir>/contacts.sql (one call to outreach_ingest_batch)
//
// <dir> is the article folder (0.1 Contexte sejour-casaminga/SEO/articles/<slug>/).
// contacts.json = the JSON contract of outreach_ingest_batch (spec 16.2), plus an
// optional "non_deposes" array (places without a usable address). "non_deposes"
// is NEVER sent to the database: `sql` strips it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROGRAM = "articles-sejour";
const SUJETS = ["article", "photos", "decouverte", "inscription", "sejour"];
const SOURCES = ["site_web", "annuaire", "organisation_admin", "sejour", "recommandation", "mail_entrant", "formulaire", "leo", "autre"];
const TYPES = ["habitat_participatif", "ecolieu", "tiers_lieu", "association", "reseau", "personne", "autre"];
const VARS = ["bonjour", "lieu", "phrase", "article_titre", "article_url"];
const DEMANDE = ["retour_article", "photos", "decouverte"];
const NON_DEPOSE = ["introuvable", "formulaire", "identite_incertaine", "hors_perimetre"];
// Directories and aggregators never accepted as the source of an address (spec 15, points 8-9).
const BANNED_HOSTS = ["francetierslieux", "pagesjaunes", "societe.com", "pappers", "annuaire", "facebook.com", "instagram.com", "linkedin.com", "whois", "google.", "bing.com", "duckduckgo"];
const SUPERLATIFS = ["meilleur", "incroyable", "exceptionnel", "magnifique", "formidable", "extraordinaire", "unique", "remarquable", "fantastique", "parfait", "sublime", "numéro un", "leader"];
const PROMESSES = ["visibilité", "mettre en avant", "mise en avant", "lecteurs", "promets", "garantis", "un lien vers", "backlink", "gratuitement", "rémunér"];
const LIMITS = { texte: [120, 180], relance: [60, 90], texteMax: 2500, relanceMax: 1200 };

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const words = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const isStr = (v) => typeof v === "string" && v.trim() !== "";
// Same replacement as public.outreach_render.
const render = (tpl, vars) => Object.entries(vars).reduce((o, [k, v]) => o.split(`{{${k}}}`).join(v ?? ""), tpl ?? "");
const flat = (s) => s.normalize("NFC").replace(/[’‘`]/g, "'").replace(/[«»“”]/g, '"').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, "").toLowerCase();
const stripTags = (h) => h.replace(/<[^>]+>/g, " ");

// Same rule as the database: "Bonjour Prénom," or "Bonjour,".
const bonjour = (addr) => (isStr(addr?.prenom) ? `Bonjour ${addr.prenom.trim()},` : "Bonjour,");

function checkText(label, text, { min, max, hard, articleUrl }) {
  const n = words(text);
  if (n < min || n > max) err(`${label} : ${n} mots (attendu ${min} à ${max})`);
  if (text.length > hard) err(`${label} : ${text.length} caractères (la base refuse au-delà de ${hard})`);
  if (/\{\{/.test(text)) err(`${label} : variable non remplacée`);
  if (/\b(vous|votre|vos|vôtre|vôtres)\b/i.test(text)) err(`${label} : vouvoiement (le programme tutoie)`);
  if (/n['’]hésite/i.test(text)) warn(`${label} : « n'hésite pas » est banni par le contexte du programme`);
  if (/·/.test(text)) err(`${label} : point médian`);
  const low = text.toLowerCase();
  for (const w of SUPERLATIFS) if (low.includes(w)) err(`${label} : superlatif ou mot d'éloge « ${w} »`);
  for (const w of PROMESSES) if (low.includes(w)) err(`${label} : promesse possible « ${w} »`);
  if (/\b(le|la|les) plus\b/i.test(text)) warn(`${label} : « le/la/les plus » (superlatif ?)`);
  for (const u of text.match(/https?:\/\/[^\s)»"']+/g) ?? []) {
    if (articleUrl && u.replace(/[.,;:]+$/, "") !== articleUrl) err(`${label} : lien autre que l'article (${u})`);
  }
  if (/(^|\n)\s*(Léo( Durand)?|Casa Minga[,/ ].*)\s*$/i.test(text.trim())) {
    warn(`${label} : signature dans le texte ; l'admin ajoute déjà « Léo Durand / Casa Minga » (spec 5.2)`);
  }
}

function load(dir) {
  const file = path.join(dir, "contacts.json");
  if (!fs.existsSync(file)) {
    console.error(`contacts.json introuvable dans ${dir}`);
    process.exit(2);
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`contacts.json illisible : ${e.message}`);
    process.exit(2);
  }
}

function validate(c, dir) {
  if (c.version !== 1) err("version doit valoir 1");
  if (c.program !== PROGRAM) err(`program doit valoir ${PROGRAM}`);
  if (c.source !== undefined && c.source !== "skill") err('source doit valoir "skill" (ou être absente)');
  if (c.sujet !== undefined && !SUJETS.includes(c.sujet)) err(`sujet inconnu (${SUJETS.join(", ")})`);
  if (!isStr(c.prepared_by)) err("prepared_by manquant");

  const a = c.article ?? {};
  if (!/^[a-z0-9-]{3,120}$/.test(a.slug ?? "")) err("article.slug invalide");
  if (!isStr(a.title)) err("article.title manquant");
  if (!/^https:\/\/(sejour\.)?casaminga\.com\//.test(a.url ?? "")) err("article.url doit commencer par https://sejour.casaminga.com/ ou https://casaminga.com/");
  else if (a.slug && !a.url.includes(a.slug)) warn("article.url ne contient pas le slug");
  if (a.lang !== undefined && !/^(fr|en|es)$/.test(a.lang)) err("article.lang invalide");
  if (a.published_at !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(a.published_at)) err("article.published_at doit être AAAA-MM-JJ");

  // fr.json, when present, is the reference for the quoted passages.
  let articleFlat = null;
  const frFile = path.join(dir, "fr.json");
  if (fs.existsSync(frFile)) {
    const fr = JSON.parse(fs.readFileSync(frFile, "utf8"));
    articleFlat = flat(stripTags(fr.content ?? ""));
    if (fr.slug && a.slug && fr.slug !== a.slug) err(`article.slug (${a.slug}) différent de fr.json (${fr.slug})`);
    if (fr.title && a.title && fr.title !== a.title) err("article.title différent du titre de fr.json");
  } else warn("fr.json absent : les passages cités ne sont pas contrôlés");

  const g = c.gabarit ?? {};
  if (!isStr(g.id)) err("gabarit.id manquant");
  for (const k of ["objet", "texte", "relance"]) {
    if (!isStr(g[k])) { err(`gabarit.${k} manquant`); continue; }
    for (const v of g[k].match(/\{\{[^}]*\}\}/g) ?? []) {
      if (!VARS.includes(v.slice(2, -2))) err(`gabarit.${k} : variable inconnue ${v} (attendues : ${VARS.map((x) => `{{${x}}}`).join(" ")})`);
    }
  }
  for (const v of ["bonjour", "phrase", "article_titre", "article_url"]) {
    if (isStr(g.texte) && !g.texte.includes(`{{${v}}}`)) err(`gabarit.texte : {{${v}}} absente`);
  }
  if (isStr(g.relance) && !g.relance.includes("{{bonjour}}")) err("gabarit.relance : {{bonjour}} absente");
  if (isStr(g.objet) && !g.objet.includes("{{lieu}}")) warn("gabarit.objet : {{lieu}} absente");

  const lieux = c.lieux;
  if (!Array.isArray(lieux) || lieux.length < 1 || lieux.length > 100) {
    err("lieux doit contenir 1 à 100 éléments (un lot sans adresse n'a rien à déposer)");
    return;
  }
  const seenMail = new Map();
  const seenName = new Set();
  lieux.forEach((l, i) => {
    const id = `lieu ${i + 1} « ${l?.nom ?? "?"} »`;
    if (!isStr(l.nom)) err(`${id} : nom manquant`);
    if (seenName.has(l.nom)) err(`${id} : nom en double`);
    seenName.add(l.nom);
    if (l.type !== undefined && l.type !== null && !TYPES.includes(l.type)) err(`${id} : type inconnu (${TYPES.join(", ")})`);
    if (!isStr(l.ville)) warn(`${id} : ville absente (sans ville, aucun rapprochement avec une fiche existante)`);
    if (l.site_web && !/^https?:\/\//.test(l.site_web)) err(`${id} : site_web n'est pas une URL`);

    const ad = l.adresse ?? {};
    const email = String(ad.email ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) err(`${id} : adresse e-mail invalide (${email || "vide"})`);
    if (email !== email.toLowerCase()) warn(`${id} : adresse avec majuscules (la base la passe en minuscules)`);
    if (!SOURCES.includes(ad.source)) err(`${id} : adresse.source doit être parmi ${SOURCES.join(", ")}`);
    if (ad.source === "annuaire") err(`${id} : source « annuaire » refusée par la skill (spec 15, point 8)`);
    if (!/^https?:\/\/[^\s]+$/.test(ad.source_url ?? "")) err(`${id} : adresse.source_url doit être l'URL de la page où l'adresse est affichée`);
    else {
      const host = new URL(ad.source_url).hostname.toLowerCase().replace(/^www\./, "");
      if (BANNED_HOSTS.some((b) => host.includes(b))) err(`${id} : source_url sur un annuaire ou un tiers (${host})`);
      if (l.site_web && /^https?:\/\//.test(l.site_web)) {
        const lh = new URL(l.site_web).hostname.replace(/^www\./, "");
        if (!host.endsWith(lh) && !lh.endsWith(host)) warn(`${id} : source_url (${host}) hors du site_web (${lh})`);
      }
    }
    if (typeof ad.adresse_generique !== "boolean") err(`${id} : adresse.adresse_generique doit être true ou false`);
    else if (ad.adresse_generique === false && !isStr(ad.personne) && !isStr(ad.prenom)) err(`${id} : adresse nominative sans personne ni prénom`);
    else if (ad.adresse_generique === false) warn(`${id} : adresse nominative ; à garder seulement si aucune générique n'est publiée ou si la personne est citée dans l'article`);
    if (!isStr(ad.note)) warn(`${id} : adresse.note absente`);
    if (ad.collectee_le && Number.isNaN(Date.parse(ad.collectee_le))) err(`${id} : collectee_le n'est pas une date`);
    if (email) {
      if (seenMail.has(email)) warn(`${id} : même adresse que « ${seenMail.get(email)} » (le second sera ignoré : deja_en_base)`);
      seenMail.set(email, l.nom);
    }

    const ci = l.citation ?? {};
    if (!isStr(ci.passage)) err(`${id} : citation.passage manquant`);
    else if (articleFlat && !articleFlat.includes(flat(ci.passage))) err(`${id} : citation.passage introuvable mot pour mot dans fr.json`);
    if (!isStr(ci.h2)) warn(`${id} : citation.h2 absent`);

    (l.photos ?? []).forEach((p, j) => {
      if (!isStr(p.url) || !isStr(p.legende) || !isStr(p.licence_actuelle)) err(`${id} : photo ${j + 1} sans url, légende ou licence_actuelle (« inconnue » est admis)`);
    });

    if (JSON.stringify(l.demande ?? null) !== JSON.stringify(DEMANDE)) err(`${id} : demande doit valoir ${JSON.stringify(DEMANDE)} dans cet ordre`);

    const b = l.brouillon ?? {};
    if (!isStr(b.phrase) && !isStr(b.texte)) err(`${id} : brouillon.phrase (ou brouillon.texte) manquant`);
    if (isStr(b.texte)) warn(`${id} : brouillon.texte libre : le fil sort de la validation par lot`);
    if (isStr(b.phrase) && b.phrase.length > 450) warn(`${id} : phrase de ${b.phrase.length} caractères (une ou deux phrases)`);

    // Rendered messages, exactly as the database will build them.
    const vars = { lieu: (l.nom ?? "").trim(), bonjour: bonjour(ad), phrase: b.phrase ?? "", article_titre: a.title ?? "", article_url: a.url ?? "" };
    const text = isStr(b.texte) ? render(b.texte, vars) : render(g.texte, vars);
    const follow = render(isStr(l.relance?.texte) ? l.relance.texte : g.relance, vars);
    const subject = render(isStr(b.objet) ? b.objet : g.objet, vars);
    if (!subject) err(`${id} : objet vide`);
    if (subject.length > 200) warn(`${id} : objet de ${subject.length} caractères`);
    if (/\{\{/.test(subject)) err(`${id} : objet avec variable non remplacée`);
    checkText(`${id} : texte`, text, { min: LIMITS.texte[0], max: LIMITS.texte[1], hard: LIMITS.texteMax, articleUrl: a.url });
    checkText(`${id} : relance`, follow, { min: LIMITS.relance[0], max: LIMITS.relance[1], hard: LIMITS.relanceMax, articleUrl: a.url });
  });

  (c.non_deposes ?? []).forEach((n, i) => {
    const id = `non_deposes ${i + 1} « ${n?.nom ?? "?"} »`;
    if (!isStr(n.nom)) err(`${id} : nom manquant`);
    if (!NON_DEPOSE.includes(n.statut)) err(`${id} : statut parmi ${NON_DEPOSE.join(", ")}`);
    if (n.statut === "formulaire" && !/^https?:\/\//.test(n.formulaire_url ?? "")) err(`${id} : formulaire_url manquante`);
    if (seenName.has(n.nom)) err(`${id} : déjà présent dans « lieux »`);
  });
}

function report(dir) {
  for (const w of warnings) console.log(`AVERTISSEMENT  ${w}`);
  for (const e of errors) console.log(`ERREUR  ${e}`);
  console.log(`\n${dir}\n${errors.length} erreur(s), ${warnings.length} avertissement(s)`);
}

// Pick a dollar-quote tag that does not occur in the payload, so no character
// of the JSON (apostrophe, $, backslash) needs escaping.
function dollarTag(s) {
  let tag = "json";
  for (let i = 0; s.includes(`$${tag}`); i++) tag = `json${i}`;
  return `$${tag}$`;
}

export function buildSql(contract) {
  const { non_deposes, ...payload } = contract; // never sent to the database
  const body = JSON.stringify(payload);
  const q = dollarTag(body);
  return `-- Generated by contacter-tool.mjs. One call, nothing else. Run only after Leo's approval.\nselect public.outreach_ingest_batch(${q}${body}${q}::jsonb);\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const [cmd, dirArg] = process.argv.slice(2);
  if (!["check", "sql"].includes(cmd) || !dirArg) {
    console.error('usage: node contacter-tool.mjs <check|sql> "<dossier article>"');
    process.exit(2);
  }
  const dir = path.resolve(dirArg);
  const contract = load(dir);
  validate(contract, dir);
  report(dir);
  if (errors.length) process.exit(1);
  if (cmd === "sql") {
    const out = path.join(dir, "contacts.sql");
    fs.writeFileSync(out, buildSql(contract), "utf8");
    console.log(`contacts.sql écrit (${contract.lieux.length} lieu(x)) : ${out}`);
  }
}
