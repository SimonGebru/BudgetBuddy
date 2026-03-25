import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MonthPicker } from '@/components/budget/MonthPicker';
import { SummaryCards, SummaryCardsSkeleton } from '@/components/budget/SummaryCards';
import { SplitModeSelector } from '@/components/budget/SplitModeSelector';
import { CategoryCard, CategoryCardSkeleton } from '@/components/budget/CategoryCard';
import { EmptyBudget } from '@/components/budget/EmptyBudget';
import { Button } from '@/components/ui/button';
import { getBudgetSummary, updateSplitMode, getCurrentUser } from '@/services/api';
import { getCurrentMonth } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const DASHBOARD_MONTH_STORAGE_KEY = 'budgetbuddy-selected-month';

function formatSek(value) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const { toast } = useToast();

  const [month, setMonth] = useState(() => {
    return localStorage.getItem(DASHBOARD_MONTH_STORAGE_KEY) || getCurrentMonth();
  });

  const [budget, setBudget] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sparar den valda månaden så att användaren stannar kvar på samma månad
    // även efter refresh eller om sidan öppnas igen.
    localStorage.setItem(DASHBOARD_MONTH_STORAGE_KEY, month);
  }, [month]);

  useEffect(() => {
    // Laddar om dashboard-datan när användaren byter månad.
    loadBudget();
  }, [month]);

  const loadBudget = async () => {
    setIsLoading(true);

    try {
      // Hämtar både budgeten och aktuell användare parallellt
      // för att slippa vänta på två separata requests efter varandra.
      const [budgetData, userData] = await Promise.all([
        getBudgetSummary(month),
        getCurrentUser(),
      ]);

      setBudget(budgetData);
      setCurrentUser(userData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load budget data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitChange = async (newSplit) => {
    if (!budget) return;

    try {
      await updateSplitMode(month, newSplit);

      // Efter uppdatering hämtas budgeten igen så att UI:t alltid visar backendens senaste uträkning.
      const refreshedBudget = await getBudgetSummary(month);
      setBudget(refreshedBudget);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update split mode.',
        variant: 'destructive',
      });
    }
  };

  const hasBudget = budget && budget.categories.length > 0;

  // Konverterar till Number för att vara säker på att jämförelsen blir numerisk och inte sker som text.
  const totalBudgetNumber = Number(budget?.totalBudget || 0);
  const totalIncomeNumber = Number(budget?.totalIncome || 0);

  const isOverBudget = totalBudgetNumber > totalIncomeNumber;
  const overBudgetAmount = isOverBudget ? totalBudgetNumber - totalIncomeNumber : 0;
  const remainingAmount = !isOverBudget ? totalIncomeNumber - totalBudgetNumber : 0;

  // Räknar hur stor del av inkomsten som budgeten använder.
  // Max 100 i UI så att progressbaren inte flyter ut visuellt om budgeten är högre än inkomsten.
  const budgetUsagePercent =
    totalIncomeNumber > 0
      ? Math.min((totalBudgetNumber / totalIncomeNumber) * 100, 100)
      : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Month Picker */}
        <MonthPicker month={month} onChange={setMonth} />

        {/* Loading State */}
        {isLoading && (
          <>
            <SummaryCardsSkeleton />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {/* Content */}
        {!isLoading && budget && currentUser && (
          <>
            {hasBudget ? (
              <>
                {/* Summary Cards */}
                <SummaryCards budget={budget} currentUserId={currentUser.id} />

                {/* Budget health */}
                <div className="card-elevated p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Budget vs Income</p>
                      <p className="text-sm text-muted-foreground">
                        See how much of your combined income is currently allocated to the budget.
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-foreground">
                      {totalIncomeNumber > 0
                        ? `${Math.round((totalBudgetNumber / totalIncomeNumber) * 100)}%`
                        : '0%'}
                    </p>
                  </div>

                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{ width: `${budgetUsagePercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Budget: {formatSek(totalBudgetNumber)}
                    </span>

                    <span className="text-muted-foreground">
                      Income: {formatSek(totalIncomeNumber)}
                    </span>
                  </div>

                  {isOverBudget ? (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Your planned budget exceeds your combined income by{' '}
                          {formatSek(overBudgetAmount)}.
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Consider reducing some categories before the month starts.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-medium text-emerald-700">
                        You still have {formatSek(remainingAmount)} left before reaching your combined income.
                      </p>
                    </div>
                  )}
                </div>

                {/* Split Mode Selector */}
                <SplitModeSelector split={budget.split} onChange={handleSplitChange} />

                {/* Categories */}
                <div>
                  <h3 className="section-title">Budget Categories</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    {budget.categories.map((category, index) => (
                      <CategoryCard
                        key={category.id || category.name || index}
                        category={category}
                        currentUserId={currentUser.id}
                        index={index}
                      />
                    ))}
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-2">
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to={`/budget/${month}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Budget Plan
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <EmptyBudget month={month} />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}