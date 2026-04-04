import { useEffect, useState } from "react";
import { createHousehold, joinHousehold, getCurrentUser } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { HouseholdChoice } from "@/components/household/HouseholdChoice";
import { CreateHouseholdForm } from "@/components/household/CreateHouseholdForm";
import { JoinHouseholdForm } from "@/components/household/JoinHouseholdForm";
import { HouseholdSuccess } from "@/components/household/HouseholdSuccess";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function HouseholdSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const [step, setStep] = useState("choice");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const [householdName, setHouseholdName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [householdId, setHouseholdId] = useState("");
  const [joinIncome, setJoinIncome] = useState("");

  const [createdHouseholdId, setCreatedHouseholdId] = useState("");
  const [successType, setSuccessType] = useState("created");

  const currentMonth = getCurrentMonth();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();

        if (user?.householdId) {
          setUser(user);
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        // Om kontrollen misslyckas låter vi användaren stanna kvar på sidan.
      } finally {
        setIsCheckingUser(false);
      }
    };

    checkUser();
  }, [navigate, setUser]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!householdName || !monthlyIncome) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createHousehold(householdName, Number(monthlyIncome));

      const updatedUser = await getCurrentUser();
      setUser(updatedUser);

      setCreatedHouseholdId(result.id);
      setSuccessType("created");
      setStep("success");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!householdId || !joinIncome) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await joinHousehold(householdId, Number(joinIncome));

      const updatedUser = await getCurrentUser();
      setUser(updatedUser);

      setSuccessType("joined");
      setStep("success");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join household. Check the ID and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyHouseholdId = () => {
    navigator.clipboard.writeText(createdHouseholdId);

    toast({
      title: "Copied!",
      description: "Household ID copied to clipboard.",
    });
  };

  if (isCheckingUser) {
    return (
      <div className="card-elevated p-6 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (step === "choice") {
    return (
      <HouseholdChoice
        onSelectCreate={() => setStep("create")}
        onSelectJoin={() => setStep("join")}
      />
    );
  }

  if (step === "create") {
    return (
      <CreateHouseholdForm
        householdName={householdName}
        setHouseholdName={setHouseholdName}
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        isLoading={isLoading}
        onBack={() => setStep("choice")}
        onSubmit={handleCreate}
      />
    );
  }

  if (step === "join") {
    return (
      <JoinHouseholdForm
        householdId={householdId}
        setHouseholdId={setHouseholdId}
        joinIncome={joinIncome}
        setJoinIncome={setJoinIncome}
        isLoading={isLoading}
        onBack={() => setStep("choice")}
        onSubmit={handleJoin}
      />
    );
  }

  return (
    <HouseholdSuccess
      successType={successType}
      createdHouseholdId={createdHouseholdId}
      currentMonth={currentMonth}
      onCopyHouseholdId={copyHouseholdId}
    />
  );
}