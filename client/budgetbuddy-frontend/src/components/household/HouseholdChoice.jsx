import { Home, Users, ArrowRight, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function HouseholdChoice({ onSelectCreate, onSelectJoin }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Home className="h-8 w-8 text-primary-foreground" />
        </div>

        <h2 className="text-2xl font-bold text-foreground">Set up your household</h2>
        <p className="text-muted-foreground mt-2">
          Budget together with your partner, or continue using Budgify on your own.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onSelectCreate}
          className="card-interactive w-full p-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Home className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">Create Household</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Start fresh and invite your partner
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </button>

        <button
          type="button"
          onClick={onSelectJoin}
          className="card-interactive w-full p-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-accent" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">Join Household</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Connect with your partner&apos;s household
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </button>
      </div>

      <div className="card-elevated p-4">
        <p className="text-sm text-muted-foreground text-center mb-3">
          You can also keep using Budgify without a household for now.
        </p>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/my-budget")}
        >
          <WalletCards className="h-4 w-4 mr-2" />
          Continue with personal budget
        </Button>
      </div>
    </div>
  );
}