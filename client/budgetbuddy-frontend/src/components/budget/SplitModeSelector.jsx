import { useState } from 'react';
import { Scale, Percent, Crown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

const modes = [
  { value: 'income', label: 'Income', icon: Scale },
  { value: '50-50', label: '50/50', icon: Percent },
  { value: 'top-earner', label: 'Top +%', icon: Crown },
];

export function SplitModeSelector({ split, onChange }) {
  const [percentMore, setPercentMore] = useState(split.percentMore);

  const handleModeChange = (mode) => {
    onChange({ ...split, mode });
  };

  const handlePercentChange = (values) => {
    const newPercent = values[0];
    setPercentMore(newPercent);
    onChange({ ...split, percentMore: newPercent });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <h3 className="section-title mb-0">Split Mode</h3>
      </div>
      
      {/* Segmented Control */}
      <div className="flex bg-muted p-1 rounded-xl gap-1 lg:max-w-md">
        {modes.map(({ value, label, icon: Icon }) => {
          const isActive = split.mode === value;
          return (
            <button
              key={value}
              onClick={() => handleModeChange(value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 lg:py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Description */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg lg:max-w-lg">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          {split.mode === 'income' && 'Each person pays proportionally to their income.'}
          {split.mode === '50-50' && 'Both pay exactly 50% of all expenses.'}
          {split.mode === 'top-earner' && `The higher earner pays ${percentMore}% more than their income share.`}
        </p>
      </div>

      {/* Top Earner Slider */}
      {split.mode === 'top-earner' && (
        <div className="card-elevated p-4 space-y-4 lg:max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Extra percentage</span>
            <span className="text-lg font-bold text-primary">+{percentMore}%</span>
          </div>
          <Slider
            value={[percentMore]}
            onValueChange={handlePercentChange}
            min={0}
            max={100}
            step={5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
}