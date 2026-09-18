import Link from "next/link";
import { NICHE_SECTIONS, nichesBySection } from "@/lib/ui-component-niches";

function hrefFor(baseParams: Record<string, string | undefined>, niche: string | null) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) params.set(key, value);
  }
  params.set("kind", "component");
  if (niche) params.set("niche", niche);
  else params.delete("niche");
  return `/browse?${params.toString()}`;
}

export function NicheSidebar({
  activeNiche,
  counts,
  totalCount,
  baseParams,
}: {
  activeNiche?: string;
  counts: Record<string, number>;
  totalCount: number;
  baseParams: Record<string, string | undefined>;
}) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
        <Link
          href={hrefFor(baseParams, null)}
          className={`mb-4 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            !activeNiche ? "bg-gradient-to-br from-accent to-accent-2 text-white" : "text-fg hover:bg-surface"
          }`}
        >
          <span>All components</span>
          <span className="text-xs opacity-80">{totalCount}</span>
        </Link>

        {NICHE_SECTIONS.map((section) => (
          <div key={section} className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wide text-muted">
              {section}
            </p>
            <ul className="space-y-0.5">
              {nichesBySection(section).map(({ name }) => {
                const isActive = activeNiche === name;
                const count = counts[name] ?? 0;
                return (
                  <li key={name}>
                    <Link
                      href={hrefFor(baseParams, name)}
                      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "bg-surface-2 text-fg"
                          : count > 0
                            ? "text-fg/90 hover:bg-surface"
                            : "text-muted hover:bg-surface"
                      }`}
                    >
                      <span>{name}</span>
                      <span className="text-xs tabular-nums text-muted">{count > 0 ? count : "—"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
