import React, { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { api, formatEUR } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sparkles, Check, CircleDashed, Flower2, Camera, Music2, Cake, Heart, PartyPopper,
  BookOpen, UtensilsCrossed, Home as HomeIcon, Car, Palette, Plus, Trash2,
} from "lucide-react";

const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

const IMAGE_MAP = {
  entrance_flowers: "https://images.unsplash.com/photo-1677607787250-1e4e9adf2bdc?auto=format&fit=crop&w=600&q=70",
  civil_arch: IMG("1519225421980-715cb0215aed"),
  dinner_lighting: IMG("1519741497674-611481863552"),
  table_decor: IMG("1464366400600-7168b8af9bc3"),
  cake_corner: IMG("1511285560929-80b456fea0bc"),
  chocolate_fountain: "/photos/chocolate-fountain.png",
  photo_corner: IMG("1478146059778-26028b07395a"),
  photobooth: IMG("1527529482837-4698179dc6ce"),
  turkish_corner: "/photos/turkish-corner.png",
  ireland_corner: IMG("1529693662653-9d480530a697"),
  guest_basket: IMG("1531058020387-3be344556be6"),
  ceremony_water_rice: IMG("1551731409-43eb3e517a1a"),
  ceremony_live_music: IMG("1465821185615-20b3c2fbf41b"),
  aperitif_live_music: IMG("1514320291840-2e0a9bf2a9ae"),
  dj_after_cake: IMG("1470225620780-dba8ba36b745"),
  live_sketching: "/photos/live-sketching.png",
  photo_main: IMG("1511795409834-ef04bbd61622"),
  video_main: IMG("1505118380757-91f5f5632de0"),
  wedding_menu: IMG("1414235077428-338989a2e8c0"),
  guest_rooms: IMG("1566073771259-6a8506099945"),
  invitation_suite: IMG("1530023367847-a683933f4172"),
};

const CATEGORY_THEME = {
  florals: { gradient: "from-secondary-soft to-secondary/30", Icon: Flower2 },
  photography: { gradient: "from-accent-soft to-accent/30", Icon: Camera },
  video: { gradient: "from-accent-soft to-accent/20", Icon: Camera },
  music_ceremony: { gradient: "from-primary-soft to-primary/20", Icon: Music2 },
  music_aperitif: { gradient: "from-primary-soft to-primary/20", Icon: Music2 },
  music_dinner: { gradient: "from-primary-soft to-primary/20", Icon: Music2 },
  music_dj: { gradient: "from-accent-soft to-secondary/20", Icon: PartyPopper },
  cake: { gradient: "from-secondary-soft to-accent-soft", Icon: Cake },
  guest_corners: { gradient: "from-accent-soft to-accent/20", Icon: BookOpen },
  comfort: { gradient: "from-primary-soft to-primary/10", Icon: Heart },
  live_art: { gradient: "from-secondary-soft to-secondary/20", Icon: Palette },
  stationery: { gradient: "from-muted to-secondary-soft", Icon: BookOpen },
  accommodation: { gradient: "from-primary-soft to-muted", Icon: HomeIcon },
  transport: { gradient: "from-muted to-accent-soft", Icon: Car },
  venue: { gradient: "from-primary-soft to-secondary-soft", Icon: UtensilsCrossed },
  other: { gradient: "from-muted to-primary-soft", Icon: Sparkles },
};

