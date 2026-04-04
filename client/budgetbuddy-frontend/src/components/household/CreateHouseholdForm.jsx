import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateHouseholdForm({
  householdName,
  setHouseholdName,
  monthlyIncome,
  setMonthlyIncome,
  isLoading,
  onBack,
  onSubmit,
}) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground">Create a household</h2>
        <p className="text-muted-foreground mt-2">
          Set up a shared household and invite your partner.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="input-label">Household Name</label>
          <Input
            type="text"
            placeholder="e.g. Alex & Sam"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
          />
        </div>

        <div>
          <label className="input-label">Your Monthly Income (SEK)</label>
          <Input
            type="number"
            placeholder="e.g. 40000"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            min={0}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Back
          </Button>

          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}