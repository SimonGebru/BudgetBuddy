import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrency, formatMonth } from '@/data/mockData';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border bg-background p-3 shadow-md">
      <p className="font-medium text-foreground mb-2">{formatMonth(label)}</p>

      {payload.map((entry) => (
        <div key={entry.dataKey} className="text-sm">
          <span className="text-muted-foreground">{entry.name}: </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HomeBudgetChart({ history }) {
  const chartData = history.map((entry) => ({
    month: entry.month,
    yourShare: entry.yourShare,
    partnerShare: entry.partnerShare,
    totalBudget: entry.totalBudget,
  }));

  if (!chartData.length) {
    return (
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Budget Overview</h2>
        <p className="text-muted-foreground">
          No budget history yet. Create a few monthly budgets to see your chart here.
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Budget Overview</h2>
        <p className="text-sm text-muted-foreground">
          Compare your planned share with your partner’s over time.
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => formatMonth(value)}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="yourShare"
              name="Your share"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="partnerShare"
              name="Partner share"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}