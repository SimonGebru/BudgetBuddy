import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Home, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getMyHousehold } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function Household() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [household, setHousehold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHousehold = async () => {
      try {
        const user = await getCurrentUser();

        if (!user?.householdId) {
          navigate("/onboarding");
          return;
        }

        const data = await getMyHousehold();
        setHousehold(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load household information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHousehold();
  }, [navigate, toast]);

  const handleCopyId = async () => {
    if (!household?.id) return;

    await navigator.clipboard.writeText(household.id);
    toast({
      title: "Copied!",
      description: "Household ID copied to clipboard.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 lg:max-w-3xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Household</h1>

        {isLoading && (
          <div className="card-elevated p-6">
            <p className="text-muted-foreground">Loading household...</p>
          </div>
        )}

        {!isLoading && household && (
          <>
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

                <Button variant="outline" size="icon" onClick={handleCopyId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Members</h3>
              </div>

              <div className="space-y-3">
                {household.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between rounded-xl bg-muted/40 p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Monthly income</p>
                      <p className="font-semibold text-foreground">
                        {member.monthlyIncome} SEK
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}