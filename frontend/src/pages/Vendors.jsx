import React, { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { api, formatEUR, PRICE_TYPE_LABEL, VENDOR_STATUS_LABEL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Mail, Phone, MapPin, Instagram, Globe, Trash2, Pencil, X, ChevronDown, ChevronUp } from "lucide-react";

const emptyVendor = {
  name: "",
  categories: [],
  contact_person: "",
  phone: "",
  email: "",
  website: "",
  instagram: "",
  location: "",
  notes: "",
  status: "new",
};

const emptyService = () => ({
  _uid: `new-${Math.random().toString(36).slice(2, 9)}`,
  name: "",
  category: "",
  dream_goal: "",
  description: "",
  price_type: "fixed",
  unit_price: 0,
  deposit: 0,
  notes: "",
  active: true,
});

/* ---------- Inline service row ---------- */
function ServiceRow({ svc, categories, goals, onChange, onRemove, index }) {
  const [expanded, setExpanded] = useState(false);
  const goalOptions = goals.filter((g) => !svc.category || g.category === svc.category);

  return (
    <div className="rounded-xl border border-border bg-background/50 p-4" data-testid={`service-row-${index}`}>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] items-end">
        <div>
          <Label className="text-xs text-ink-muted">Service name</Label>
          <Input
            value={svc.name}
            onChange={(e) => onChange({ ...svc, name: e.target.value })}
            placeholder="e.g. Wedding package"
            className="mt-1 rounded-lg h-10"
            data-testid={`service-row-name-${index}`}
          />
        </div>
        <div>
          <Label className="text-xs text-ink-muted">Type</Label>
          <Select value={svc.price_type} onValueChange={(v) => onChange({ ...svc, price_type: v })}>
            <SelectTrigger className="mt-1 rounded-lg h-10 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PRICE_TYPE_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-ink-muted">Unit €</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={svc.unit_price}
            onChange={(e) => onChange({ ...svc, unit_price: Number(e.target.value) })}
            className="mt-1 rounded-lg h-10 w-24"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setExpanded((e) => !e)}
          className="rounded-full"
          data-testid={`service-row-expand-${index}`}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
          data-testid={`service-row-remove-${index}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="grid gap-3 md:grid-cols-2 mt-4 pt-4 border-t border-dashed border-border">
          <div>
            <Label className="text-xs text-ink-muted">Category</Label>
            <Select value={svc.category || "_none"} onValueChange={(v) => onChange({ ...svc, category: v === "_none" ? "" : v, dream_goal: "" })}>
              <SelectTrigger className="mt-1 rounded-lg h-10"><SelectValue placeholder="Pick" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-ink-muted">Dream goal (optional)</Label>
            <Select value={svc.dream_goal || "_none"} onValueChange={(v) => onChange({ ...svc, dream_goal: v === "_none" ? "" : v })}>
              <SelectTrigger className="mt-1 rounded-lg h-10"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {goalOptions.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-ink-muted">Deposit €</Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={svc.deposit}
              onChange={(e) => onChange({ ...svc, deposit: Number(e.target.value) })}
              className="mt-1 rounded-lg h-10"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs text-ink-muted">Description</Label>
            <Textarea
              rows={2}
              value={svc.description}
              onChange={(e) => onChange({ ...svc, description: e.target.value })}
              className="mt-1 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Combined vendor + services dialog ---------- */
function VendorForm({ open, onOpenChange, initial, onSubmit, categories, goals, saving }) {
  const [vendor, setVendor] = useState(emptyVendor);
  const [services, setServices] = useState([]);
  const [removedServiceIds, setRemovedServiceIds] = useState([]);

  React.useEffect(() => {
    if (open) {
      if (initial) {
        const { services: svcs, ...rest } = initial;
        setVendor({ ...emptyVendor, ...rest });
        setServices((svcs || []).map((s) => ({ ...s, _uid: s.id })));
      } else {
        setVendor(emptyVendor);
        setServices([]);
      }
      setRemovedServiceIds([]);
    }
  }, [open, initial]);

  const toggleCategory = (cid) => {
    setVendor((f) => ({
      ...f,
      categories: f.categories.includes(cid)
        ? f.categories.filter((c) => c !== cid)
        : [...f.categories, cid],
    }));
  };

  const addServiceRow = () => {
    // When adding a service, pre-fill category with vendor's first category if available
    const s = emptyService();
    if (vendor.categories.length > 0) s.category = vendor.categories[0];
    setServices((prev) => [...prev, s]);
  };

  const updateService = (uid, next) => {
    setServices((prev) => prev.map((s) => (s._uid === uid ? next : s)));
  };

  const removeService = (uid) => {
    setServices((prev) => {
      const target = prev.find((s) => s._uid === uid);
      if (target && target.id) {
        setRemovedServiceIds((r) => [...r, target.id]);
      }
      return prev.filter((s) => s._uid !== uid);
    });
  };

  const handleSubmit = () => {
    // Strip _uid before submission
    const cleanServices = services.map(({ _uid, ...rest }) => rest);
    onSubmit({ vendor, services: cleanServices, removedServiceIds });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {initial?.id ? "Edit vendor" : "Add vendor"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 mt-2">
          <div className="md:col-span-2">
            <Label>Vendor name</Label>
            <Input data-testid="vendor-name" value={vendor.name} onChange={(e) => setVendor({ ...vendor, name: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Contact person</Label>
            <Input value={vendor.contact_person} onChange={(e) => setVendor({ ...vendor, contact_person: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={vendor.status} onValueChange={(v) => setVendor({ ...vendor, status: v })}>
              <SelectTrigger className="mt-2 rounded-xl h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(VENDOR_STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={vendor.phone} onChange={(e) => setVendor({ ...vendor, phone: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={vendor.email} onChange={(e) => setVendor({ ...vendor, email: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={vendor.website} onChange={(e) => setVendor({ ...vendor, website: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input value={vendor.instagram} onChange={(e) => setVendor({ ...vendor, instagram: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label>Location</Label>
            <Input value={vendor.location} onChange={(e) => setVendor({ ...vendor, location: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={vendor.notes} onChange={(e) => setVendor({ ...vendor, notes: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label>Categories</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`chip border text-xs ${
                    vendor.categories.includes(c.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface border-border text-ink-soft hover:border-primary"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-6 border-t border-dashed border-border pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-heading text-lg">Services from this vendor</h4>
              <p className="text-xs text-ink-muted mt-0.5">
                Add as many as you want — you can expand each for more options.
              </p>
            </div>
            <Button
              type="button"
              onClick={addServiceRow}
              variant="outline"
              className="rounded-full"
              data-testid="add-service-row"
            >
              <Plus className="w-4 h-4" /> Add service
            </Button>
          </div>
          <div className="space-y-3">
            {services.length === 0 ? (
              <p className="text-sm text-ink-muted italic text-center py-6 border border-dashed border-border rounded-xl">
                No services yet — click "Add service" above.
              </p>
            ) : (
              services.map((s, i) => (
                <ServiceRow
                  key={s._uid}
                  svc={s}
                  index={i}
                  categories={categories}
                  goals={goals}
                  onChange={(next) => updateService(s._uid, next)}
                  onRemove={() => removeService(s._uid)}
                />
              ))
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!vendor.name.trim() || saving}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="save-vendor"
          >
            {saving ? "Saving…" : initial?.id ? "Save changes" : "Create vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Vendor card ---------- */
function VendorCard({ vendor, categories, onEdit, onDelete }) {
  const statusTone = {
    new: "bg-muted text-ink-soft",
    contacted: "bg-secondary-soft text-secondary",
    shortlisted: "bg-accent-soft text-accent",
    selected: "bg-primary-soft text-primary",
    rejected: "bg-destructive/10 text-destructive",
  }[vendor.status];

  const catNames = (vendor.categories || [])
    .map((id) => categories.find((c) => c.id === id)?.name || id);

  return (
    <div className="panel p-6 md:p-7 flex flex-col" data-testid={`vendor-${vendor.id}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-heading text-2xl">{vendor.name}</h3>
            <span className={`chip ${statusTone}`}>{VENDOR_STATUS_LABEL[vendor.status]}</span>
          </div>
          {vendor.contact_person && <p className="text-sm text-ink-soft mt-1">{vendor.contact_person}</p>}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {catNames.map((n) => <Badge key={n} variant="outline" className="rounded-full border-border text-xs">{n}</Badge>)}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(vendor)} className="rounded-full" data-testid={`edit-vendor-${vendor.id}`} title="Edit">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(vendor)} className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`delete-vendor-${vendor.id}`} title="Delete">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-5 text-sm">
        {vendor.phone && <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-ink-soft hover:text-primary"><Phone className="w-3.5 h-3.5" strokeWidth={1.5} /> {vendor.phone}</a>}
        {vendor.email && <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-ink-soft hover:text-primary truncate"><Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> {vendor.email}</a>}
        {vendor.instagram && <span className="flex items-center gap-2 text-ink-soft"><Instagram className="w-3.5 h-3.5" strokeWidth={1.5} /> @{vendor.instagram}</span>}
        {vendor.website && <a href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-ink-soft hover:text-primary truncate"><Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> {vendor.website}</a>}
        {vendor.location && <span className="flex items-center gap-2 text-ink-soft sm:col-span-2"><MapPin className="w-3.5 h-3.5" strokeWidth={1.5} /> {vendor.location}</span>}
      </div>

      {vendor.notes && (
        <p className="text-sm text-ink-soft italic bg-muted rounded-xl p-3 mt-4">{vendor.notes}</p>
      )}

      <div className="mt-5 pt-5 border-t border-dashed border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Services</p>
          <span className="text-xs text-ink-muted">{(vendor.services || []).length}</span>
        </div>
        <div className="space-y-1.5">
          {(vendor.services || []).length === 0 ? (
            <p className="text-xs text-ink-muted italic">No services yet — edit to add.</p>
          ) : (
            vendor.services.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-sm" data-testid={`service-${s.id}`}>
                <span className="truncate text-ink-soft">{s.name}</span>
                <span className="text-ink-muted shrink-0 text-xs">
                  {s.price_type === "custom" ? "On request" : formatEUR(s.unit_price)}
                </span>
              </div>
            ))
          )}
          {(vendor.services || []).length > 5 && (
            <p className="text-xs text-ink-muted italic">+{vendor.services.length - 5} more…</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Vendors() {
  const { vendors, categories, goals, refresh, loading } = usePlanner();
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = async ({ vendor: formVendor, services, removedServiceIds }) => {
    try {
      setSaving(true);

      let vendorId;
      if (editingVendor?.id) {
        const { id, services: _svcs, created_at, ...vendorPatch } = formVendor;
        await api.updateVendor(editingVendor.id, vendorPatch);
        vendorId = editingVendor.id;
      } else {
        const created = await api.createVendor(formVendor);
        vendorId = created.id;
      }

      // Remove deleted services (only for existing vendor)
      if (editingVendor?.id) {
        for (const sid of removedServiceIds) {
          try { await api.deleteService(vendorId, sid); } catch {}
        }
      }

      // Create/update services
      for (const s of services) {
        if (!s.name.trim() || !s.category) continue;
        const payload = {
          name: s.name,
          category: s.category,
          dream_goal: s.dream_goal || null,
          description: s.description || "",
          price_type: s.price_type,
          unit_price: Number(s.unit_price) || 0,
          deposit: Number(s.deposit) || 0,
          notes: s.notes || "",
          active: s.active !== false,
        };
        if (s.id) {
          await api.updateService(vendorId, s.id, payload);
        } else {
          await api.addService(vendorId, payload);
        }
      }

      toast.success(editingVendor?.id ? "Vendor updated." : "Vendor added.");
      setFormOpen(false);
      setEditingVendor(null);
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save vendor.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.deleteVendor(deleteConfirm.id);
    toast.success("Vendor removed.");
    setDeleteConfirm(null);
    await refresh();
  };

  if (loading) {
    return <PageContainer><p className="text-ink-muted">Loading vendors…</p></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Your dream team"
        title="Vendors & services."
        description="Everyone helping bring the day to life. Click a vendor to edit — you can add or remove services right in the same place."
        testId="vendors-header"
      >
        <Button
          onClick={() => { setEditingVendor(null); setFormOpen(true); }}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          data-testid="add-vendor-btn"
        >
          <Plus className="w-4 h-4" /> Add vendor
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        {vendors.length === 0 ? (
          <p className="text-ink-muted italic">No vendors yet — add your first one.</p>
        ) : (
          vendors.map((v) => (
            <VendorCard
              key={v.id}
              vendor={v}
              categories={categories}
              onEdit={(vv) => { setEditingVendor(vv); setFormOpen(true); }}
              onDelete={(vv) => setDeleteConfirm(vv)}
            />
          ))
        )}
      </div>

      <VendorForm
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditingVendor(null); }}
        initial={editingVendor}
        onSubmit={handleSave}
        categories={categories}
        goals={goals}
        saving={saving}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Remove {deleteConfirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also remove any selections linked to this vendor. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-testid="confirm-delete-vendor"
            >
              Remove vendor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
