import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinHouseholdForm({
  householdId,
  setHouseholdId,
  joinIncome,
  setJoinIncome,
  isLoading,
  onBack,
  onSubmit,
}) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground">Join a household</h2>
        <p className="text-muted-foreground mt-2">
          Enter the household ID from your partner.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="input-label">Household ID</label>
          <Input
            type="text"
            placeholder="Enter the ID from your partner"
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
          />
        </div>

        <div>
          <label className="input-label">Your Monthly Income (SEK)</label>
          <Input
            type="number"
            placeholder="e.g. 35000"
            value={joinIncome}
            onChange={(e) => setJoinIncome(e.target.value)}
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
            {isLoading ? "Joining..." : "Join"}
          </Button>
        </div>
      </form>
    </div>
  );
}