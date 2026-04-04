import { Copy, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HouseholdCard({
  household,
  onCopyId,
  onLeaveHousehold,
  isLeavingHousehold,
}) {
  return (
    <div className="card-elevated p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Home className="h-7 w-7 text-primary-foreground" />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">{household.name}</h2>
          <p className="text-sm text-muted-foreground">Your shared household</p>
        </div>
      </div>

      <div className="rounded-xl bg-muted/50 p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Household ID</p>
          <p className="font-mono text-sm text-foreground break-all">{household.id}</p>
        </div>

        <Button variant="outline" size="icon" onClick={onCopyId}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          onClick={onLeaveHousehold}
          disabled={isLeavingHousehold}
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLeavingHousehold ? "Leaving..." : "Leave Household"}
        </Button>
      </div>
    </div>
  );
}