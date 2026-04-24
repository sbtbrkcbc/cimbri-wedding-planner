import React, { useState } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Heart, RefreshCw } from "lucide-react";

export default function Settings() {
  const { project, refresh, loading } = usePlanner();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  React.useEffect(() => {
    if (project) {
      setForm({
        couple_names: project.couple_names || "",
        wedding_date: project.wedding_date || "",
        location: project.location || "",
        guest_count: project.guest_count || 0,
        target_budget: project.target_budget || 0,
        style_notes: project.style_notes || "",
      });
    }
  }, [project]);

  if (loading || !form) return <PageContainer><p className="text-ink-muted">Loading…</p></PageContainer>;

  const save = async () => {
    try {
      setSaving(true);
      const patch = {
        ...form,
        wedding_date: form.wedding_date || null,
        guest_count: Number(form.guest_count) || 0,
        target_budget: Number(form.target_budget) || 0,
      };
      await api.updateProject(patch);
      toast.success("Saved — the date is in.");
      await refresh();
    } catch {
      toast.error("Couldn't save.");
    } finally {
      setSaving(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm("Reset and reseed the whole planner with starter vendors & tasks? Your current data will be replaced.")) return;
    try {
      setReseeding(true);
      await api.seed(true);
      toast.success("Planner reset with fresh seed data.");
      await refresh();
    } finally {
      setReseeding(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Your wedding, your rules"
        title="Settings."
        description="The big picture facts — date, location, guests, budget."
        testId="settings-header"
      />

      <div className="panel p-6 md:p-8 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Couple names</Label>
          <Input
            data-testid="couple-names"
            value={form.couple_names}
            onChange={(e) => setForm({ ...form, couple_names: e.target.value })}
            placeholder="Veronica & …"
            className="mt-2 rounded-xl"
          />
        </div>
        <div>
          <Label>Wedding date</Label>
          <Input
            data-testid="wedding-date"
            type="date"
            value={form.wedding_date || ""}
            onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
            className="mt-2 rounded-xl"
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="mt-2 rounded-xl"
          />
        </div>
        <div>
          <Label>Guest count</Label>
          <Input
            data-testid="guest-count"
            type="number"
            min={0}
            value={form.guest_count}
            onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
            className="mt-2 rounded-xl"
          />
          <p className="text-xs text-ink-muted mt-1">Used to calculate per-guest services.</p>
        </div>
        <div>
          <Label>Target budget €</Label>
          <Input
            data-testid="target-budget"
            type="number"
            min={0}
            value={form.target_budget}
            onChange={(e) => setForm({ ...form, target_budget: e.target.value })}
            className="mt-2 rounded-xl"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Style & vibe notes</Label>
          <Textarea
            rows={4}
            value={form.style_notes}
            onChange={(e) => setForm({ ...form, style_notes: e.target.value })}
            className="mt-2 rounded-xl"
            placeholder="Sage green, dusty rose, candles, lanterns, a Turkish corner…"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            data-testid="save-settings"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="panel p-6 md:p-8 mt-10 bg-gradient-to-br from-secondary-soft to-surface">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-2xl">Danger zone — reseed</h2>
            <p className="text-ink-soft mt-2 text-sm">
              Reset your planner with the starter vendors (Locanda del Nocciolo, Symon, Davide, Max, Sonia, Heart of Gold) and task list. Useful if you'd like to start fresh.
            </p>
            <Button
              variant="outline"
              onClick={handleReseed}
              disabled={reseeding}
              className="mt-4 rounded-full border-secondary/40 text-secondary hover:bg-secondary/10 hover:text-secondary"
              data-testid="reseed-btn"
            >
              <RefreshCw className="w-4 h-4" />
              {reseeding ? "Resetting…" : "Reset & reseed"}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
