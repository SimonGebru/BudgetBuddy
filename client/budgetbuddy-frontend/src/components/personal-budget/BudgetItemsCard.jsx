import { formatCurrency } from "@/data/mockData";

export function BudgetItemsCard({
  title,
  description,
  items,
  emptyText,
  emptyLabel,
  Icon,
  iconWrapperClassName,
  iconClassName,
  itemCardClassName,
  amountClassName,
}) {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconWrapperClassName}`}
        >
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {items?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition-all duration-200 ${itemCardClassName}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{emptyLabel}</p>
                </div>

                <p className={`font-semibold whitespace-nowrap ${amountClassName}`}>
                  {formatCurrency(item.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}