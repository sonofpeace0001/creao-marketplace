import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditItemForm } from "@/components/edit-item-form";

export default async function EditItemPage({ params }: PageProps<"/dashboard/[itemId]/edit">) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .eq("creator_id", userData.user!.id)
    .maybeSingle();

  if (!item) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit {item.title}</h1>
      <div className="mt-8">
        <EditItemForm item={item} />
      </div>
    </div>
  );
}
