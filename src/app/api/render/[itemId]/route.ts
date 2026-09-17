import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Serves a creator-submitted item's stored HTML with the right content type,
// so it can be dropped straight into an <iframe src="..."> as a live preview
// — the same way an `external_url` item's own live page is used directly.
export async function GET(_request: Request, { params }: RouteContext<"/api/render/[itemId]">) {
  const { itemId } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select("source_html, status")
    .eq("id", itemId)
    .eq("status", "published")
    .maybeSingle();

  if (!item?.source_html) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return new NextResponse(item.source_html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
