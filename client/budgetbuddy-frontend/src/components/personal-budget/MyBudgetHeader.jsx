import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MyBudgetHeader({ month }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          My Budget
        </h1>
        <p className="text-muted-foreground mt-1">
          A personal overview of your monthly income and expenses.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link to={`/my-budget/${month}/edit`}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Budget
        </Link>
      </Button>
    </div>
  );
}