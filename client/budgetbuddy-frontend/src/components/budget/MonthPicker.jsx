import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMonth } from '@/data/mockData';

export function MonthPicker({ month, onChange }) {

  const navigateMonth = (direction) => {
    // month kommer in i formatet "YYYY-MM"
    const [year, monthNum] = month.split('-').map(Number);

    // Skapar ett Date-objekt så att vi enkelt kan flytta fram eller bak en månad.
    const date = new Date(year, monthNum - 1);

    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    // Konverterar tillbaka till samma format som resten av appen använder: YYYY-MM
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Skickar upp nya månaden till parent-komponenten.
    onChange(newMonth);
  };

  return (
    <div className="flex items-center justify-between bg-card rounded-xl p-2 shadow-sm border border-border/50">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigateMonth('prev')}
        className="text-muted-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Visar aktuell månad i ett mer läsbart format */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-semibold text-foreground">
          {formatMonth(month)}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigateMonth('next')}
        className="text-muted-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}