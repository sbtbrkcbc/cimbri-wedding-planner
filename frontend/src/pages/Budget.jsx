import React, { useMemo } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { formatEUR } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wallet, PiggyBank, Sparkles } from "lucide-react";

export default function Budget() {
  const { selections, categories, project, loading } = usePlanner();

  const bookedOrSelected = selections.filter((s) => s.status === "selected" || s.status === "booked");
  const considering = selections.filter((s) => s.status === "considering");

  const totalSelected = bookedOrSelected.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalConsidering = considering.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalDeposits = bookedOrSelected.reduce((sum, s) => sum + (s.deposit || 0), 0);
  const target = project?.target_budget || 0;
  const pct = target ? Math.min(100, Math.round((totalSelected / target) * 100)) : 0;

  const byCat = useMemo(() => {
    const map = {};
    for (const s of selections) {
      map[s.category] = map[s.category] || { selected: 0, considering: 0, items: [] };
      if (s.status === "considering") map[s.category].considering += s.total || 0;
      else map[s.category].selected += s.total || 0;
      map[s.category].items.push(s);
    }
    return map;
  }, [selections]);

  const mustHaveTotal = bookedOrSelected
    .filter((s) => s.priority === "must_have")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  const niceTotal = bookedOrSelected
    .filter((s) => s.priority === "nice_to_have")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  const optionalTotal = bookedOrSelected
    .filter((s) => s.priority === "optional")
    .reduce((sum, s) => sum + (s.total || 0), 0);

  if (loading) return <PageContainer><p className="text-ink-muted">Loading budget…</p></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Where the money goes"
        title="Transparent budget."
        description="Every total traceable to a service and quantity. Nothing hidden."
        testId="budget-header"
      />

      <div className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="panel p-6">
          <Wallet className="w-5 h-5 text-primary" strokeWidth={1.5} />
          <p className="eyebrow mt-4">Target</p>
          <p className="font-heading text-3xl mt-1">{formatEUR(target)}</p>
          <p className="text-xs text-ink-muted mt-1">Set in Settings</p>
        </div>
        <div className="panel p-6">
          <Sparkles className="w-5 h-5 text-accent" strokeWidth={1.5} />
          <p className="eyebrow mt-4">Selected + booked</p>
          <p className="font-heading text-3xl mt-1">{formatEUR(totalSelected)}</p>
          <Progress value={pct} className="mt-3 h-2 bg-border" />
          <p className="text-xs text-ink-muted mt-2">{pct}% of target</p>
        </div>
        <div className="panel p-6">
          <PiggyBank className="w-5 h-5 text-secondary" strokeWidth={1.5} />
          <p className="eyebrow mt-4">Deposits owed</p>
          <p className="font-heading text-3xl mt-1">{formatEUR(totalDeposits)}</p>
          <p className="text-xs text-ink-muted mt-1">To block the dates</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="panel p-6 bg-primary-soft">
          <p className="eyebrow">Must have</p>
          <p className="font-heading text-2xl mt-1">{formatEUR(mustHaveTotal)}</p>
        </div>
        <div className="panel p-6 bg-secondary-soft">
          <p className="eyebrow">Nice to have</p>
          <p className="font-heading text-2xl mt-1">{formatEUR(niceTotal)}</p>
        </div>
        <div className="panel p-6 bg-accent-soft">
          <p className="eyebrow">Optional</p>
          <p className="font-heading text-2xl mt-1">{formatEUR(optionalTotal)}</p>
        </div>
      </div>

      <div className="panel p-6 md:p-8">
        <h2 className="font-heading text-2xl mb-6">Breakdown by category</h2>
        {Object.keys(byCat).length === 0 ? (
          <p className="text-ink-muted italic">No picks yet — head to Plan Builder.</p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {categories.filter((c) => byCat[c.id]).map((c) => {
              const d = byCat[c.id];
              const catTotal = d.selected;
              const catPct = target ? Math.min(100, (catTotal / target) * 100) : 0;
              return (
                <AccordionItem key={c.id} value={c.id} className="border border-border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-3">
                      <div className="text-left">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-ink-muted">{d.items.length} item{d.items.length !== 1 && "s"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-lg">{formatEUR(catTotal)}</p>
                        {d.considering > 0 && <p className="text-xs text-ink-muted">+{formatEUR(d.considering)} considering</p>}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Progress value={catPct} className="h-1.5 bg-border mb-4" />
                    <ul className="divide-y divide-dashed divide-border">
                      {d.items.map((s) => (
                        <li key={s.id} className="py-2 flex justify-between text-sm">
                          <div>
                            <p>{s.service_name} <span className="text-ink-muted">· {s.vendor_name}</span></p>
                            <p className="text-xs text-ink-muted">qty {s.quantity} · {s.status}</p>
                          </div>
                          <p className="font-medium">{formatEUR(s.total)}</p>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {totalConsidering > 0 && (
        <div className="panel p-6 mt-8 bg-secondary-soft">
          <p className="eyebrow text-secondary">Still considering</p>
          <p className="font-heading text-2xl mt-1">{formatEUR(totalConsidering)}</p>
          <p className="text-sm text-ink-soft mt-1">These haven't been added to the total yet — confirm them in Final Decisions.</p>
        </div>
      )}
    </PageContainer>
  );
}
