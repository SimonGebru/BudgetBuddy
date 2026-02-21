import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BudgetEditor } from '@/components/budget/BudgetEditor';
import { Button } from '@/components/ui/button';
import { getBudgetSummary, saveBudgetPlan } from '@/services/api';
import { formatMonth } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function EditBudget() {
  const { month } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (month) {
      loadBudget();
    }
  }, [month]);

  const loadBudget = async () => {
    setIsLoading(true);
    try {
      const data = await getBudgetSummary(month);
      setBudget(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load budget data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (categories) => {
    setIsSaving(true);
    try {
      await saveBudgetPlan(month, categories);
      toast({
        title: 'Budget saved!',
        description: 'Your budget plan has been updated.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save budget. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout showNav={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Edit Budget</h1>
            <p className="text-sm text-muted-foreground">{month && formatMonth(month)}</p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-elevated p-4 h-[72px]">
                <div className="flex gap-3">
                  <div className="skeleton-shimmer h-6 w-6" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton-shimmer h-5 w-32" />
                    <div className="skeleton-shimmer h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        {!isLoading && budget && (
          <BudgetEditor
            categories={budget.categories}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
      </div>
    </AppLayout>
  );
}