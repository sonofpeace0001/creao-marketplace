"use client";

import { useActionState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { createItem } from "@/app/dashboard/actions";

export function PublishForm() {
  const [state, formAction, pending] = useActionState(createItem, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm text-muted">Title</label>
        <input
          name="title"
          required
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">Description</label>
        <textarea
          name="description"
          rows={2}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-muted">Kind</label>
          <select name="kind" className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <option value="component">Component</option>
            <option value="page">Full page</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Category</label>
          <select name="category" className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-muted">Niche</label>
          <input
            name="niche"
            placeholder="e.g. gym & personal training"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Theme</label>
          <select name="theme" className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">Price (USD, 0 = free)</label>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue="0"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
        <p className="mt-1 text-xs text-muted">Paid checkout isn&apos;t wired up yet — this just records the intended price.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">Thumbnail image</label>
        <input
          name="thumbnail"
          type="file"
          accept="image/*"
          required
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-muted">HTML source</label>
        <textarea
          name="source_html"
          required
          rows={10}
          placeholder="<!DOCTYPE html>..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-xs outline-none focus:border-accent/50"
        />
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
    </form>
  );
}
