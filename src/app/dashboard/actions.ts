"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ItemCategory, ItemKind } from "@/lib/categories";

async function uploadThumbnail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("thumbnails").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

export type CreateItemState = { error: string } | undefined;

export async function createItem(
  _prevState: CreateItemState,
  formData: FormData
): Promise<CreateItemState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const kind = String(formData.get("kind") ?? "component") as ItemKind;
  const category = String(formData.get("category") ?? "saas") as ItemCategory;
  const niche = String(formData.get("niche") ?? "").trim() || null;
  const theme = String(formData.get("theme") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceDollars = parseFloat(String(formData.get("price") ?? "0")) || 0;
  const sourceHtml = String(formData.get("source_html") ?? "").trim();
  const thumbnailFile = formData.get("thumbnail") as File | null;

  if (!title || !sourceHtml) {
    return { error: "Title and HTML source are required" };
  }
  if (!thumbnailFile || thumbnailFile.size === 0) {
    return { error: "A thumbnail image is required" };
  }

  let thumbnailUrl: string;
  try {
    thumbnailUrl = await uploadThumbnail(supabase, userData.user.id, thumbnailFile);
  } catch {
    return { error: "Failed to upload thumbnail" };
  }

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;
  const itemId = crypto.randomUUID();

  const { error } = await supabase.from("items").insert({
    id: itemId,
    creator_id: userData.user.id,
    slug,
    title,
    description,
    kind,
    category,
    niche,
    theme,
    price_cents: Math.round(priceDollars * 100),
    source_type: "stored",
    source_html: sourceHtml,
    preview_url: `/api/render/${itemId}`,
    thumbnail_url: thumbnailUrl,
    status: "published",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/items/${slug}`);
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) throw error;
  revalidatePath("/dashboard");
}

export type UpdateItemState = { error: string } | undefined;

export async function updateItem(
  itemId: string,
  _prevState: UpdateItemState,
  formData: FormData
): Promise<UpdateItemState> {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "saas") as ItemCategory;
  const niche = String(formData.get("niche") ?? "").trim() || null;
  const theme = String(formData.get("theme") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceDollars = parseFloat(String(formData.get("price") ?? "0")) || 0;

  if (!title) return { error: "Title is required" };

  const { data, error } = await supabase
    .from("items")
    .update({
      title,
      category,
      niche,
      theme,
      description,
      price_cents: Math.round(priceDollars * 100),
    })
    .eq("id", itemId)
    .select("slug")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/items/${data.slug}`);
}
