import React, { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { formatEUR } from "@/lib/api";
import { Sparkles, Check, CircleDashed, Flower2, Camera, Music2, Cake, Users, Heart, PartyPopper, BookOpen, UtensilsCrossed, Home as HomeIcon, Car, Palette } from "lucide-react";

// Curated images — all URLs verified to return 200. Unverified/broken fall back to a gradient icon.
const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

const IMAGE_MAP = {
  entrance_flowers: "https://images.unsplash.com/photo-1677607787250-1e4e9adf2bdc?auto=format&fit=crop&w=600&q=70",
  civil_arch: IMG("1519225421980-715cb0215aed"),
  dinner_lighting: IMG("1519741497674-611481863552"),
  table_decor: IMG("1464366400600-7168b8af9bc3"),
  cake_corner: IMG("1511285560929-80b456fea0bc"),
  chocolate_fountain: "https://static.prod-images.emergentagent.com/jobs/844402a1-771b-436a-b066-0fd9d9875b8f/images/752d4c4a13df0b0a23af0bd571f43285d72a55ee167e9313dc7f5e71cbc7f130.png",
  photo_corner: IMG("1478146059778-26028b07395a"),
  photobooth: IMG("1527529482837-4698179dc6ce"),
  turkish_corner: "https://static.prod-images.emergentagent.com/jobs/844402a1-771b-436a-b066-0fd9d9875b8f/images/65200b28b0297ed989ca6b88376d0f9aa9c4c51ce5344af5924fdac6fc7ff5ef.png",
  ireland_corner: IMG("1529693662653-9d480530a697"),
  guest_basket: IMG("1531058020387-3be344556be6"),
  ceremony_water_rice: IMG("1551731409-43eb3e517a1a"),
  ceremony_live_music: IMG("1465821185615-20b3c2fbf41b"),
  aperitif_live_music: IMG("1514320291840-2e0a9bf2a9ae"),
  dj_after_cake: IMG("1470225620780-dba8ba36b745"),
  live_sketching: "https://static.prod-images.emergentagent.com/jobs/844402a1-771b-436a-b066-0fd9d9875b8f/images/28d31a81e15339381491d64dc1249cef93704b21c82ab9b5be2f86403423263d.png",
  photo_main: IMG("1511795409834-ef04bbd61622"),
  video_main: IMG("1505118380757-91f5f5632de0"),
  wedding_menu: IMG("1414235077428-338989a2e8c0"),
  guest_rooms: IMG("1566073771259-6a8506099945"),
  invitation_suite: IMG("1530023367847-a683933f4172"),
};

// Visual theme per category — soft gradient + icon for images that fail or don't exist
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

function GoalCard({ goal, selections }) {
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
      className="panel-interactive overflow-hidden flex flex-col group"
      data-testid={`dream-goal-${goal.id}`}
    >
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

export default function DreamVision() {
  const { goals, categories, selections, loading } = usePlanner();

  const grouped = useMemo(() => {
    const map = {};
    for (const g of goals) {
      map[g.category] = map[g.category] || [];
      map[g.category].push(g);
    }
    return map;
  }, [goals]);

  if (loading) {
    return <PageContainer><p className="text-ink-muted">Loading dream board…</p></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="The feeling of the day"
        title="Your dream vision."
        description="The little intentions that make the day feel like yours — browse at your own pace."
        testId="dream-vision-header"
      />

      {Object.entries(grouped).map(([catId, goalList]) => {
        const cat = categories.find((c) => c.id === catId);
        return (
          <section key={catId} className="mb-12" data-testid={`dream-section-${catId}`}>
            <div className="mb-4">
              <p className="eyebrow">{cat?.name || catId}</p>
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {goalList.map((g) => (
                <GoalCard key={g.id} goal={g} selections={selections} />
              ))}
            </div>
          </section>
        );
      })}
    </PageContainer>
  );
}
