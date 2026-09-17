import { BuyButton } from "@/components/buy-button";

export function PaywallCard({ itemId, priceCents, currency }: { itemId: string; priceCents: number; currency: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
      <p className="font-medium">The full HTML source is locked</p>
      <p className="mt-1 text-sm text-muted">
        The live preview above is free to try. Buy the item to unlock the source code.
      </p>
      <div className="mt-5 flex justify-center">
        <BuyButton itemId={itemId} priceCents={priceCents} currency={currency} />
      </div>
    </div>
  );
}
