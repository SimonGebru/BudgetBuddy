export function CategoryCard({ category }) {
  return (
    <div className="card-elevated p-4">
      <div className="font-medium">{category.name}</div>
      <div className="text-sm text-muted-foreground mt-1">
        Planned: {category.planned} SEK
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="card-elevated p-4">
      <div className="skeleton-shimmer h-5 w-28" />
      <div className="skeleton-shimmer h-4 w-20 mt-2" />
    </div>
  );
}