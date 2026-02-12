import { Button } from "@/components/ui/button";

export function SplitModeSelector({ split, onChange }) {
  return (
    <div className="card-elevated p-4 flex items-center gap-2">
      <div className="text-sm text-muted-foreground mr-auto">Split mode:</div>
      <Button
        variant={split === "income" ? "default" : "outline"}
        onClick={() => onChange("income")}
      >
        Income
      </Button>
      <Button
        variant={split === "equal" ? "default" : "outline"}
        onClick={() => onChange("equal")}
      >
        Equal
      </Button>
    </div>
  );
}