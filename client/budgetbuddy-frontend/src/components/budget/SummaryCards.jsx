import { Wallet, TrendingUp, User, Users, Coins } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';

function SummaryCard({ label, value, icon: Icon, variant = 'default' }) {
  return (
    <div
      className={cn(
        'card-elevated p-4 animate-fade-in',
        variant === 'primary' && 'bg-primary text-primary-foreground',
        variant === 'accent' && 'bg-secondary',
        variant === 'mine' && 'bg-emerald-50 border border-emerald-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              'text-xs font-medium',
              variant === 'primary'
                ? 'text-primary-foreground/80'
                : variant === 'mine'
                ? 'text-emerald-700/80'
                : 'text-muted-foreground'
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'text-lg font-bold tracking-tight',
              variant === 'mine' && 'text-emerald-900'
            )}
          >
            {value}
          </p>
        </div>

        <div
          className={cn(
            'p-2 rounded-lg',
            variant === 'primary'
              ? 'bg-primary-foreground/20'
              : variant === 'accent'
              ? 'bg-primary/10'
              : variant === 'mine'
              ? 'bg-emerald-100'
              : 'bg-muted'
          )}
        >
          <Icon
            className={cn(
              'h-4 w-4',
              variant === 'primary'
                ? 'text-primary-foreground'
                : variant === 'mine'
                ? 'text-emerald-600'
                : 'text-primary'
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function SummaryCards({ budget, currentUserId }) {
  const currentUser = budget.people.find(
    (p) => String(p.userId) === String(currentUserId)
  );
  const partner = budget.people.find(
    (p) => String(p.userId) !== String(currentUserId)
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
      <SummaryCard
        label="Total Budget"
        value={formatCurrency(budget.totalBudget)}
        icon={Wallet}
        variant="primary"
      />

      <SummaryCard
        label="Combined Income"
        value={formatCurrency(budget.totalIncome)}
        icon={TrendingUp}
      />

      <SummaryCard
        label="Your Income"
        value={formatCurrency(currentUser?.monthlyIncome || 0)}
        icon={Coins}
        variant="mine"
      />

      <SummaryCard
        label="Partner Income"
        value={formatCurrency(partner?.monthlyIncome || 0)}
        icon={Users}
      />

      <SummaryCard
        label="Your Share"
        value={formatCurrency(currentUser?.contributionTotal || 0)}
        icon={User}
        variant="mine"
      />

      <SummaryCard
        label="Partner Share"
        value={formatCurrency(partner?.contributionTotal || 0)}
        icon={Users}
      />
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card-elevated p-4 h-[88px]">
          <div className="space-y-2">
            <div className="skeleton-shimmer h-3 w-20" />
            <div className="skeleton-shimmer h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}