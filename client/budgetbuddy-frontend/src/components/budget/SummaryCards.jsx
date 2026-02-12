export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="card-elevated p-4">Summary 1</div>
      <div className="card-elevated p-4">Summary 2</div>
      <div className="card-elevated p-4">Summary 3</div>
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card-elevated p-4">
          <div className="skeleton-shimmer h-5 w-24" />
          <div className="skeleton-shimmer h-8 w-32 mt-3" />
        </div>
      ))}
    </div>
  );
}