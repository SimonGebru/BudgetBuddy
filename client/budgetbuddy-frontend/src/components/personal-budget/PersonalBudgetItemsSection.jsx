import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PersonalBudgetItemsSection({
  title,
  addLabel,
  items,
  setItems,
  updateItem,
  addItem,
  removeItem,
  namePlaceholder,
}) {
  return (
    <div className="card-elevated p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => addItem(items, setItems)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addLabel}
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_140px_auto] gap-3 items-center"
          >
            <Input
              placeholder={namePlaceholder}
              value={item.name}
              onChange={(e) =>
                updateItem(items, setItems, item.id, "name", e.target.value)
              }
            />

            <Input
              type="number"
              min={0}
              placeholder="Amount"
              value={item.amount}
              onChange={(e) =>
                updateItem(items, setItems, item.id, "amount", e.target.value)
              }
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(items, setItems, item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}