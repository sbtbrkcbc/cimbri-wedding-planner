import React, { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { api, formatEUR, PRICE_TYPE_LABEL, PRIORITY_LABEL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Sparkles, Wand2, Users, Package, ClipboardList, Heart } from "lucide-react";

const STEPS = [
  { key: "category", label: "Dream category", icon: Sparkles },
  { key: "goal", label: "Dream goal", icon: Heart },
  { key: "vendor", label: "Vendor", icon: Users },
  { key: "service", label: "Service", icon: Package },
  { key: "details", label: "Details", icon: ClipboardList },
  { key: "confirm", label: "Confirm", icon: Check },
];

function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-2 flex-wrap" data-testid="plan-stepper">
      {STEPS.map((s, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : isDone
                  ? "bg-primary-soft text-primary"
                  : "bg-muted text-ink-muted"
              }`}
            >
              <s.icon className="w-3 h-3" strokeWidth={2} />
              <span className="font-medium">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="text-ink-muted">—</span>}
          </li>
        );
      })}
    </ol>
  );
}

function ChoiceGrid({ items, selected, onPick, renderItem, empty }) {
  if (!items || items.length === 0) {
    return (
      <div className="panel p-10 text-center text-ink-muted italic">
        {empty || "Nothing to show yet."}
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onPick(it)}
          data-testid={`choice-${it.id}`}
          className={`text-left panel-interactive p-5 transition-all ${
            selected?.id === it.id ? "ring-2 ring-primary border-primary" : ""
          }`}
        >
          {renderItem(it)}
        </button>
      ))}
    </div>
  );
}

function SummaryCard({ state, servicePrice, total, project }) {
  return (
    <aside className="panel p-6 sticky top-6" data-testid="plan-summary">
      <p className="eyebrow text-primary">Live summary</p>
      <h3 className="font-heading text-xl mt-1">Your pick so far</h3>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Category</dt>
          <dd className="text-right">{state.category?.name || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Dream goal</dt>
          <dd className="text-right">{state.goal?.name || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Vendor</dt>
          <dd className="text-right">{state.vendor?.name || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Service</dt>
          <dd className="text-right">{state.service?.name || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Qty</dt>
          <dd className="text-right">{state.quantity}</dd>
        </div>
      </dl>

      <div className="divider-dashed my-5" />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">Unit price</span>
          <span>{servicePrice}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">Deposit</span>
          <span>{formatEUR(state.service?.deposit || 0)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="eyebrow">Estimated total</span>
          <span className="font-heading text-2xl text-primary">{formatEUR(total)}</span>
        </div>
        {state.service?.price_type === "per_guest" && (
          <p className="text-xs text-ink-muted italic">
            Based on {project?.guest_count || 0} guests — change in Settings.
          </p>
        )}
      </div>

      <p className="text-xs text-ink-muted mt-6 italic">
        Still open — no need to decide just yet.
      </p>
    </aside>
  );
}

export default function PlanBuilder() {
  const { categories, goals, vendors, project, refresh, loading } = usePlanner();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [goal, setGoal] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [service, setService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState("must_have");
  const [status, setStatus] = useState("considering");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredGoals = useMemo(
    () => goals.filter((g) => !category || g.category === category.id),
    [goals, category]
  );

  const filteredVendors = useMemo(() => {
    if (!category) return vendors;
    return vendors.filter((v) => (v.categories || []).includes(category.id));
  }, [vendors, category]);

  const filteredServices = useMemo(() => {
    if (!vendor) return [];
    return (vendor.services || []).filter((s) => {
      if (!s.active) return false;
      if (category && s.category !== category.id) return false;
      if (goal && s.dream_goal && s.dream_goal !== goal.id) return false;
      return true;
    });
  }, [vendor, category, goal]);

  const total = useMemo(() => {
    if (!service) return 0;
    const q = Number(quantity || 1);
    const gc = project?.guest_count || 0;
    if (service.price_type === "per_guest") return service.unit_price * gc * q;
    return service.unit_price * q;
  }, [service, quantity, project]);

  const servicePriceLabel = service
    ? service.price_type === "custom"
      ? "On request"
      : `${formatEUR(service.unit_price)} · ${PRICE_TYPE_LABEL[service.price_type]}`
    : "—";

  const reset = () => {
    setStep(0);
    setCategory(null);
    setGoal(null);
    setVendor(null);
    setService(null);
    setQuantity(1);
    setPriority("must_have");
    setStatus("considering");
    setNotes("");
  };

  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return true; // goal optional
    if (step === 2) return !!vendor;
    if (step === 3) return !!service;
    if (step === 4) return quantity > 0;
    return true;
  };

  const handleSave = async () => {
    if (!service || !vendor || !category) return;
    try {
      setSaving(true);
      await api.createSelection({
        category: category.id,
        dream_goal: goal?.id || null,
        vendor_id: vendor.id,
        service_id: service.id,
        quantity: Number(quantity) || 1,
        priority,
        status,
        notes,
      });
      toast.success("Added to your plan — beautiful choice.");
      await refresh();
      reset();
    } catch (e) {
      toast.error("Couldn't save this pick. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageContainer><p className="text-ink-muted">Preparing the wizard…</p></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Guided planning"
        title="Let's shape one more piece of the day."
        description="Follow the steps — the app will do the math and keep your dream vision tidy."
        testId="plan-builder-header"
      >
        <Button variant="outline" onClick={reset} data-testid="reset-wizard" className="rounded-full">
          Start over
        </Button>
      </PageHeader>

      <div className="mb-8"><Stepper current={step} /></div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          {step === 0 && (
            <ChoiceGrid
              items={categories}
              selected={category}
              onPick={(c) => { setCategory(c); setGoal(null); setVendor(null); setService(null); }}
              renderItem={(c) => (
                <>
                  <p className="eyebrow">{c.color} moment</p>
                  <h4 className="font-heading text-xl mt-1">{c.name}</h4>
                  <p className="text-sm text-ink-soft mt-2">{c.description}</p>
                </>
              )}
              empty="No categories yet."
            />
          )}

          {step === 1 && (
            <ChoiceGrid
              items={filteredGoals}
              selected={goal}
              onPick={setGoal}
              renderItem={(g) => (
                <>
                  <h4 className="font-heading text-lg">{g.name}</h4>
                  <p className="text-sm text-ink-soft mt-2 leading-relaxed">{g.description}</p>
                </>
              )}
              empty="No dream goals here. You can skip this step."
            />
          )}

          {step === 2 && (
            <ChoiceGrid
              items={filteredVendors}
              selected={vendor}
              onPick={(v) => { setVendor(v); setService(null); }}
              renderItem={(v) => (
                <>
                  <p className="eyebrow">{v.status}</p>
                  <h4 className="font-heading text-lg mt-1">{v.name}</h4>
                  {v.contact_person && (
                    <p className="text-sm text-ink-soft mt-1">{v.contact_person}</p>
                  )}
                  {v.location && <p className="text-xs text-ink-muted mt-2">{v.location}</p>}
                  <p className="text-xs text-ink-muted mt-2">{(v.services || []).length} services</p>
                </>
              )}
              empty="No vendors in this category yet — add one in Vendors."
            />
          )}

          {step === 3 && (
            <ChoiceGrid
              items={filteredServices}
              selected={service}
              onPick={setService}
              renderItem={(s) => (
                <>
                  <p className="eyebrow">{PRICE_TYPE_LABEL[s.price_type]}</p>
                  <h4 className="font-heading text-lg mt-1">{s.name}</h4>
                  {s.description && <p className="text-sm text-ink-soft mt-2">{s.description}</p>}
                  <p className="text-sm text-ink font-medium mt-3">
                    {s.price_type === "custom" ? "On request" : formatEUR(s.unit_price)}
                    {s.deposit ? ` • Deposit ${formatEUR(s.deposit)}` : ""}
                  </p>
                </>
              )}
              empty="No matching services. Try loosening the dream goal or picking a different vendor."
            />
          )}

          {step === 4 && service && (
            <div className="panel p-6 md:p-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="qty">Quantity</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={0}
                    step={service.price_type === "per_hour" ? 0.5 : 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-2 rounded-xl"
                    data-testid="quantity-input"
                  />
                  <p className="text-xs text-ink-muted mt-2">
                    {service.price_type === "per_guest"
                      ? `Multiplied by ${project?.guest_count || 0} guests`
                      : service.price_type === "per_hour"
                      ? "Number of hours"
                      : "Number of units / portions"}
                  </p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-2 rounded-xl h-11" data-testid="priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-2 rounded-xl h-11" data-testid="status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="considering">Considering</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 rounded-xl" rows={3} data-testid="notes-input" />
              </div>
            </div>
          )}

          {step === 5 && service && vendor && category && (
            <div className="panel p-8 md:p-10 bg-gradient-to-br from-primary-soft to-surface">
              <p className="eyebrow text-primary">Ready to add</p>
              <h3 className="font-heading text-3xl mt-2">
                {service.name} from {vendor.name}
              </h3>
              <p className="text-ink-soft mt-3 leading-relaxed">
                Part of <strong>{category.name}</strong>
                {goal && <> — dream goal <strong>{goal.name}</strong></>}.
                Quantity <strong>{quantity}</strong>. Marked as <strong>{PRIORITY_LABEL[priority]}</strong> · status <strong>{status}</strong>.
              </p>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="eyebrow">Total</span>
                <span className="font-heading text-4xl text-primary">{formatEUR(total)}</span>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="mt-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base"
                data-testid="save-selection"
              >
                <Wand2 className="w-4 h-4" />
                {saving ? "Adding…" : "Add to my plan"}
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full"
              data-testid="wizard-back"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            {step < STEPS.length - 1 && (
              <Button
                onClick={() => canNext() && setStep((s) => s + 1)}
                disabled={!canNext()}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                data-testid="wizard-next"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <SummaryCard
          state={{ category, goal, vendor, service, quantity }}
          servicePrice={servicePriceLabel}
          total={total}
          project={project}
        />
      </div>
    </PageContainer>
  );
}
