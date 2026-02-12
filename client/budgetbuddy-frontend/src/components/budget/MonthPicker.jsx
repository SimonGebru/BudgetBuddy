import { Button } from "@/components/ui/button";

export function MonthPicker({ month, onChange }) {
  const go = (delta) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    onChange(next);
  };

  return (
    <div className="card-elevated p-4 flex items-center justify-between">
      <Button variant="outline" onClick={() => go(-1)}>Prev</Button>
      <div className="font-medium">{month}</div>
      <Button variant="outline" onClick={() => go(1)}>Next</Button>
    </div>
  );
}