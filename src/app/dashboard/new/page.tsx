import { PublishForm } from "@/components/publish-form";

export default function NewItemPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Publish a new item</h1>
      <p className="mt-2 text-muted">Paste your self-contained HTML and add a thumbnail.</p>
      <div className="mt-8">
        <PublishForm />
      </div>
    </div>
  );
}
