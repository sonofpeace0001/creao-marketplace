export function LivePreviewFrame({ url, title }: { url: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]" />
        <span className="ml-2 truncate text-xs text-muted">{url}</span>
      </div>
      <iframe
        src={url}
        title={`${title} live preview`}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        className="h-[600px] w-full bg-white"
      />
    </div>
  );
}
