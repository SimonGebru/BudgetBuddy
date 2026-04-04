import { Link } from "react-router-dom";
import { CheckCircle, Copy, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HouseholdSuccess({
  successType,
  createdHouseholdId,
  currentMonth,
  onCopyHouseholdId,
}) {
  return (
    <div className="text-center animate-scale-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-primary" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        {successType === "created" ? "Household Created!" : "Welcome to the Household!"}
      </h2>

      <p className="text-muted-foreground mb-8">
        {successType === "created"
          ? "You're all set! Share your household ID with your partner so they can join."
          : "You've successfully joined the household. You can now budget together!"}
      </p>

      {successType === "created" && (
        <div className="card-elevated p-4 mb-6">
          <p className="text-xs font-medium text-muted-foreground mb-2">Your Household ID</p>
          <div className="flex items-center justify-between gap-3 bg-muted rounded-lg p-3">
            <code className="text-sm font-mono text-foreground">{createdHouseholdId}</code>
            <Button variant="ghost" size="icon" onClick={onCopyHouseholdId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this with your partner to let them join
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Button asChild size="lg" className="w-full">
          <Link to={`/budget/${currentMonth}/edit`}>
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Create Your First Budget
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}