'use client';

import { cn } from '@/lib/utils';
import { PlanLevel } from '@/types';

interface LevelProgressCardProps {
  level: PlanLevel;
  label: string;
  completed: number;
  total: number;
  isSelected: boolean;
  onClick: () => void;
}

export function LevelProgressCard({
  level,
  label,
  completed,
  total,
  isSelected,
  onClick,
}: LevelProgressCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-[var(--radius-standard)] transition-all',
        'shadow-[var(--shadow-sm)]',
        isSelected
          ? 'bg-primary/10 border-2 border-primary'
          : 'bg-card border-2 border-transparent hover:bg-muted/30'
      )}
    >
      <span className={cn(
        'text-xs mb-1',
        isSelected ? 'text-primary font-medium' : 'text-muted-foreground'
      )}>
        {label}
      </span>
      <span className={cn(
        'text-sm font-medium',
        isSelected ? 'text-primary' : 'text-foreground'
      )}>
        {completed}/{total}
      </span>
    </button>
  );
}

interface FourGridProgressCardsProps {
  selectedLevel: PlanLevel;
  onLevelChange: (level: PlanLevel) => void;
  yearProgress: { completed: number; total: number };
  monthProgress: { completed: number; total: number };
  weekProgress: { completed: number; total: number };
  todayProgress: { completed: number; total: number };
}

export function FourGridProgressCards({
  selectedLevel,
  onLevelChange,
  yearProgress,
  monthProgress,
  weekProgress,
  todayProgress,
}: FourGridProgressCardsProps) {
  const levels: { level: PlanLevel; label: string; progress: { completed: number; total: number } }[] = [
    { level: 'year', label: '年度', progress: yearProgress },
    { level: 'month', label: '月度', progress: monthProgress },
    { level: 'week', label: '周', progress: weekProgress },
    { level: 'today', label: '今日', progress: todayProgress },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {levels.map(({ level, label, progress }) => (
        <LevelProgressCard
          key={level}
          level={level}
          label={label}
          completed={progress.completed}
          total={progress.total}
          isSelected={selectedLevel === level}
          onClick={() => onLevelChange(level)}
        />
      ))}
    </div>
  );
}
