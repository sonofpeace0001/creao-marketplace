"use client";

import { useActionState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { updateItem } from "@/app/dashboard/actions";
import type { Tables } from "@/lib/types/database.types";

export function EditItemForm({ item }: { item: Tables<"items"> }) {
  const boundAction = updateItem.bind(null, item.id);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm text-muted">Title</label>
        <input
          name="title"
          required
          defaultValue={item.title}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={item.description ?? ""}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-muted">Category</label>
          <select
            name="category"
            defaultValue={item.category}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Theme</label>
          <select
            name="theme"
            defaultValue={item.theme ?? "dark"}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">Niche</label>
        <input
          name="niche"
          defaultValue={item.niche ?? ""}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">Price (USD, 0 = free)</label>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={(item.price_cents / 100).toString()}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
      </div>

      {item.source_type === "stored" ? (
        <p className="text-xs text-muted">
          HTML source and thumbnail aren&apos;t editable here yet — delete and republish to
          replace them.
        </p>
      ) : null}

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
