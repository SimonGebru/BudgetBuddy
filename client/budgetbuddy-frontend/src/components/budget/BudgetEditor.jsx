import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function BudgetEditor({ categories, onSave, isSaving }) {
  // Jag skapar en lokal kopia av kategorierna så att användaren kan redigera fritt i formuläret
  // innan något faktiskt sparas.
  const [items, setItems] = useState(
    categories.map((c, index) => ({
      id: c.id || `existing-${index}`,
      name: c.name,
      amount: c.amount,
    }))
  );

  const addCategory = () => {
    const newCategory = {
      id: `new-${Date.now()}`,
      name: '',
      amount: 0,
    };

    setItems([...items, newCategory]);
  };

  const removeCategory = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateCategory = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Innan save filtreras tomma eller ogiltiga kategorier bort så att bara riktiga poster skickas vidare.
    const validCategories = items.filter(
      (item) => item.name.trim() && item.amount > 0
    );

    onSave(validCategories);
  };

  // Summerar den aktuella budgeten direkt från den lokala staten så att totalen uppdateras live i UI:t.
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'card-elevated p-4 flex items-center gap-3 animate-scale-in'
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />

            <div className="flex-1 grid grid-cols-2 gap-3">
              <Input
                placeholder="Category name"
                value={item.name}
                onChange={(e) => updateCategory(item.id, 'name', e.target.value)}
                className="h-10"
              />
              <Input
                type="number"
                placeholder="Amount"
                value={item.amount || ''}
                onChange={(e) => updateCategory(item.id, 'amount', Number(e.target.value))}
                className="h-10"
                min={0}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeCategory(item.id)}
              className="text-muted-foreground hover:text-destructive flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Category Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addCategory}
        className="w-full h-12 border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Category
      </Button>

      {/* Total & Save */}
      <div className="card-elevated p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total Budget</span>
          <span className="text-xl font-bold text-primary">
            {new Intl.NumberFormat('sv-SE', {
              style: 'currency',
              currency: 'SEK',
              minimumFractionDigits: 0,
            }).format(totalAmount)}
          </span>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No categories added. Saving now will leave this month without a budget plan.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Budget Plan'}
        </Button>
      </div>
    </form>
  );
}