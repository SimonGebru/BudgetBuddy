import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  getPersonalBudget,
  savePersonalBudget,
  duplicatePersonalBudget,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { PersonalBudgetEditHeader } from "@/components/personal-budget/PersonalBudgetEditHeader";
import { PersonalBudgetSummary } from "@/components/personal-budget/PersonalBudgetSummary";
import { PersonalBudgetItemsSection } from "@/components/personal-budget/PersonalBudgetItemsSection";

function createEmptyRow() {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: "",
  };
}

export default function EditMyBudget() {
  const navigate = useNavigate();
  const { month } = useParams();
  const { toast } = useToast();

  const [incomes, setIncomes] = useState([createEmptyRow()]);
  const [expenses, setExpenses] = useState([createEmptyRow()]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const loadBudget = async () => {
    setIsLoading(true);

    try {
      const data = await getPersonalBudget(month);

      setIncomes(
        data.incomes?.length
          ? data.incomes.map((item) => ({
              id: item.id || crypto.randomUUID(),
              name: item.name,
              amount: String(item.amount),
            }))
          : [createEmptyRow()]
      );

      setExpenses(
        data.expenses?.length
          ? data.expenses.map((item) => ({
              id: item.id || crypto.randomUUID(),
              name: item.name,
              amount: String(item.amount),
            }))
          : [createEmptyRow()]
      );
    } catch (error) {
      setIncomes([createEmptyRow()]);
      setExpenses([createEmptyRow()]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [month]);

  const updateItem = (items, setItems, id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = (items, setItems) => {
    setItems([...items, createEmptyRow()]);
  };

  const removeItem = (items, setItems, id) => {
    const filtered = items.filter((item) => item.id !== id);
    setItems(filtered.length ? filtered : [createEmptyRow()]);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const cleanedIncomes = incomes
        .map((item) => ({
          name: item.name.trim(),
          amount: Number(item.amount),
        }))
        .filter(
          (item) =>
            item.name.length > 0 &&
            Number.isFinite(item.amount) &&
            item.amount >= 0
        );

      const cleanedExpenses = expenses
        .map((item) => ({
          name: item.name.trim(),
          amount: Number(item.amount),
        }))
        .filter(
          (item) =>
            item.name.length > 0 &&
            Number.isFinite(item.amount) &&
            item.amount >= 0
        );

      await savePersonalBudget(month, cleanedIncomes, cleanedExpenses);

      toast({
        title: "Personal budget saved",
        description: `Your budget for ${month} has been updated.`,
      });

      navigate("/my-budget");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save personal budget.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);

    try {
      await duplicatePersonalBudget(month);

      toast({
        title: "Budget copied",
        description: "Previous month has been copied.",
      });

      await loadBudget();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not duplicate budget.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const totalIncome = incomes.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const remaining = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Edit My Budget
          </h1>
          <div className="card-elevated p-6">
            <p className="text-muted-foreground">Loading budget...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 lg:max-w-4xl">
        <PersonalBudgetEditHeader
          month={month}
          onBack={() => navigate(-1)}
          onDuplicate={handleDuplicate}
          isDuplicating={isDuplicating}
        />

        <PersonalBudgetSummary
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          remaining={remaining}
        />

        <PersonalBudgetItemsSection
          title="Incomes"
          addLabel="Add income"
          items={incomes}
          setItems={setIncomes}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          namePlaceholder="Income name"
        />

        <PersonalBudgetItemsSection
          title="Expenses"
          addLabel="Add expense"
          items={expenses}
          setItems={setExpenses}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          namePlaceholder="Expense name"
        />

        <Button
          onClick={handleSave}
          size="lg"
          className="w-full"
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Personal Budget"}
        </Button>
      </div>
    </AppLayout>
  );
}