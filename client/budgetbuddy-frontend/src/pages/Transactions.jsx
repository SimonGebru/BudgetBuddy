import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MonthPicker } from "@/components/budget/MonthPicker";
import { useToast } from "@/hooks/use-toast";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "@/services/api";
import { getCurrentMonth } from "@/data/mockData";
import { TransactionsHeader } from "@/components/transactions/TransactionsHeader";
import { TransactionsSummary } from "@/components/transactions/TransactionsSummary";
import { QuickTransactionForm } from "@/components/transactions/QuickTransactionForm";
import { TransactionsList } from "@/components/transactions/TransactionsList";

function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export default function Transactions() {
  const { toast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: getTodayDate(),
    note: "",
  });

  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true);

      try {
        const data = await getTransactions(month);
        setTransactions(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transactions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [month, toast]);

  const handleCreate = async () => {
    setIsSubmitting(true);

    try {
      await createTransaction(form);
      const updatedTransactions = await getTransactions(month);
      setTransactions(updatedTransactions);

      setForm({
        type: "expense",
        amount: "",
        category: "",
        date: getTodayDate(),
        note: "",
      });

      toast({
        title: "Transaction added",
        description: "Your transaction has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeletingId(id);

    try {
      await deleteTransaction(id);
      const updatedTransactions = await getTransactions(month);
      setTransactions(updatedTransactions);

      toast({
        title: "Transaction deleted",
        description: "The entry has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 lg:max-w-4xl">
        <TransactionsHeader />

        <MonthPicker month={month} onChange={setMonth} />

        <TransactionsSummary transactions={transactions} />

        <QuickTransactionForm
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
        />

        {isLoading ? (
          <div className="card-elevated p-6">
            <p className="text-sm text-muted-foreground">
              Loading transactions...
            </p>
          </div>
        ) : (
          <TransactionsList
            transactions={transactions}
            onDelete={handleDelete}
            isDeletingId={isDeletingId}
          />
        )}
      </div>
    </AppLayout>
  );
}