import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, Wand2, Users, ListChecks, Wallet, Settings as SettingsIcon, Scroll } from "lucide-react";
import { Toaster } from "../components/ui/sonner";
import { usePlanner } from "../lib/planner-context";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dream-vision", label: "Dream Vision", icon: Sparkles },
  { to: "/plan", label: "Plan Builder", icon: Wand2 },
  { to: "/vendors", label: "Vendors", icon: Users },
  { to: "/final-decisions", label: "Final Decisions", icon: Scroll },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function Sidebar() {
  const { project } = usePlanner();
  return (
    <aside
      className="hidden lg:flex lg:flex-col w-72 shrink-0 border-r border-border bg-surface/70 backdrop-blur sticky top-0 h-screen"
      data-testid="sidebar"
    >
      <div className="px-8 py-8">
        <div className="flex items-center gap-3">
          <img
            src="https://customer-assets.emergentagent.com/job_planner-tool-sana/artifacts/pqvosodt_IMG_4360.jpg"
            alt="The Cimbri couple"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-soft"
            data-testid="sidebar-couple-photo"
          />
          <div>
            <p className="eyebrow">Cimbri</p>
            <h3 className="text-lg font-heading leading-tight mt-1">
              Wedding Planner
            </h3>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                isActive
                  ? "bg-primary-soft text-primary font-medium shadow-soft"
                  : "text-ink-soft hover:bg-muted hover:text-ink"
              }`
            }
          >
            <n.icon className="w-4 h-4" strokeWidth={1.5} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 m-4 rounded-2xl bg-secondary-soft border border-secondary/30">
        <p className="eyebrow text-secondary">A gentle reminder</p>
        <p className="text-sm mt-2 text-ink-soft italic font-heading leading-relaxed">
          "You're making beautiful progress — everything will come together."
        </p>
      </div>
    </aside>
  );
}

function MobileNav() {
  const location = useLocation();
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-border z-40 px-2 py-2"
      data-testid="mobile-nav"
    >
      <div className="flex justify-between overflow-x-auto gap-1">
        {nav.map((n) => {
          const isActive = n.end ? location.pathname === n.to : location.pathname.startsWith(n.to);
          return (
            <NavLink
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] whitespace-nowrap ${
                isActive ? "text-primary" : "text-ink-muted"
              }`}
            >
              <n.icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{n.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-screen flex floral-bg">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <MobileNav />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
