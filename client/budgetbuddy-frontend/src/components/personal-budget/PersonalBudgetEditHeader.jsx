import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PersonalBudgetEditHeader({
  month,
  onBack,
  onDuplicate,
  isDuplicating,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Edit My Budget
          </h1>
          <p className="text-muted-foreground mt-1">{month}</p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onDuplicate}
        disabled={isDuplicating}
      >
        <Copy className="h-4 w-4 mr-2" />
        {isDuplicating ? "Copying..." : "Copy previous"}
      </Button>
    </div>
  );
}