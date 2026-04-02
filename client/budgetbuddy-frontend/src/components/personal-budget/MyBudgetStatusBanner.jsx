import { formatCurrency } from "@/data/mockData";

export function MyBudgetStatusBanner({ remaining }) {
  const isPositive = remaining >= 0;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPositive
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          isPositive ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {isPositive
          ? `You currently have ${formatCurrency(
              remaining
            )} left after your planned expenses.`
          : `Your expenses currently exceed your income by ${formatCurrency(
              Math.abs(remaining)
            )}.`}
      </p>
    </div>
  );
}