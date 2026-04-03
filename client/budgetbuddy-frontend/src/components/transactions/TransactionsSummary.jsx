export function TransactionsSummary({ transactions }) {
  const totalSpent = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const totalEntries = transactions.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card-elevated p-5">
        <p className="text-sm text-muted-foreground">Total spent</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {totalSpent} kr
        </p>
      </div>

      <div className="card-elevated p-5">
        <p className="text-sm text-muted-foreground">Total income</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {totalIncome} kr
        </p>
      </div>

      <div className="card-elevated p-5">
        <p className="text-sm text-muted-foreground">Entries this month</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {totalEntries}
        </p>
      </div>
    </div>
  );
}