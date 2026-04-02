import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, PiggyBank, Landmark, Pencil } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/budget/MonthPicker";
import { getPersonalBudget } from "@/services/api";
import { getCurrentMonth } from "@/data/mockData";
import { MyBudgetHeader } from "@/components/personal-budget/MyBudgetHeader";
import { MyBudgetSummaryCards } from "@/components/personal-budget/MyBudgetSummaryCards";
import { MyBudgetStatusBanner } from "@/components/personal-budget/MyBudgetStatusBanner";
import { BudgetItemsCard } from "@/components/personal-budget/BudgetItemsCard";

export default function MyBudget() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());

  useEffect(() => {
    async function fetchBudget() {
      setLoading(true);

      try {
        const data = await getPersonalBudget(month);
        setBudget(data);
      } catch (err) {
        console.error("Failed to fetch personal budget", err);
        setBudget(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBudget();
  }, [month]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              My Budget
            </h1>
            <p className="text-muted-foreground mt-1">
              A personal overview of your monthly income and expenses.
            </p>
          </div>

          <div className="card-elevated p-6">
            <p className="text-muted-foreground">Loading personal budget...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!budget) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              My Budget
            </h1>
            <p className="text-muted-foreground mt-1">
              A personal overview of your monthly income and expenses.
            </p>
          </div>

          <MonthPicker month={month} onChange={setMonth} />

          <div className="card-elevated p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Wallet className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                No personal budget yet
              </h2>
              <p className="text-muted-foreground mt-1">
                Create your personal budget for this month to track your own
                income and expenses.
              </p>
            </div>

            <Button asChild>
              <Link to={`/my-budget/${month}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Create Personal Budget
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <MyBudgetHeader month={month} />

        <MonthPicker month={month} onChange={setMonth} />

        <MyBudgetSummaryCards budget={budget} />

        <MyBudgetStatusBanner remaining={budget.remaining} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BudgetItemsCard
            title="Incomes"
            description={`All income sources for ${month}`}
            items={budget.incomes}
            emptyText="No incomes added yet."
            emptyLabel="Income source"
            Icon={Landmark}
            iconWrapperClassName="bg-emerald-100"
            iconClassName="text-emerald-600"
            itemCardClassName="border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50"
            amountClassName="text-emerald-700"
          />

          <BudgetItemsCard
            title="Expenses"
            description={`All planned expenses for ${month}`}
            items={budget.expenses}
            emptyText="No expenses added yet."
            emptyLabel="Planned expense"
            Icon={PiggyBank}
            iconWrapperClassName="bg-rose-100"
            iconClassName="text-rose-600"
            itemCardClassName="border-rose-100 bg-rose-50/60 hover:bg-rose-50"
            amountClassName="text-foreground"
          />
        </div>
      </div>
    </AppLayout>
  );
}