import React, { useState, useEffect } from "react";

const STORAGE_KEY = "cimbri_unlocked";
const PASSWORD = "cimbri";

export function useGate() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const unlock = () => {
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    setUnlocked(true);
  };

  const lock = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setUnlocked(false);
  };

  return { unlocked, unlock, lock };
}

export default function Gate({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Cimbri Wedding Planner";
    return () => { document.title = prev; };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (value.trim().toLowerCase() === PASSWORD) {
      onUnlock();
    } else {
      setError("Not quite — try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 floral-bg" data-testid="gate-screen">
      <div className={`w-full max-w-md ${shake ? "animate-bloom" : ""}`}>
        <div className="panel p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 blur-xl" />
              <img
                src="/photos/couple.jpg"
                alt="Burak & Veronica"
                className="relative w-32 h-32 rounded-full object-cover ring-4 ring-surface shadow-soft"
                data-testid="gate-couple-photo"
              />
            </div>

            <p className="eyebrow mt-8 text-primary">Cimbri Wedding Planner</p>
            <h1 className="font-heading text-3xl md:text-4xl mt-2 text-ink">
              Burak <span className="text-secondary italic">&amp;</span> Veronica
            </h1>
            <p className="text-sm text-ink-soft mt-2">
              <span className="italic">Türk</span> <span className="text-ink-muted">·</span> <span className="italic">Italiana</span>
            </p>
            <p className="text-ink-soft mt-4 text-sm">Only the two of you know the word.</p>

            <form onSubmit={submit} className="mt-8">
              <label htmlFor="pw" className="sr-only">Password</label>
              <input
                id="pw"
                type="password"
                autoFocus
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(""); }}
                placeholder="Enter the word"
                data-testid="gate-password-input"
                className="w-full bg-background border border-border rounded-full px-6 py-3 text-center text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-ink-muted font-heading text-xl tracking-wide"
              />
              {error && (
                <p className="text-sm text-destructive mt-3" data-testid="gate-error">{error}</p>
              )}
              <button
                type="submit"
                data-testid="gate-submit"
                className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-3 font-medium transition-all duration-300 shadow-soft hover:shadow-glow"
              >
                Open our planner
              </button>
            </form>

            <p className="mt-8 text-xs text-ink-muted italic font-heading">
              "Your dream team is coming together."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
