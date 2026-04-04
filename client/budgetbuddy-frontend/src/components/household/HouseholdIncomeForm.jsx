import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HouseholdIncomeForm({
  selectedMonth,
  setSelectedMonth,
  myIncome,
  setMyIncome,
  onSaveIncome,
  isSavingIncome,
}) {
  return (
    <div className="card-elevated p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">Monthly income</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a month and update your income for that specific budget period.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[180px_1fr_auto]">
        <div>
          <label className="input-label">Month</label>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        <div>
          <label className="input-label">Your income for selected month</label>
          <Input
            type="number"
            min={0}
            value={myIncome}
            onChange={(e) => setMyIncome(e.target.value)}
            placeholder="Enter your income"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={onSaveIncome}
            disabled={isSavingIncome}
            className="w-full lg:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSavingIncome ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}