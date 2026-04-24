import React, { useState } from "react";
import { PageContainer, PageHeader, SectionHeading } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { api, formatEUR, PRICE_TYPE_LABEL, VENDOR_STATUS_LABEL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Plus, Mail, Phone, MapPin, Instagram, Globe, Trash2, Pencil, Package } from "lucide-react";

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

const emptyService = {
  name: "",
  category: "",
  dream_goal: "",
  description: "",
  price_type: "fixed",
  unit_price: 0,
  deposit: 0,
  notes: "",
  active: true,
};

function VendorForm({ open, onOpenChange, initial, onSubmit, categories }) {
  const [form, setForm] = useState(initial || emptyVendor);
  React.useEffect(() => { setForm(initial || emptyVendor); }, [initial, open]);

  const toggleCategory = (cid) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cid)
        ? f.categories.filter((c) => c !== cid)
        : [...f.categories, cid],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {initial?.id ? "Edit vendor" : "Add vendor"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2 mt-3">
          <div className="md:col-span-2">
            <Label>Name</Label>
            <Input data-testid="vendor-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Contact person</Label>
            <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
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
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label>Categories</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`chip border ${
                    form.categories.includes(c.id)
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
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={!form.name.trim()}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="save-vendor"
          >
            Save vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ServiceForm({ open, onOpenChange, initial, onSubmit, categories, goals }) {
  const [form, setForm] = useState(initial || emptyService);
  React.useEffect(() => { setForm(initial || emptyService); }, [initial, open]);

  const goalOptions = goals.filter((g) => !form.category || g.category === form.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {initial?.id ? "Edit service" : "Add service"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-3">
          <div>
            <Label>Name</Label>
            <Input data-testid="service-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v, dream_goal: "" })}>
                <SelectTrigger className="mt-2 rounded-xl h-11"><SelectValue placeholder="Pick" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dream goal</Label>
              <Select value={form.dream_goal || "_none"} onValueChange={(v) => setForm({ ...form, dream_goal: v === "_none" ? "" : v })}>
                <SelectTrigger className="mt-2 rounded-xl h-11"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {goalOptions.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Price type</Label>
              <Select value={form.price_type} onValueChange={(v) => setForm({ ...form, price_type: v })}>
                <SelectTrigger className="mt-2 rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRICE_TYPE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit price €</Label>
              <Input type="number" min={0} step={1} value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label>Deposit €</Label>
              <Input type="number" min={0} step={1} value={form.deposit} onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })} className="mt-2 rounded-xl" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2 rounded-xl" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={!form.name.trim() || !form.category}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="save-service"
          >
            Save service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VendorCard({ vendor, categories, onEdit, onDelete, onAddService, onEditService, onDeleteService }) {
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
    <div className="panel p-6 md:p-7" data-testid={`vendor-${vendor.id}`}>
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
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(vendor)} className="rounded-full" data-testid={`edit-vendor-${vendor.id}`}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(vendor)} className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`delete-vendor-${vendor.id}`}>
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

      <Accordion type="single" collapsible className="mt-5 border-t border-dashed border-border">
        <AccordionItem value="services" className="border-none">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
            <span className="flex items-center gap-2"><Package className="w-4 h-4" strokeWidth={1.5} /> Services ({(vendor.services || []).length})</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {(vendor.services || []).map((s) => (
                <div key={s.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3" data-testid={`service-${s.id}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-ink-muted">
                      {s.price_type === "custom" ? "On request" : `${formatEUR(s.unit_price)} · ${PRICE_TYPE_LABEL[s.price_type]}`}
                      {s.deposit > 0 && ` · Deposit ${formatEUR(s.deposit)}`}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onEditService(vendor, s)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive" onClick={() => onDeleteService(vendor, s)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => onAddService(vendor)} className="rounded-full w-full mt-2" data-testid={`add-service-${vendor.id}`}>
                <Plus className="w-4 h-4" /> Add service
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function Vendors() {
  const { vendors, categories, goals, refresh, loading } = usePlanner();
  const [vendorFormOpen, setVendorFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [serviceFormCtx, setServiceFormCtx] = useState({ vendor: null, service: null });

  const handleSaveVendor = async (data) => {
    try {
      if (editingVendor?.id) {
        await api.updateVendor(editingVendor.id, data);
        toast.success("Vendor updated.");
      } else {
        await api.createVendor(data);
        toast.success("Vendor added.");
      }
      setVendorFormOpen(false);
      setEditingVendor(null);
      await refresh();
    } catch (e) {
      toast.error("Couldn't save vendor.");
    }
  };

  const handleDeleteVendor = async (v) => {
    if (!confirm(`Remove ${v.name}? This also removes their selections.`)) return;
    await api.deleteVendor(v.id);
    toast.success("Vendor removed.");
    await refresh();
  };

  const handleSaveService = async (data) => {
    const { vendor, service } = serviceFormCtx;
    try {
      if (service?.id) {
        await api.updateService(vendor.id, service.id, data);
        toast.success("Service updated.");
      } else {
        await api.addService(vendor.id, data);
        toast.success("Service added.");
      }
      setServiceFormOpen(false);
      setServiceFormCtx({ vendor: null, service: null });
      await refresh();
    } catch (e) {
      toast.error("Couldn't save service.");
    }
  };

  const handleDeleteService = async (vendor, s) => {
    if (!confirm(`Remove service "${s.name}"?`)) return;
    await api.deleteService(vendor.id, s.id);
    toast.success("Service removed.");
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
        description="Everyone helping bring the day to life — contacts, statuses, and what they offer."
        testId="vendors-header"
      >
        <Button
          onClick={() => { setEditingVendor(null); setVendorFormOpen(true); }}
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
              onEdit={(vv) => { setEditingVendor(vv); setVendorFormOpen(true); }}
              onDelete={handleDeleteVendor}
              onAddService={(vv) => { setServiceFormCtx({ vendor: vv, service: null }); setServiceFormOpen(true); }}
              onEditService={(vv, s) => { setServiceFormCtx({ vendor: vv, service: s }); setServiceFormOpen(true); }}
              onDeleteService={handleDeleteService}
            />
          ))
        )}
      </div>

      <VendorForm
        open={vendorFormOpen}
        onOpenChange={setVendorFormOpen}
        initial={editingVendor}
        onSubmit={handleSaveVendor}
        categories={categories}
      />
      <ServiceForm
        open={serviceFormOpen}
        onOpenChange={setServiceFormOpen}
        initial={serviceFormCtx.service}
        onSubmit={handleSaveService}
        categories={categories}
        goals={goals}
      />
    </PageContainer>
  );
}
