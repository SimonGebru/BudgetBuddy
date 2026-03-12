import { formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function CategoryCard({ category, currentUserId, index }) {
  const currentUserShare = category.perPerson.find(
    (p) => String(p.userId) === String(currentUserId)
  );
  const partnerShare = category.perPerson.find(
    (p) => String(p.userId) !== String(currentUserId)
  );
  
  const currentUserPercent =
    category.amount > 0
      ? ((currentUserShare?.amount || 0) / category.amount) * 100
      : 0;

  return (
    <div
      className="card-interactive p-4 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{category.name}</h4>
          <p className="text-lg font-bold text-primary mt-0.5">
            {formatCurrency(category.amount)}
          </p>
        </div>
      </div>

      {/* Progress bar showing split */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${currentUserPercent}%` }}
        />
      </div>

      {/* Person breakdown */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">You pay</span>
          <span className="font-medium">{formatCurrency(currentUserShare?.amount || 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{partnerShare?.name}</span>
          <span className="font-medium">{formatCurrency(partnerShare?.amount || 0)}</span>
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-5 w-24" />
          <div className="skeleton-shimmer h-6 w-20" />
        </div>
      </div>
      <div className="skeleton-shimmer h-2 w-full rounded-full mb-3" />
      <div className="flex justify-between">
        <div className="skeleton-shimmer h-4 w-20" />
        <div className="skeleton-shimmer h-4 w-20" />
      </div>
    </div>
  );
}