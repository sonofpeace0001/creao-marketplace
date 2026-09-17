import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";
import { deleteItem } from "@/app/dashboard/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("creator_id", userData.user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <h1 className="font-serif text-3xl">My items</h1>
        <Link
          href="/dashboard/new"
          className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Publish new item
        </Link>
      </div>

      {!items?.length ? (
        <div className="rounded-2xl border border-border bg-surface p-16 text-center text-muted">
          You haven&apos;t published anything yet.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <Link href={`/items/${item.slug}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-sm text-muted">
                  {categoryLabel(item.category)} · {item.kind} · {formatPrice(item.price_cents, item.currency)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/${item.id}/edit`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-hairline hover:text-fg"
                >
                  Edit
                </Link>
                <form action={deleteItem.bind(null, item.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-red-500/50 hover:text-red-500"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
