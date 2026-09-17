"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/categories";

export function BrowseControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") update({ q: q || null });
        }}
        onBlur={() => update({ q: q || null })}
        placeholder="Search niche or title (e.g. fitness, CRM, dark)…"
        className="min-w-[220px] flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-fg outline-none focus:border-accent/50"
      />
      <select
        defaultValue={searchParams.get("kind") ?? ""}
        onChange={(e) => update({ kind: e.target.value || null })}
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg"
      >
        <option value="">All kinds</option>
        <option value="page">Pages</option>
        <option value="component">Components</option>
      </select>
      <select
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => update({ category: e.target.value || null })}
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("theme") ?? ""}
        onChange={(e) => update({ theme: e.target.value || null })}
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg"
      >
        <option value="">All themes</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
      <select
        defaultValue={searchParams.get("price") ?? ""}
        onChange={(e) => update({ price: e.target.value || null })}
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg"
      >
        <option value="">Free & paid</option>
        <option value="free">Free only</option>
        <option value="paid">Paid only</option>
      </select>
    </div>
  );
}
