import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Home as HomeIcon, Settings, Users, Wallet } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import HomeBudgetChart from '@/components/home/HomeBudgetChart';
import { getBudgetHistory, getCurrentUser } from '@/services/api';
import { getCurrentMonth, formatCurrency, formatMonth } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);

    try {
      const [userData, historyData] = await Promise.all([
        getCurrentUser(),
        getBudgetHistory(),
      ]);

      setCurrentUser(userData);
      setHistory(historyData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load home data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonth = getCurrentMonth();
  const currentMonthEntry =
    history.find((entry) => entry.month === currentMonth) || null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {currentUser?.name ? `${currentUser.name} 👋` : 'Home'}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Here’s a quick overview of your household budget and your recent monthly plan history.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-elevated p-4 h-[88px]">
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-3 w-24" />
                  <div className="skeleton-shimmer h-6 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="card-elevated p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Current Month</p>
                    <p className="text-xl font-bold tracking-tight">{formatMonth(currentMonth)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              <div className="card-elevated p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">This Month Total</p>
                    <p className="text-xl font-bold tracking-tight">
                      {formatCurrency(currentMonthEntry?.totalBudget || 0)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              <div className="card-elevated p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Your Planned Share</p>
                    <p className="text-xl font-bold tracking-tight">
                      {formatCurrency(currentMonthEntry?.yourShare || 0)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted">
                    <HomeIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              <div className="card-elevated p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Default Split Mode</p>
                    <p className="text-xl font-bold tracking-tight">
                      {currentUser?.defaultSplitMode === 'income' && 'Income'}
                      {currentUser?.defaultSplitMode === 'equal' && '50/50'}
                      {currentUser?.defaultSplitMode === 'topEarnsMore' && 'Top +%'}
                      {!currentUser?.defaultSplitMode && '50/50'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link to="/dashboard">
                    Open Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/household">
                    <Users className="h-4 w-4 mr-2" />
                    View Household
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>

            {/* Chart */}
            <HomeBudgetChart history={history} />

            {/* History */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Monthly History</h2>
                <Link
                  to="/dashboard"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Go to dashboard
                </Link>
              </div>

              {history.length === 0 ? (
                <p className="text-muted-foreground">
                  No budget history yet. Create your first monthly budget to see statistics here.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...history].reverse().slice(0, 5).map((entry) => (
                    <div
                      key={entry.month}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{formatMonth(entry.month)}</p>
                          <p className="text-sm text-muted-foreground">
                            Split mode:{' '}
                            {entry.splitMode === 'income' && 'Income'}
                            {entry.splitMode === 'equal' && '50/50'}
                            {entry.splitMode === 'topEarnsMore' && 'Top +%'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total budget</p>
                            <p className="font-semibold text-foreground">
                              {formatCurrency(entry.totalBudget)}
                            </p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">Your share</p>
                            <p className="font-semibold text-foreground">
                              {formatCurrency(entry.yourShare)}
                            </p>
                          </div>

                          <div>
                            <p className="text-muted-foreground">Partner share</p>
                            <p className="font-semibold text-foreground">
                              {formatCurrency(entry.partnerShare)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}