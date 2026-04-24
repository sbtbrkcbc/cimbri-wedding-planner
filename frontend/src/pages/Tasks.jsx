import React, { useMemo, useState } from "react";
import { PageContainer, PageHeader, SectionHeading } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, CalendarDays, Flag } from "lucide-react";

const PRIORITY = {
  low: { label: "Low", tone: "bg-muted text-ink-soft" },
  medium: { label: "Medium", tone: "bg-accent-soft text-accent" },
  high: { label: "High", tone: "bg-secondary-soft text-secondary" },
};

const STATUS = {
  todo: { label: "To do", tone: "bg-muted text-ink-soft" },
  in_progress: { label: "In progress", tone: "bg-accent-soft text-accent" },
  done: { label: "Done", tone: "bg-primary-soft text-primary" },
};

const emptyTask = { title: "", category: "_none", due_date: "", priority: "medium", status: "todo", notes: "" };

function TaskForm({ open, onOpenChange, initial, onSubmit, categories }) {
  const [form, setForm] = useState(initial || emptyTask);
  React.useEffect(() => { setForm(initial || emptyTask); }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {initial?.id ? "Edit task" : "New task"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-3">
          <div>
            <Label>Title</Label>
            <Input data-testid="task-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Due date</Label>
              <Input type="date" value={form.due_date || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="mt-2 rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category || "_none"} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-2 rounded-xl h-11"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-2 rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2 rounded-xl" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Cancel</Button>
          <Button
            onClick={() => {
              const payload = { ...form, category: form.category === "_none" ? null : form.category };
              onSubmit(payload);
            }}
            disabled={!form.title.trim()}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="save-task"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Column({ title, items, renderItem, testId }) {
  return (
    <div className="panel p-5" data-testid={testId}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl">{title}</h3>
        <span className="chip bg-muted text-ink-soft">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-ink-muted italic">Nothing here.</p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { tasks, categories, dashboard, refresh, loading } = usePlanner();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const grouped = useMemo(() => ({
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  }), [tasks]);

  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await api.updateTask(editing.id, data);
        toast.success("Task updated.");
      } else {
        await api.createTask(data);
        toast.success("Task added.");
      }
      setFormOpen(false);
      setEditing(null);
      await refresh();
    } catch {
      toast.error("Couldn't save task.");
    }
  };

  const handleDelete = async (t) => {
    if (!confirm(`Remove "${t.title}"?`)) return;
    await api.deleteTask(t.id);
    await refresh();
  };

  const handleMove = async (t, status) => {
    await api.updateTask(t.id, { status });
    await refresh();
  };

  const renderTask = (t) => {
    const cat = categories.find((c) => c.id === t.category);
    return (
      <div key={t.id} className="rounded-xl border border-border p-4" data-testid={`task-${t.id}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{t.title}</p>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className={`chip ${PRIORITY[t.priority].tone}`}>
                <Flag className="w-3 h-3" strokeWidth={2} /> {PRIORITY[t.priority].label}
              </span>
              {t.due_date && (
                <span className="chip bg-muted text-ink-soft">
                  <CalendarDays className="w-3 h-3" strokeWidth={2} />
                  {new Date(t.due_date).toLocaleDateString("en-GB")}
                </span>
              )}
              {cat && <span className="chip bg-surface border border-border text-ink-soft">{cat.name}</span>}
            </div>
            {t.notes && <p className="text-xs text-ink-muted italic mt-2">{t.notes}</p>}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => { setEditing(t); setFormOpen(true); }} data-testid={`edit-task-${t.id}`}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive" onClick={() => handleDelete(t)} data-testid={`delete-task-${t.id}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {t.status !== "todo" && (
            <Button size="sm" variant="ghost" onClick={() => handleMove(t, "todo")} className="text-xs rounded-full">To do</Button>
          )}
          {t.status !== "in_progress" && (
            <Button size="sm" variant="ghost" onClick={() => handleMove(t, "in_progress")} className="text-xs rounded-full text-accent hover:text-accent">In progress</Button>
          )}
          {t.status !== "done" && (
            <Button size="sm" variant="ghost" onClick={() => handleMove(t, "done")} className="text-xs rounded-full text-primary hover:text-primary">Done</Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <PageContainer><p className="text-ink-muted">Loading tasks…</p></PageContainer>;

  const days = dashboard?.stats?.days_to_wedding;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Gentle, one-step-at-a-time"
        title="Tasks."
        description={days != null ? `${days} days to go — one calm check at a time.` : "Keep track of what's coming."}
        testId="tasks-header"
      >
        <Button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          data-testid="add-task-btn"
        >
          <Plus className="w-4 h-4" /> New task
        </Button>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <Column title="To do" items={grouped.todo} renderItem={renderTask} testId="col-todo" />
        <Column title="In progress" items={grouped.in_progress} renderItem={renderTask} testId="col-progress" />
        <Column title="Done" items={grouped.done} renderItem={renderTask} testId="col-done" />
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={handleSave}
        categories={categories}
      />
    </PageContainer>
  );
}
