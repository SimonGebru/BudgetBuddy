import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TransactionsList({
  transactions,
  onDelete,
  isDeletingId,
}) {
  if (transactions.length === 0) {
    return (
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Your entries
        </h2>
        <p className="text-sm text-muted-foreground">
          No transactions logged for this month yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Your entries
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          A simple log of your spending and income.
        </p>
      </div>

      <div className="divide-y divide-border">
        {transactions.map((tx) => (
          <div
            key={tx._id}
            className="flex items-center justify-between py-3 gap-4"
          >
            {/* LEFT */}
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">
                {tx.category}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                {new Date(tx.date).toLocaleDateString("sv-SE")}
                {tx.note ? ` • ${tx.note}` : ""}
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 shrink-0">
              <p
                className={`font-semibold ${
                  tx.type === "income"
                    ? "text-emerald-600"
                    : "text-foreground"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}
                {tx.amount} kr
              </p>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(tx._id)}
                disabled={isDeletingId === tx._id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}