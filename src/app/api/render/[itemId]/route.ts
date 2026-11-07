import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const LOCKED_HTML = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Locked</title><body style="margin:0;display:grid;place-items:center;min-height:100vh;font-family:system-ui,sans-serif;background:#0a0a0a;color:#a1a1aa;text-align:center"><p>This page is locked.<br>Purchase it to view the full page.</p></body>`;

// Serves a creator-submitted item's stored HTML with the right content type,
// so it can be dropped straight into an <iframe src="..."> as a live preview.
// Reads go through the `item_content` RLS policy: only the creator, a buyer,
// or anyone (for free items) gets the HTML back; everyone else gets the
// locked placeholder.
export async function GET(_request: Request, { params }: RouteContext<"/api/render/[itemId]">) {
  const { itemId } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select("id")
    .eq("id", itemId)
    .eq("status", "published")
    .maybeSingle();

  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { data: content } = await supabase
    .from("item_content")
    .select("source_html")
    .eq("item_id", itemId)
    .maybeSingle();

  if (!content?.source_html) {
    return new NextResponse(LOCKED_HTML, {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }

  return new NextResponse(content.source_html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
  });
}
