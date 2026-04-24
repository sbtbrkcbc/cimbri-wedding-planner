import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import DreamVision from "@/pages/DreamVision";
import PlanBuilder from "@/pages/PlanBuilder";
import Vendors from "@/pages/Vendors";
import FinalDecisions from "@/pages/FinalDecisions";
import Tasks from "@/pages/Tasks";
import Budget from "@/pages/Budget";
import Settings from "@/pages/Settings";
import { PlannerProvider } from "@/lib/planner-context";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <PlannerProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/dream-vision" element={<DreamVision />} />
              <Route path="/plan" element={<PlanBuilder />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/final-decisions" element={<FinalDecisions />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </PlannerProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
