import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function EmptyBudget({ month }) {
  return (
    <div className="card-elevated p-6 text-center">
      <h2 className="text-lg font-semibold">No budget yet</h2>
      <p className="text-muted-foreground mt-2">
        Create your first budget plan for {month}.
      </p>
      <Button asChild className="mt-4">
        <Link to={`/budget/${month}/edit`}>Create Budget</Link>
      </Button>
    </div>
  );
}