export function PersonalBudgetSummary({
  totalIncome,
  totalExpenses,
  remaining,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card-elevated p-5">
        <p className="text-sm text-muted-foreground">Total Income</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {totalIncome} kr
        </p>
      </div>

      <div className="card-elevated p-5">
        <p className="text-sm text-muted-foreground">Total Expenses</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {totalExpenses} kr
        </p>
      </div>

      <div className="card-elevated p-5">
        <p className="text-sm text-muted-foreground">Remaining</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {remaining} kr
        </p>
      </div>
    </div>
  );
}