function GoalCard({ goal, selections, onDelete }) {
  const [imgFailed, setImgFailed] = useState(false);

  const linked = (selections || []).filter((s) => s.dream_goal === goal.id);
  const booked = linked.find((l) => l.status === "booked");
  const selected = linked.find((l) => l.status === "selected");

  const status = booked
    ? { label: "Booked", tone: "bg-primary text-primary-foreground", Icon: Check }
    : selected
    ? { label: "Selected", tone: "bg-accent text-accent-foreground", Icon: Check }
    : linked.length > 0
    ? { label: "In progress", tone: "bg-secondary text-secondary-foreground", Icon: CircleDashed }
    : { label: "Dreaming", tone: "bg-surface/90 text-ink-soft backdrop-blur", Icon: Sparkles };

  const total = linked.reduce((sum, l) => sum + (l.total || 0), 0);
  const img = IMAGE_MAP[goal.id];
  const theme = CATEGORY_THEME[goal.category] || CATEGORY_THEME.other;
  const showImage = img && !imgFailed;

  return (
    <article
      className="panel-interactive overflow-hidden flex flex-col group relative"
      data-testid={`dream-goal-${goal.id}`}
    >
      {goal.custom && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(goal); }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-surface/90 backdrop-blur text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
          title="Remove this dream"
          data-testid={`delete-goal-${goal.id}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="aspect-square relative overflow-hidden">
        {showImage ? (
          <img
            src={img}
            alt={goal.name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
            <theme.Icon className="w-10 h-10 text-ink/40" strokeWidth={1.2} />
          </div>
        )}
        <div className={`absolute top-2.5 left-2.5 chip text-[10px] ${status.tone}`}>
          <status.Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
          {status.label}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-base leading-snug line-clamp-2 min-h-[2.6em]">
          {goal.name}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-border">
          <p className="text-[11px] text-ink-muted">
            {linked.length === 0
              ? "Not priced"
              : `${linked.length} pick${linked.length > 1 ? "s" : ""}`}
          </p>
          <p className="text-xs font-medium text-ink">
            {total > 0 ? formatEUR(total) : "—"}
          </p>
        </div>
      </div>
    </article>
  );
}

function AddDreamCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="add-dream-goal"
      className="aspect-square w-full rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary-soft/40 transition-all flex flex-col items-center justify-center text-center group p-4"
    >
      <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Plus className="w-5 h-5" strokeWidth={2} />
      </div>
      <h3 className="font-heading text-base mt-3">Add a dream</h3>
      <p className="text-xs text-ink-muted mt-1">A moment of your own.</p>
    </button>
  );
}

export default function DreamVision() {
  const { goals, categories, selections, refresh, loading } = usePlanner();

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", description: "" });

  const grouped = useMemo(() => {
    const map = {};
    for (const g of goals) {
      map[g.category] = map[g.category] || [];
      map[g.category].push(g);
    }
    return map;
  }, [goals]);

  const openFor = (catId) => {
    setForm({ name: "", category: catId || "", description: "" });
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.category) {
      toast.error("Please give it a name and a category.");
      return;
    }
    try {
      setCreating(true);
      await api.createGoal(form);
      toast.success(`"${form.name}" added to your dream vision.`);
      setOpen(false);
      await refresh();
    } catch (e) {
      toast.error("Couldn't add that dream.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (g) => {
    if (!confirm(`Remove "${g.name}" from your dream vision?`)) return;
    try {
      await api.deleteGoal(g.id);
      toast.success("Removed.");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Couldn't remove this dream.");
    }
  };

  if (loading) {
    return <PageContainer><p className="text-ink-muted">Loading dream board…</p></PageContainer>;
  }

  // Categories that have goals (so we render section per category) plus "Other" for orphans
  const visibleCategoryIds = Object.keys(grouped);
  const categoriesToShow = categories.filter((c) => visibleCategoryIds.includes(c.id));
  // Add categories present in grouped but not in canonical list (custom user categories)
  const customCatIds = visibleCategoryIds.filter(
    (id) => !categories.some((c) => c.id === id)
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="The feeling of the day"
        title="Your dream vision."
        description="The little intentions that make the day feel like yours — browse at your own pace, and add your own."
        testId="dream-vision-header"
      >
        <Button
          onClick={() => openFor(null)}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          data-testid="add-dream-btn-top"
        >
          <Plus className="w-4 h-4" /> Add a dream
        </Button>
      </PageHeader>

      {categoriesToShow.map((cat) => {
        const goalList = grouped[cat.id];
        return (
          <section key={cat.id} className="mb-12" data-testid={`dream-section-${cat.id}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">{cat.name}</p>
              <button
                type="button"
                onClick={() => openFor(cat.id)}
                className="text-xs text-primary hover:underline"
                data-testid={`add-to-${cat.id}`}
              >
                + Add to this section
              </button>
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {goalList.map((g) => (
                <GoalCard key={g.id} goal={g} selections={selections} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        );
      })}

      {customCatIds.length > 0 && customCatIds.map((cid) => {
        const goalList = grouped[cid];
        return (
          <section key={cid} className="mb-12">
            <div className="mb-4">
              <p className="eyebrow">{cid}</p>
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {goalList.map((g) => (
                <GoalCard key={g.id} goal={g} selections={selections} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        );
      })}

      {/* CTA card at the bottom always */}
      <section className="mb-12">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AddDreamCard onClick={() => openFor(null)} />
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">A dream of your own</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-2">
            <div>
              <Label>What is it?</Label>
              <Input
                data-testid="new-goal-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vintage Vespa for arrival, Lavender ceremony toss"
                className="mt-2 rounded-xl"
                autoFocus
              />
            </div>
            <div>
              <Label>Which moment of the day?</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger data-testid="new-goal-category" className="mt-2 rounded-xl h-11">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Why does it matter (optional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="The feeling, the visual, the why…"
                className="mt-2 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !form.name.trim() || !form.category}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="save-new-goal"
            >
              {creating ? "Adding…" : "Add to my vision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
