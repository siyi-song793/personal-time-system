'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode?: 'month' | 'quarter' | 'year';
  onViewModeChange?: (mode: 'month' | 'quarter' | 'year') => void;
}

export function MonthSelector({ 
  currentDate, 
  onDateChange,
  viewMode = 'month',
  onViewModeChange 
}: MonthSelectorProps) {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'quarter') {
      newDate.setMonth(newDate.getMonth() - 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'quarter') {
      newDate.setMonth(newDate.getMonth() + 3);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    onDateChange(newDate);
  };

  const formatTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    if (viewMode === 'month') {
      return `${year}年${String(month).padStart(2, '0')}月`;
    } else if (viewMode === 'quarter') {
      const quarter = Math.ceil(month / 3);
      return `${year}年Q${quarter}`;
    } else {
      return `${year}年`;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold font-serif">{formatTitle()}</h2>
        
        {/* 视图切换 */}
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-muted/50 rounded-full p-0.5">
            {(['month', 'quarter', 'year'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                  viewMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'month' ? '月度' : mode === 'quarter' ? '季度' : '年度'}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
