import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function EmptyBudget({ month }) {
  return (
    <div className="card-elevated p-8 text-center animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No budget plan yet</h3>
      <p className="text-muted-foreground mb-6">
        Create a budget plan for this month to start tracking your shared expenses.
      </p>
      <Button asChild size="lg">
        <Link to={`/budget/${month}/edit`}>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget Plan
        </Link>
      </Button>
    </div>
  );
}