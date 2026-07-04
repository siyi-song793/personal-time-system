'use client';

import { Button } from '@/components/ui/button';

interface MonthSelectorProps {
  monthName: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

// 图标组件
function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

export function MonthSelector({ monthName, onPrev, onNext, onToday }: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          aria-label="上个月"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          aria-label="下个月"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
      >
        回到今天
      </Button>
    </div>
  );
}