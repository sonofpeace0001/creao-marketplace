"use client";

import { useState } from "react";

export function CodeViewer({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs text-muted">HTML source</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-hairline"
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="max-h-[500px] overflow-auto p-4 text-xs leading-relaxed text-muted">
        <code>{code}</code>
      </pre>
    </div>
  );
}
