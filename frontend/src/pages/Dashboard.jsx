import React from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader, SectionHeading } from "@/components/page-shell";
import { usePlanner } from "@/lib/planner-context";
import { formatEUR } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarHeart, Banknote, PiggyBank, ListChecks, Users, Sparkles, ArrowRight, Check, Clock, CircleDashed } from "lucide-react";

function StatCard({ icon: Icon, eyebrow, value, caption, tone = "sage", testId }) {
  const tones = {
    sage: "bg-primary-soft text-primary",
    rose: "bg-secondary-soft text-secondary",
    gold: "bg-accent-soft text-accent",
  };
  return (
    <div className="panel p-6 md:p-7 relative overflow-hidden" data-testid={testId}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <p className="eyebrow mt-5">{eyebrow}</p>
      <p className="font-heading text-3xl md:text-4xl mt-1 text-ink">{value}</p>
      {caption && <p className="text-sm text-ink-muted mt-1">{caption}</p>}
    </div>
  );
}

function Countdown({ days, date, coupleNames, location }) {
  const bigNumber = days == null ? "—" : days < 0 ? "🎉" : days;
  const label =
    days == null
      ? "Set your wedding date in Settings"
      : days < 0
      ? "Already celebrated"
      : days === 0
      ? "It's today!"
      : days === 1
      ? "1 day to go"
      : `${days} days to go`;
  return (
    <div
      className="panel p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-primary-soft via-surface to-secondary-soft"
      data-testid="countdown-card"
    >
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute right-20 top-10 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-8">
        <div className="shrink-0">
          <div className="relative w-28 h-28 md:w-36 md:h-36">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 blur-xl" />
            <img
              src="https://customer-assets.emergentagent.com/job_planner-tool-sana/artifacts/pqvosodt_IMG_4360.jpg"
              alt="The Cimbri couple"
              className="relative w-28 h-28 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-surface shadow-soft"
              data-testid="dashboard-couple-photo"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="eyebrow text-primary">Cimbri Wedding</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-2 text-ink leading-tight">
            {coupleNames}
          </h2>
          <p className="text-ink-soft mt-1 italic">{location}</p>

          <div className="mt-6 flex flex-wrap items-end gap-8">
            <div>
              <p className="eyebrow text-accent">Countdown</p>
              <p className="font-heading text-5xl md:text-6xl leading-none mt-2 text-primary">
                {bigNumber}
              </p>
              <p className="text-sm text-ink-soft mt-2">{label}</p>
            </div>
            {date && (
              <div className="pb-2">
                <p className="eyebrow">The day</p>
                <p className="text-base font-medium mt-1">
                  {new Date(date).toLocaleDateString("en-GB", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetCard({ stats, target }) {
  const selected = stats?.total_selected || 0;
  const pct = target ? Math.min(100, Math.round((selected / target) * 100)) : 0;
  return (
    <div className="panel p-7" data-testid="budget-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Budget</p>
          <h3 className="font-heading text-2xl mt-1">Target vs. chosen</h3>
        </div>
        <Banknote className="w-5 h-5 text-primary" strokeWidth={1.5} />
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-heading text-4xl text-ink">{formatEUR(selected)}</span>
        <span className="text-ink-muted text-sm">/ {formatEUR(target || 0)}</span>
      </div>
      <Progress value={pct} className="mt-4 h-2 bg-border" />
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-muted p-3">
          <p className="eyebrow">Deposits</p>
          <p className="text-sm font-medium mt-1">{formatEUR(stats?.total_deposits)}</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <p className="eyebrow">Considering</p>
          <p className="text-sm font-medium mt-1">{formatEUR(stats?.total_considering)}</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <p className="eyebrow">Remaining</p>
          <p className="text-sm font-medium mt-1">{formatEUR(stats?.remaining)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { dashboard, project, loading } = usePlanner();

  if (loading || !dashboard) {
    return (
      <PageContainer>
        <div className="animate-pulse text-ink-muted">Preparing your dashboard…</div>
      </PageContainer>
    );
  }

  const stats = dashboard.stats || {};
  const tasks = dashboard.next_tasks || [];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Your wedding command center"
        title="A calmer view of everything."
        description="You're making beautiful progress. Here's the whole picture in one glance — no spreadsheets, only the things that matter."
        testId="dashboard-header"
      >
        <Button asChild data-testid="go-plan-builder" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6">
          <Link to="/plan">Open Plan Builder <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <Countdown
            days={stats.days_to_wedding}
            date={project?.wedding_date}
            coupleNames={project?.couple_names}
            location={project?.location}
          />
        </div>
        <div className="md:col-span-2">
          <BudgetCard stats={stats} target={project?.target_budget} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard icon={Sparkles} eyebrow="Booked" value={stats.booked} caption="already locked in" tone="sage" testId="stat-booked" />
        <StatCard icon={Check} eyebrow="Selected" value={stats.selected} caption="ready to confirm" tone="gold" testId="stat-selected" />
        <StatCard icon={CircleDashed} eyebrow="Considering" value={stats.considering} caption="still open" tone="rose" testId="stat-considering" />
        <StatCard icon={Users} eyebrow="Vendors" value={stats.vendors_shortlisted + stats.vendors_selected} caption={`${stats.vendors_selected} selected`} tone="sage" testId="stat-vendors" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2 panel p-7">
          <SectionHeading eyebrow="Your plan so far" title="By category">
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              <Link to="/final-decisions">See final decisions →</Link>
            </Button>
          </SectionHeading>

          <div className="grid sm:grid-cols-2 gap-3">
            {(dashboard.by_category || []).length === 0 ? (
              <p className="text-ink-muted text-sm italic col-span-2">
                Still open — add your first pick in Plan Builder.
              </p>
            ) : (
              (dashboard.by_category || []).map((bc) => (
                <div key={bc.category} className="rounded-xl border border-dashed border-border p-4">
                  <p className="eyebrow">{bc.category.replace("_", " ")}</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-heading text-xl">{formatEUR(bc.total)}</span>
                    <span className="text-xs text-ink-muted">{bc.count} item{bc.count !== 1 && "s"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-7">
          <SectionHeading eyebrow="Up next" title="Gentle to-dos">
            <ListChecks className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
          </SectionHeading>
          {tasks.length === 0 ? (
            <p className="text-ink-muted text-sm italic">Nothing urgent — enjoy a breath.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3" data-testid={`dash-task-${t.id}`}>
                  <div className="mt-1 w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{t.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {t.due_date ? `Due ${new Date(t.due_date).toLocaleDateString("en-GB")}` : "No date yet"}
                      {t.priority && ` • ${t.priority}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" className="w-full mt-6 rounded-full border-border hover:border-primary hover:text-primary">
            <Link to="/tasks">Open tasks</Link>
          </Button>
        </div>
      </div>

      <div className="mt-10 panel p-7 bg-gradient-to-br from-accent-soft via-surface to-primary-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow text-accent">Dream Vision</p>
            <h3 className="font-heading text-2xl md:text-3xl mt-1">The little things Veronica imagined.</h3>
            <p className="text-ink-soft mt-2">
              Entrance florals, lanterns at the cake table, a Turkish corner, chocolate fountain, live sketching — keep them visible, keep them yours.
            </p>
          </div>
          <Button asChild className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground px-6">
            <Link to="/dream-vision">Open dream vision</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
