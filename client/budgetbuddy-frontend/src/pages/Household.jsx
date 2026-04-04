import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  getCurrentUser,
  getMyHousehold,
  updateMyIncome,
  leaveHousehold,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { HouseholdSetup } from "@/components/household/HouseholdSetup";
import { HouseholdCard } from "@/components/household/HouseholdCard";
import { HouseholdIncomeForm } from "@/components/household/HouseholdIncomeForm";
import { HouseholdMembersList } from "@/components/household/HouseholdMembersList";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getIncomeForMonth(member, month) {
  const history = Array.isArray(member.incomeHistory) ? member.incomeHistory : [];
  const match = history.find((entry) => entry.month === month);

  if (match) {
    return Number(match.amount) || 0;
  }

  return Number(member.monthlyIncome) || 0;
}

export default function Household() {
  const { toast } = useToast();
  const { setUser } = useAuth();

  const [household, setHousehold] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [myIncome, setMyIncome] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [isLeavingHousehold, setIsLeavingHousehold] = useState(false);

  const loadHousehold = async () => {
    setIsLoading(true);

    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setUser(user);

      if (!user?.householdId) {
        setHousehold(null);
        return;
      }

      const data = await getMyHousehold();
      setHousehold(data);

      const me = data.members.find(
        (member) => String(member.userId) === String(user.id)
      );

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

  useEffect(() => {
    loadHousehold();
  }, []);

  useEffect(() => {
    if (!household || !currentUser) return;

    const me = household.members.find(
      (member) => String(member.userId) === String(currentUser.id)
    );

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

      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
      setCurrentUser(updatedUser);

      toast({
        title: "Household updated",
        description: result.message || "You have left the household.",
      });

      setHousehold(null);
      setMyIncome("");
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

    return household.members.map((member) => ({
      ...member,
      displayedIncome: getIncomeForMonth(member, selectedMonth),
    }));
  }, [household, selectedMonth]);

  return (
    <AppLayout>
      <div className="space-y-6 lg:max-w-3xl">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Household
        </h1>

        {isLoading && (
          <div className="card-elevated p-6">
            <p className="text-muted-foreground">Loading household...</p>
          </div>
        )}

        {!isLoading && !household && <HouseholdSetup />}

        {!isLoading && household && (
          <>
            <HouseholdCard
              household={household}
              onCopyId={handleCopyId}
              onLeaveHousehold={handleLeaveHousehold}
              isLeavingHousehold={isLeavingHousehold}
            />

            <HouseholdIncomeForm
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              myIncome={myIncome}
              setMyIncome={setMyIncome}
              onSaveIncome={handleSaveIncome}
              isSavingIncome={isSavingIncome}
            />

            <HouseholdMembersList
              members={membersWithSelectedMonthIncome}
              selectedMonth={selectedMonth}
              currentUser={currentUser}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}