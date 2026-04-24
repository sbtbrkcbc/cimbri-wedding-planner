import React, { useMemo } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { api, formatEUR, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Check, Heart } from "lucide-react";
import { toast } from "sonner";

export default function FinalDecisions() {
  const { categories, selections, refresh, loading } = usePlanner();

  const grouped = useMemo(() => {
    const map = {};
    for (const s of selections) {
      map[s.category] = map[s.category] || [];
      map[s.category].push(s);
    }
    return map;
  }, [selections]);

  const total = useMemo(() => {
    return selections
      .filter((s) => s.status === "selected" || s.status === "booked")
      .reduce((sum, s) => sum + (s.total || 0), 0);
  }, [selections]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateSelection(id, { status });
      toast.success(`Moved to ${STATUS_LABEL[status]}`);
      await refresh();
    } catch {
      toast.error("Couldn't update.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this pick from your plan?")) return;
    await api.deleteSelection(id);
    toast.success("Removed.");
    await refresh();
  };

  if (loading) return <PageContainer><p className="text-ink-muted">Loading…</p></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="The whole picture"
        title="Your final decisions."
        description="Everything you've chosen so far, category by category. Change status any time — nothing is set in stone until it is."
        testId="final-decisions-header"
      />

      <div className="panel p-8 mb-10 bg-gradient-to-br from-primary-soft to-surface">
        <p className="eyebrow text-primary">The total so far</p>
        <p className="font-heading text-5xl md:text-6xl mt-2 text-ink">{formatEUR(total)}</p>
        <p className="text-ink-soft mt-2">Counts only items marked <em>Selected</em> or <em>Booked</em>.</p>
      </div>

      {selections.length === 0 ? (
        <div className="panel p-12 text-center">
          <Heart className="w-8 h-8 mx-auto text-primary" strokeWidth={1.5} />
          <p className="mt-4 text-ink-soft italic">No picks yet — head to Plan Builder to begin.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categories
            .filter((c) => grouped[c.id])
            .map((cat) => (
              <section key={cat.id} className="panel p-6 md:p-8" data-testid={`final-section-${cat.id}`}>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="eyebrow">{cat.name}</p>
                    <h2 className="font-heading text-2xl md:text-3xl mt-1">{cat.description}</h2>
                  </div>
                  <p className="font-heading text-xl text-primary">
                    {formatEUR(
                      grouped[cat.id]
                        .filter((s) => s.status === "selected" || s.status === "booked")
                        .reduce((sum, s) => sum + (s.total || 0), 0)
                    )}
                  </p>
                </div>

                <ul className="mt-6 divide-y divide-dashed divide-border">
                  {grouped[cat.id].map((s) => {
                    const statusTone = {
                      considering: "bg-muted text-ink-soft",
                      selected: "bg-accent-soft text-accent",
                      booked: "bg-primary-soft text-primary",
                    }[s.status];
                    return (
                      <li key={s.id} className="py-4 flex flex-col md:flex-row md:items-center gap-3" data-testid={`selection-${s.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink">{s.service_name}</p>
                          <p className="text-sm text-ink-muted mt-0.5">
                            {s.vendor_name}
                            {s.quantity > 1 && ` · qty ${s.quantity}`}
                          </p>
                          {s.notes && <p className="text-xs text-ink-muted italic mt-1">{s.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="rounded-full border-border">
                            {PRIORITY_LABEL[s.priority]}
                          </Badge>
                          <span className={`chip ${statusTone}`}>{STATUS_LABEL[s.status]}</span>
                          <span className="font-heading text-lg min-w-[90px] text-right">
                            {formatEUR(s.total)}
                          </span>
                          <Select value={s.status} onValueChange={(v) => handleStatusChange(s.id, v)}>
                            <SelectTrigger className="w-36 rounded-full h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="considering">Considering</SelectItem>
                              <SelectItem value="selected">Selected</SelectItem>
                              <SelectItem value="booked">Booked</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
        </div>
      )}
    </PageContainer>
  );
}
