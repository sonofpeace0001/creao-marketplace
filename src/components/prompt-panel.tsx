"use client";

import { useState } from "react";

export function PromptPanel({ promptText }: { promptText: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent-2/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span>
          <span className="font-medium">The exact AI prompt that built this</span>
          <span className="ml-2 text-sm text-muted">— regenerate or customize it yourself</span>
        </span>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-accent/20 px-5 py-4">
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-muted">
            {promptText}
          </pre>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {copied ? "Copied" : "Copy prompt"}
            </button>
            <a
              href="https://agent.creao.ai/@Sonofpeace"
              target="_blank"
              rel="noopener"
              className="text-sm text-accent hover:underline"
            >
              Open CREAO to regenerate →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
