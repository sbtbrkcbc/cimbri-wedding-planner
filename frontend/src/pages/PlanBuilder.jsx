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
  { key: "category", label: "Category", icon: Sparkles },
  { key: "goal", label: "Dream", icon: Heart },
  { key: "vendor", label: "Vendor", icon: Users },
  { key: "service", label: "Services", icon: Package },
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

function ChoiceGrid({ items, selected, onPick, renderItem, empty, multi = false }) {
  if (!items || items.length === 0) {
    return (
      <div className="panel p-10 text-center text-ink-muted italic">
        {empty || "Nothing to show yet."}
      </div>
    );
  }
  const isSelected = (it) => {
    if (multi) return Array.isArray(selected) && selected.some((s) => s.id === it.id);
    return selected?.id === it.id;
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onPick(it)}
          data-testid={`choice-${it.id}`}
          className={`text-left panel-interactive p-5 transition-all relative ${
            isSelected(it) ? "ring-2 ring-primary border-primary" : ""
          }`}
        >
          {multi && (
            <div
              className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected(it)
                  ? "bg-primary border-primary"
                  : "border-border bg-surface"
              }`}
            >
              {isSelected(it) && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
            </div>
          )}
          {renderItem(it)}
        </button>
      ))}
    </div>
  );
}

function SummaryCard({ state, total, project }) {
  const servicesCount = state.services?.length || 0;
  return (
    <aside className="panel p-6 sticky top-6" data-testid="plan-summary">
      <p className="eyebrow text-primary">Live summary</p>
      <h3 className="font-heading text-xl mt-1">Your picks so far</h3>

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
          <dt className="text-ink-muted">Services</dt>
          <dd className="text-right">{servicesCount} chosen</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Qty (each)</dt>
          <dd className="text-right">{state.quantity}</dd>
        </div>
      </dl>

      <div className="divider-dashed my-5" />

      {servicesCount > 0 && (
        <ul className="space-y-2 mb-4 text-xs">
          {state.services.map((s) => (
            <li key={s.id} className="flex justify-between gap-2 text-ink-soft">
              <span className="truncate">{s.name}</span>
              <span className="text-ink-muted shrink-0">
                {s.price_type === "custom" ? "—" : formatEUR(s.unit_price)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between items-baseline">
        <span className="eyebrow">Estimated total</span>
        <span className="font-heading text-2xl text-primary">{formatEUR(total)}</span>
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
  const [services, setServices] = useState([]); // array of selected services
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

  const toggleService = (svc) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === svc.id);
      return exists ? prev.filter((s) => s.id !== svc.id) : [...prev, svc];
    });
  };

  const totalForOne = (svc) => {
    const q = Number(quantity || 1);
    const gc = project?.guest_count || 0;
    if (svc.price_type === "per_guest") return svc.unit_price * gc * q;
    return svc.unit_price * q;
  };

  const total = useMemo(
    () => services.reduce((sum, s) => sum + totalForOne(s), 0),
    [services, quantity, project]
  );

  const reset = () => {
    setStep(0);
    setCategory(null);
    setGoal(null);
    setVendor(null);
    setServices([]);
    setQuantity(1);
    setPriority("must_have");
    setStatus("considering");
    setNotes("");
  };

  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return true;
    if (step === 2) return !!vendor;
    if (step === 3) return services.length > 0;
    if (step === 4) return quantity > 0;
    return true;
  };

  const handleSave = async () => {
    if (services.length === 0 || !vendor || !category) return;
    try {
      setSaving(true);
      for (const svc of services) {
        await api.createSelection({
          category: category.id,
          dream_goal: goal?.id || null,
          vendor_id: vendor.id,
          service_id: svc.id,
          quantity: Number(quantity) || 1,
          priority,
          status,
          notes,
        });
      }
      toast.success(
        services.length === 1
          ? "Added to your plan — beautiful choice."
          : `${services.length} services added to your plan.`
      );
      await refresh();
      reset();
    } catch (e) {
      toast.error("Couldn't save these picks. Please try again.");
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
        description="Follow the steps — you can pick several services from the same vendor at once."
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
              onPick={(c) => { setCategory(c); setGoal(null); setVendor(null); setServices([]); }}
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
              onPick={(v) => { setVendor(v); setServices([]); }}
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
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-ink-soft">
                  Tick any services you'd like to add — you can pick more than one.
                </p>
                <p className="text-xs text-ink-muted">{services.length} selected</p>
              </div>
              <ChoiceGrid
                items={filteredServices}
                selected={services}
                onPick={toggleService}
                multi
                renderItem={(s) => (
                  <>
                    <p className="eyebrow">{PRICE_TYPE_LABEL[s.price_type]}</p>
                    <h4 className="font-heading text-lg mt-1 pr-8">{s.name}</h4>
                    {s.description && <p className="text-sm text-ink-soft mt-2">{s.description}</p>}
                    <p className="text-sm text-ink font-medium mt-3">
                      {s.price_type === "custom" ? "On request" : formatEUR(s.unit_price)}
                      {s.deposit ? ` • Deposit ${formatEUR(s.deposit)}` : ""}
                    </p>
                  </>
                )}
                empty="No matching services. Try a different vendor or loosen the dream goal."
              />
            </>
          )}

          {step === 4 && services.length > 0 && (
            <div className="panel p-6 md:p-8 space-y-5">
              <div className="rounded-xl bg-primary-soft p-4 text-sm">
                Applying to <strong>{services.length}</strong> service{services.length > 1 && "s"} from <strong>{vendor.name}</strong>.
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="qty">Quantity (each)</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={0}
                    step={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-2 rounded-xl"
                    data-testid="quantity-input"
                  />
                  <p className="text-xs text-ink-muted mt-2">
                    Per-guest services multiply by {project?.guest_count || 0} guests automatically.
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
                <Label htmlFor="notes">Notes (optional, applied to all)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 rounded-xl" rows={3} data-testid="notes-input" />
              </div>
            </div>
          )}

          {step === 5 && services.length > 0 && vendor && category && (
            <div className="panel p-8 md:p-10 bg-gradient-to-br from-primary-soft to-surface">
              <p className="eyebrow text-primary">Ready to add</p>
              <h3 className="font-heading text-3xl mt-2">
                {services.length} service{services.length > 1 && "s"} from {vendor.name}
              </h3>
              <p className="text-ink-soft mt-3">
                Part of <strong>{category.name}</strong>
                {goal && <> — dream goal <strong>{goal.name}</strong></>}.
                Quantity <strong>{quantity}</strong> · priority <strong>{PRIORITY_LABEL[priority]}</strong> · <strong>{status}</strong>.
              </p>

              <ul className="mt-6 divide-y divide-dashed divide-border">
                {services.map((s) => (
                  <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-ink-muted">{PRICE_TYPE_LABEL[s.price_type]}</p>
                    </div>
                    <p className="font-heading text-lg">{formatEUR(totalForOne(s))}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-baseline gap-3 pt-4 border-t border-dashed border-border">
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
                {saving ? "Adding…" : `Add ${services.length} to my plan`}
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
          state={{ category, goal, vendor, services, quantity }}
          total={total}
          project={project}
        />
      </div>
    </PageContainer>
  );
}
