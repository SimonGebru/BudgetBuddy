import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatCurrency } from "@/data/mockData";

export function MyBudgetSummaryCards({ budget }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {formatCurrency(budget.totalIncome)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="card-elevated p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {formatCurrency(budget.totalExpenses)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <ArrowUpCircle className="h-5 w-5 text-rose-600" />
          </div>
        </div>
      </div>

      <div className="card-elevated p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {formatCurrency(budget.remaining)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}