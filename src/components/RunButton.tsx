'use client';

import { useState, useTransition } from "react";

export function RunButton() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      setStatus("Running automation…");
      try {
        const res = await fetch("/api/run", { method: "POST" });
        if (!res.ok) {
          const payload = await res.json();
          throw new Error(payload?.error || "Unknown error");
        }
        setStatus("Automation complete. Refresh to see new project.");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <div className="run-wrapper">
      <button onClick={handleClick} disabled={pending}>
        {pending ? "Running…" : "Run Automation"}
      </button>
      {status && <p className="run-status">{status}</p>}
    </div>
  );
}
