import React, { useMemo } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { formatEUR } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, CircleDashed } from "lucide-react";

const IMAGE_MAP = {
  entrance_flowers: "https://images.unsplash.com/photo-1677607787250-1e4e9adf2bdc?auto=format&fit=crop&w=1200&q=80",
  civil_arch: "https://images.unsplash.com/photo-1767961054383-93f2d184d13b?auto=format&fit=crop&w=1200&q=80",
  dinner_lighting: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  table_decor: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=1200&q=80",
  cake_corner: "https://images.unsplash.com/photo-1621114018555-1ad5b08ea59c?auto=format&fit=crop&w=1200&q=80",
  chocolate_fountain: "https://static.prod-images.emergentagent.com/jobs/844402a1-771b-436a-b066-0fd9d9875b8f/images/752d4c4a13df0b0a23af0bd571f43285d72a55ee167e9313dc7f5e71cbc7f130.png",
  photo_corner: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  photobooth: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
  turkish_corner: "https://static.prod-images.emergentagent.com/jobs/844402a1-771b-436a-b066-0fd9d9875b8f/images/65200b28b0297ed989ca6b88376d0f9aa9c4c51ce5344af5924fdac6fc7ff5ef.png",
  ireland_corner: "https://images.unsplash.com/photo-1529693662653-9d480530a697?auto=format&fit=crop&w=1200&q=80",
  guest_basket: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80",
  ceremony_water_rice: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
  ceremony_live_music: "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=1200&q=80",
  aperitif_live_music: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1200&q=80",
  dj_after_cake: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
  live_sketching: "https://static.prod-images.emergentagent.com/jobs/844402a1-771b-436a-b066-0fd9d9875b8f/images/28d31a81e15339381491d64dc1249cef93704b21c82ab9b5be2f86403423263d.png",
  photo_main: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  video_main: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  wedding_menu: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  guest_rooms: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  invitation_suite: "https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1200&q=80",
};

function GoalCard({ goal, selections, categoryName }) {
  const linked = (selections || []).filter((s) => s.dream_goal === goal.id);
  const status =
    linked.find((l) => l.status === "booked")
      ? { label: "Booked", tone: "bg-primary text-primary-foreground", Icon: Check }
      : linked.find((l) => l.status === "selected")
      ? { label: "Selected", tone: "bg-accent text-accent-foreground", Icon: Check }
      : linked.length > 0
      ? { label: "In progress", tone: "bg-secondary text-secondary-foreground", Icon: CircleDashed }
      : { label: "Dreaming", tone: "bg-muted text-ink-soft", Icon: Sparkles };

  const total = linked.reduce((sum, l) => sum + (l.total || 0), 0);
  const img = IMAGE_MAP[goal.id];

  return (
    <article
      className="panel-interactive overflow-hidden flex flex-col group"
      data-testid={`dream-goal-${goal.id}`}
    >
      <div className="aspect-[4/3] relative bg-muted">
        {img ? (
          <img
            src={img}
            alt={goal.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-ink-muted" strokeWidth={1.5} />
          </div>
        )}
        <div className={`absolute top-3 left-3 chip ${status.tone}`}>
          <status.Icon className="w-3 h-3" strokeWidth={2} />
          {status.label}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="eyebrow">{categoryName}</p>
        <h3 className="font-heading text-xl mt-1">{goal.name}</h3>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed flex-1">{goal.description}</p>
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-dashed border-border">
          <div>
            <p className="text-xs text-ink-muted">Current plan</p>
            <p className="text-sm font-medium">{total > 0 ? formatEUR(total) : "Not priced yet"}</p>
          </div>
          {linked.length > 0 && (
            <Badge variant="outline" className="rounded-full border-primary/30 text-primary">
              {linked.length} pick{linked.length !== 1 && "s"}
            </Badge>
          )}
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
        title="Veronica's dream vision."
        description="These are the little intentions — the ones that make the day feel like you. Keep them visible; assign vendors only when you're ready."
        testId="dream-vision-header"
      />

      {Object.entries(grouped).map(([catId, goalList]) => {
        const cat = categories.find((c) => c.id === catId);
        return (
          <section key={catId} className="mb-14" data-testid={`dream-section-${catId}`}>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="eyebrow">{cat?.name || catId}</p>
                <h2 className="font-heading text-2xl md:text-3xl mt-1">{cat?.description}</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {goalList.map((g) => (
                <GoalCard key={g.id} goal={g} selections={selections} categoryName={cat?.name || catId} />
              ))}
            </div>
          </section>
        );
      })}
    </PageContainer>
  );
}
