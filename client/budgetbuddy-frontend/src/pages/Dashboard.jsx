import { useState, useEffect, useRef } from 'react';
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

  // Bara för första laddningen
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // För tysta bakgrundsuppdateringar
  const [isRefreshing, setIsRefreshing] = useState(false);

  // För att undvika dubblad första load i dev-läge
  const hasLoadedInitially = useRef(false);

  useEffect(() => {
    localStorage.setItem(DASHBOARD_MONTH_STORAGE_KEY, month);
  }, [month]);

  useEffect(() => {
    if (!hasLoadedInitially.current) {
      hasLoadedInitially.current = true;
      loadBudget({ showInitialLoader: true });
      return;
    }

    loadBudget({ showInitialLoader: false, showRefreshState: true });
  }, [month]);

  const loadBudget = async ({
    showInitialLoader = false,
    showRefreshState = false,
  } = {}) => {
    if (showInitialLoader) setIsInitialLoading(true);
    if (showRefreshState) setIsRefreshing(true);

    try {
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
      if (showInitialLoader) setIsInitialLoading(false);
      if (showRefreshState) setIsRefreshing(false);
    }
  };

  const handleSplitChange = async (newSplit) => {
    if (!budget) return;

    try {
      await updateSplitMode(month, newSplit);
      await loadBudget({ showInitialLoader: false, showRefreshState: false });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update split mode.',
        variant: 'destructive',
      });
    }
  };

  const hasBudget = budget && budget.categories.length > 0;
  const isSolo = budget?.isSolo;
console.log("isSolo:", isSolo);
  const totalBudgetNumber = Number(budget?.totalBudget || 0);
  const totalIncomeNumber = Number(budget?.totalIncome || 0);

  const isOverBudget = totalBudgetNumber > totalIncomeNumber;
  const overBudgetAmount = isOverBudget ? totalBudgetNumber - totalIncomeNumber : 0;
  const remainingAmount = !isOverBudget ? totalIncomeNumber - totalBudgetNumber : 0;

  const budgetUsagePercent =
    totalIncomeNumber > 0
      ? Math.min((totalBudgetNumber / totalIncomeNumber) * 100, 100)
      : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        </div>

        <MonthPicker month={month} onChange={setMonth} />

        {!budget && (
  <>
    <SummaryCardsSkeleton />
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  </>
)}

        {!isInitialLoading && budget && currentUser && (
          <>
            {isRefreshing && (
              <div className="text-sm text-muted-foreground">
                Updating...
              </div>
            )}

            {isSolo && (
              <div className="card-elevated p-5 lg:p-6 border border-border space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-foreground">
                      Du är ensam i hushållet just nu
                    </h2>
                    <p className="text-sm lg:text-base text-muted-foreground mt-1">
                      Du kan fortfarande använda appen och planera din budget. När någon ansluter aktiveras delning automatiskt.
                    </p>
                  </div>

                  <Button asChild variant="outline" className="w-full lg:w-auto">
                    <Link to="/onboarding">
                      Hantera hushåll
                    </Link>
                  </Button>
                </div>

                {currentUser?.householdId && (
                  <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Invite code</p>
                      <p className="font-mono text-lg">{currentUser.householdId}</p>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(currentUser.householdId);
                        toast({
                          title: 'Copied',
                          description: 'Invite code copied to clipboard',
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            )}

            {hasBudget ? (
              <>
                <SummaryCards budget={budget} currentUserId={currentUser.id} />

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
                          Your planned budget exceeds your combined income by {formatSek(overBudgetAmount)}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-medium text-emerald-700">
                        You still have {formatSek(remainingAmount)} left.
                      </p>
                    </div>
                  )}
                </div>

                <div className={isSolo ? 'opacity-50 pointer-events-none' : ''}>
                  <SplitModeSelector split={budget.split} onChange={handleSplitChange} />
                </div>

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