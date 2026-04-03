import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuickTransactionForm({
  form,
  setForm,
  onSubmit,
  isSubmitting,
}) {
  return (
    <div className="card-elevated p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Quick add
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add a personal transaction in a few seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[120px_140px_1fr_170px] gap-3">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <Input
          type="number"
          min="0"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <Input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Note (optional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <Button onClick={onSubmit} disabled={isSubmitting} className="md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {isSubmitting ? "Adding..." : "Add transaction"}
        </Button>
      </div>
    </div>
  );
}