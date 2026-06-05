import { useMemo, useState } from "react";
import listingPlaceholder from "@/assets/listing-placeholder.webp";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MoreHorizontal,
  StickyNote,
  Eye,
  Share2,
  MapPin,
  Loader2,
  Link2,
  Download,
  Copy,
  Check,
} from "lucide-react";
import {
  useFavorites,
  useToggleFavorite,
  useUpdateFavoriteNotes,
  useMyShareLink,
  useCreateShareLink,
  type FavoriteWithListing,
} from "@/hooks/use-favorites";
import { toast } from "sonner";

type SortKey = "recent" | "alpha";

const FALLBACK_IMG = listingPlaceholder;

const Favorites = () => {
  const { user, loading } = useAuth();
  const { data: favorites = [], isLoading } = useFavorites(user?.id);
  const toggleFav = useToggleFavorite();
  const updateNotes = useUpdateFavoriteNotes();
  const { data: share } = useMyShareLink(user?.id);
  const createShare = useCreateShareLink();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FavoriteWithListing | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const types = useMemo(() => {
    const s = new Set<string>();
    favorites.forEach((f) => f.listings?.listing_type && s.add(f.listings.listing_type));
    return [...s];
  }, [favorites]);

  const regions = useMemo(() => {
    const s = new Set<string>();
    favorites.forEach((f) => {
      const r = f.listings?.places?.region || f.listings?.places?.country;
      if (r) s.add(r);
    });
    return [...s];
  }, [favorites]);

  const filtered = useMemo(() => {
    let arr = favorites.filter((f) => !!f.listings);
    if (typeFilter !== "all") arr = arr.filter((f) => f.listings?.listing_type === typeFilter);
    if (regionFilter !== "all")
      arr = arr.filter(
        (f) =>
          f.listings?.places?.region === regionFilter ||
          f.listings?.places?.country === regionFilter
      );
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter(
        (f) =>
          f.listings?.title?.toLowerCase().includes(s) ||
          f.listings?.places?.name?.toLowerCase().includes(s) ||
          f.notes?.toLowerCase().includes(s)
      );
    }
    if (sort === "alpha")
      arr = [...arr].sort((a, b) =>
        (a.listings?.title || "").localeCompare(b.listings?.title || "")
      );
    return arr;
  }, [favorites, typeFilter, regionFilter, sort, search]);

  const openShare = async () => {
    setShareOpen(true);
    if (!share && user) {
      try {
        await createShare.mutateAsync(user.id);
      } catch (e: any) {
        toast.error(e.message || "Erreur lors de la création du lien");
      }
    }
  };

  const shareUrl = share
    ? `${window.location.origin}/shared-wishlist/${share.token}`
    : "";

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <SEO title="Mes favoris | Casa Minga" description="Vos lieux et séjours préférés." />
      <Navbar />
      <div className="container py-8 px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Mes favoris</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vos coups de cœur, prêts à inspirer votre prochain séjour.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button onClick={openShare}>
              <Share2 className="mr-2 h-4 w-4" /> Partager ma liste
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
          {/* Sidebar filters */}
          <aside className="space-y-5 md:sticky md:top-20 md:self-start print:hidden">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recherche
              </label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Titre, lieu, note…"
                className="mt-1.5 h-9 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tous</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Région
              </label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">Toutes</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tri
              </label>
              <div className="mt-1.5 inline-flex rounded-md border bg-background p-0.5 w-full">
                {(
                  [
                    { k: "recent", l: "Récent" },
                    { k: "alpha", l: "A–Z" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => setSort(o.k)}
                    className={`flex-1 rounded-sm px-2 py-1 text-xs transition-colors ${
                      sort === o.k
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="mt-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-12 text-center">
                <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-xl">Aucun favori pour l'instant</h3>
                <p className="mt-2 text-muted-foreground">
                  Explorez les lieux et ajoutez-en à vos favoris.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/discover">Découvrir</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2">
                {filtered.map((fav) => {
                  const l = fav.listings!;
                  const place = l.places;
                  const img =
                    (Array.isArray(l.images) && l.images[0]) || l.image || FALLBACK_IMG;
                  const location = place
                    ? `${place.name}${place.region ? `, ${place.region}` : ""}`
                    : "";
                  const values: string[] = place?.values || [];
                  return (
                    <div
                      key={fav.id}
                      className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="relative">
                        <Link to={`/listing/${l.id}`}>
                          <div className="aspect-[4/3] overflow-hidden">
                            <img src={img} alt={l.title} className="h-full w-full object-cover" />
                          </div>
                        </Link>
                        <button
                          onClick={() =>
                            toggleFav.mutate({
                              userId: user.id,
                              listingId: l.id,
                              currentlyFavorited: true,
                            })
                          }
                          className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 shadow-sm backdrop-blur-sm hover:bg-background print:hidden"
                          aria-label="Retirer des favoris"
                        >
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </button>
                        <div className="absolute right-3 bottom-3 print:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded-full bg-background/90 p-2 shadow-sm backdrop-blur-sm hover:bg-background">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(fav);
                                  setNotesDraft(fav.notes || "");
                                }}
                              >
                                <StickyNote className="mr-2 h-4 w-4" /> Éditer mes notes
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/listing/${l.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> Voir détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={openShare}>
                                <Share2 className="mr-2 h-4 w-4" /> Partager ma liste
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="p-4">
                        <Link to={`/listing/${l.id}`} className="block">
                          <h3 className="font-serif text-lg leading-snug line-clamp-2 group-hover:text-primary">
                            {l.title}
                          </h3>
                          {location && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {location}
                            </div>
                          )}
                        </Link>
                        {values.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {values.slice(0, 3).map((v) => (
                              <Badge key={v} variant="secondary" className="text-[0.6rem]">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {fav.notes && (
                          <button
                            onClick={() => {
                              setEditing(fav);
                              setNotesDraft(fav.notes || "");
                            }}
                            className="mt-3 block w-full text-left rounded-md bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground line-clamp-2 hover:bg-muted"
                          >
                            <StickyNote className="mr-1 inline h-3 w-3" />
                            {fav.notes}
                          </button>
                        )}
                        {!fav.notes && (
                          <button
                            onClick={() => {
                              setEditing(fav);
                              setNotesDraft("");
                            }}
                            className="mt-3 text-xs text-muted-foreground hover:text-foreground print:hidden"
                          >
                            + Ajouter une note privée
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes modal */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notes privées</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Visibles uniquement par vous. Ex : « À visiter en été 2026, vérifier dispo agriculture ».
          </p>
          <Textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={5}
            placeholder="Vos notes…"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button
              onClick={async () => {
                if (!editing) return;
                await updateNotes.mutateAsync({ id: editing.id, notes: notesDraft });
                toast.success("Notes enregistrées");
                setEditing(null);
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager ma wishlist</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Toute personne avec ce lien pourra consulter vos favoris (vos notes privées
            restent cachées).
          </p>
          {shareUrl ? (
            <div className="flex gap-2">
              <Input readOnly value={shareUrl} className="text-xs" />
              <Button onClick={copyLink} variant="secondary">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Génération du lien…
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShareOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Favorites;
