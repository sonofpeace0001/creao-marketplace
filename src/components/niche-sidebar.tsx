import Link from "next/link";
import { NICHE_SECTIONS, nichesBySection } from "@/lib/ui-component-niches";

function hrefFor(baseParams: Record<string, string | undefined>, niche: string | null) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) params.set(key, value);
  }
  if (niche) params.set("niche", niche);
  else params.delete("niche");
  const qs = params.toString();
  return qs ? `/components?${qs}` : "/components";
}

type SidebarProps = {
  activeNiche?: string;
  counts: Record<string, number>;
  totalCount: number;
  baseParams: Record<string, string | undefined>;
};

function SidebarList({ activeNiche, counts, totalCount, baseParams }: SidebarProps) {
  return (
    <>
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
        <div key={section} className="mb-6 last:mb-0">
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
    </>
  );
}

// Desktop: a persistent left column, sticky under the sticky nav bar.
export function NicheSidebar(props: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
        <SidebarList {...props} />
      </div>
    </aside>
  );
}

// Mobile/narrow: a native disclosure, no JS required, always reachable near the top.
export function NicheSidebarMobile(props: SidebarProps) {
  return (
    <details className="mb-6 rounded-xl border border-border bg-surface md:hidden">
      <summary className="cursor-pointer select-none list-none px-4 py-3 text-sm font-medium text-fg">
        Categories{props.activeNiche ? ` · ${props.activeNiche}` : ""}
      </summary>
      <div className="max-h-80 overflow-y-auto border-t border-border p-3">
        <SidebarList {...props} />
      </div>
    </details>
  );
}
