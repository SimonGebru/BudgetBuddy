import { formatCurrency } from '@/data/mockData';

export function CategoryCard({ category, currentUserId, index }) {
  const perPerson = category.perPerson || [];

  // Hittar hur stor del av kategorin som tillhör den aktuella användaren.
  const currentUserShare = perPerson.find(
    (p) => String(p.userId) === String(currentUserId)
  );

  // Antar att den andra posten i perPerson är partnern i hushållet.
  const partnerShare = perPerson.find(
    (p) => String(p.userId) !== String(currentUserId)
  );

  // Räknar ut hur stor procent av kategorin som användaren står för.
  const currentUserPercent =
    category.amount > 0
      ? ((currentUserShare?.amount || 0) / category.amount) * 100
      : 0;

  // Säkerställer att progressbaren alltid ligger mellan 0–100
  const clampedPercent = Math.min(100, Math.max(0, currentUserPercent));

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

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      {/* Per person */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">You pay</span>
          <span className="font-medium">
            {formatCurrency(currentUserShare?.amount || 0)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {partnerShare?.name || 'Partner'}
          </span>
          <span className="font-medium">
            {formatCurrency(partnerShare?.amount || 0)}
          </span>
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}

// Skeleton loader för loading state
export function CategoryCardSkeleton({ index = 0 }) {
  return (
    <div
      className="card-interactive p-4 animate-pulse"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="mb-3">
        <div className="h-4 w-24 bg-muted rounded mb-2" />
        <div className="h-6 w-20 bg-muted rounded" />
      </div>

      <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-3">
        <div className="h-full w-1/2 bg-muted rounded-full" />
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}