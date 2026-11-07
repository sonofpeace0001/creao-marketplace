"use client";

import { useState } from "react";

// `mode="subscribe"` starts Stripe Checkout for the Premium plan;
// `mode="manage"` opens the Stripe billing portal for existing subscribers.
export function SubscribeButton({ mode = "subscribe", label }: { mode?: "subscribe" | "manage"; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(mode === "manage" ? "/api/billing-portal" : "/api/subscribe", { method: "POST" });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  const base = "rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-60";
  const style =
    mode === "manage"
      ? `${base} border border-border hover:border-hairline`
      : `${base} bg-gradient-to-br from-accent to-accent-2 text-white hover:opacity-90`;

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={loading} className={style}>
        {loading ? "Redirecting…" : label ?? (mode === "manage" ? "Manage billing" : "Go Premium — $10/month")}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
