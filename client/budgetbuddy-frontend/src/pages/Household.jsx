import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Home, Users, Save, LogOut } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser, getMyHousehold, updateMyIncome, leaveHousehold } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

function getCurrentMonth() {
  // Används som defaultvärde när sidan öppnas första gången.
  return new Date().toISOString().slice(0, 7);
}

function getIncomeForMonth(member, month) {
  const history = Array.isArray(member.incomeHistory) ? member.incomeHistory : [];
  const match = history.find((entry) => entry.month === month);

  // Om medlemmen har en sparad inkomst för just den månaden används den,
  // annars faller vi tillbaka på monthlyIncome.
  if (match) {
    return Number(match.amount) || 0;
  }

  return Number(member.monthlyIncome) || 0;
}

export default function Household() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [household, setHousehold] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [myIncome, setMyIncome] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [isLeavingHousehold, setIsLeavingHousehold] = useState(false);

  useEffect(() => {
    const loadHousehold = async () => {
      try {
        const user = await getCurrentUser();

        // Om användaren inte är kopplad till något hushåll
        // skickas den vidare till onboarding-flödet.
        if (!user?.householdId) {
          navigate("/onboarding");
          return;
        }

        const data = await getMyHousehold();
        setCurrentUser(user);
        setHousehold(data);

        const me = data.members.find(
          (member) => String(member.userId) === String(user.id)
        );

        // Förifyller användarens inkomst för vald månad när datan laddats in.
        if (me) {
          setMyIncome(String(getIncomeForMonth(me, selectedMonth)));
        }
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

  useEffect(() => {
    if (!household || !currentUser) return;

    const me = household.members.find(
      (member) => String(member.userId) === String(currentUser.id)
    );

    // När användaren byter månad uppdateras inputfältet
    // så att rätt inkomst visas för just den månaden.
    if (me) {
      setMyIncome(String(getIncomeForMonth(me, selectedMonth)));
    }
  }, [selectedMonth, household, currentUser]);

  const handleCopyId = async () => {
    if (!household?.id) return;

    await navigator.clipboard.writeText(household.id);

    toast({
      title: "Copied!",
      description: "Household ID copied to clipboard.",
    });
  };

  const handleSaveIncome = async () => {
    const incomeNumber = Number(myIncome);

    if (!Number.isFinite(incomeNumber) || incomeNumber < 0) {
      toast({
        title: "Invalid income",
        description: "Please enter a valid number greater than or equal to 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingIncome(true);

    try {
      await updateMyIncome(selectedMonth, incomeNumber);

      // Hämtar hushållet igen efter save så att UI:t visar senaste datan från backend.
      const updatedHousehold = await getMyHousehold();
      setHousehold(updatedHousehold);

      toast({
        title: "Income updated",
        description: `Your income for ${selectedMonth} has been saved.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update your income.",
        variant: "destructive",
      });
    } finally {
      setIsSavingIncome(false);
    }
  };

  const handleLeaveHousehold = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this household?"
    );

    if (!confirmed) return;

    setIsLeavingHousehold(true);

    try {
      const result = await leaveHousehold();

      toast({
        title: "Household updated",
        description: result.message || "You have left the household.",
      });

      navigate("/onboarding");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not leave the household.",
        variant: "destructive",
      });
    } finally {
      setIsLeavingHousehold(false);
    }
  };

  const membersWithSelectedMonthIncome = useMemo(() => {
    if (!household) return [];

    // Skapar en lista där varje medlem får ett visningsvärde
    // för inkomsten i den månad som är vald just nu.
    return household.members.map((member) => ({
      ...member,
      displayedIncome: getIncomeForMonth(member, selectedMonth),
    }));
  }, [household, selectedMonth]);

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

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={handleLeaveHousehold}
                  disabled={isLeavingHousehold}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLeavingHousehold ? "Leaving..." : "Leave Household"}
                </Button>
              </div>
            </div>

            <div className="card-elevated p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Monthly income</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a month and update your income for that specific budget period.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[180px_1fr_auto]">
                <div>
                  <label className="input-label">Month</label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Your income for selected month</label>
                  <Input
                    type="number"
                    min={0}
                    value={myIncome}
                    onChange={(e) => setMyIncome(e.target.value)}
                    placeholder="Enter your income"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleSaveIncome}
                    disabled={isSavingIncome}
                    className="w-full lg:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSavingIncome ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">
                  Members ({selectedMonth})
                </h3>
              </div>

              <div className="space-y-3">
                {membersWithSelectedMonthIncome.map((member) => {
                  const isMe =
                    currentUser && String(member.userId) === String(currentUser.id);

                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-xl bg-muted/40 p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {member.name} {isMe ? "(You)" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Income for {selectedMonth}</p>
                        <p className="font-semibold text-foreground">
                          {member.displayedIncome} SEK
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}