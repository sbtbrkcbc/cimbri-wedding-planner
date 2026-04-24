import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const [project, setProject] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selections, setSelections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [p, v, s, t, c, g, d] = await Promise.all([
      api.getProject(),
      api.listVendors(),
      api.listSelections(),
      api.listTasks(),
      api.getCategories(),
      api.getGoals(),
      api.getDashboard(),
    ]);
    setProject(p);
    setVendors(v);
    setSelections(s);
    setTasks(t);
    setCategories(c);
    setGoals(g);
    setDashboard(d);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (e) {
        console.error("Planner load failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const value = {
    project, vendors, selections, tasks, categories, goals, dashboard, loading,
    refresh,
    // helpers
    categoryById: (id) => categories.find((c) => c.id === id),
    goalById: (id) => goals.find((g) => g.id === id),
    vendorById: (id) => vendors.find((v) => v.id === id),
    goalsByCategory: (cat) => goals.filter((g) => g.category === cat),
    vendorsByCategory: (cat) => vendors.filter((v) => (v.categories || []).includes(cat)),
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}
