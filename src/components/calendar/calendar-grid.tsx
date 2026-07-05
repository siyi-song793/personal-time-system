'use client';

import { cn } from '@/lib/utils';
import type { CalendarDay, FirstCategory } from '@/types';
import { getCategoryColor } from '@/types';

interface CalendarGridProps {
  days: CalendarDay[];
  currentMonth: number;
  currentYear: number;
  onDayClick: (date: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarGrid({ days, currentMonth, currentYear, onDayClick }: CalendarGridProps) {
  return (
    <div className="mt-4">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <DayCell
            key={index}
            day={day}
            onClick={() => day.isCurrentMonth && onDayClick(day.date)}
          />
        ))}
      </div>
    </div>
  );
}

interface DayCellProps {
  day: CalendarDay;
  onClick: () => void;
}

function DayCell({ day, onClick }: DayCellProps) {
  // 获取主要分类颜色（取时长最长的分类）
  const getMainCategoryColor = (): string => {
    if (!day.timeRecords.length) return 'transparent';
    
    const categoryMinutes: Record<string, number> = {};
    day.timeRecords.forEach(r => {
      categoryMinutes[r.firstCategory] = (categoryMinutes[r.firstCategory] || 0) + r.duration;
    });
    
    const mainCategory = Object.entries(categoryMinutes)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as FirstCategory;
    
    return getCategoryColor(mainCategory);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative aspect-square flex flex-col items-center justify-center rounded-[var(--radius-standard)] cursor-pointer transition-all',
        'hover:bg-muted/50 active:scale-95',
        !day.isCurrentMonth && 'opacity-30',
        day.isToday && 'bg-primary/10 ring-1 ring-primary/30'
      )}
    >
      {/* 日期数字 */}
      <span className={cn(
        'text-sm font-medium',
        day.isToday && 'text-primary font-bold'
      )}>
        {day.day}
      </span>

      {/* 第一层：时序圆点 - 显示主要分类颜色 */}
      {day.hasTimeRecord && (
        <div 
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: getMainCategoryColor() }}
        />
      )}

      {/* 第二层：习惯底条 - 显示习惯完成状态 */}
      {day.habits && (
        <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
          {day.habits.water.completed && (
            <div className="flex-1 h-[var(--height-habit-bar)] rounded-sm bg-habit-water" />
          )}
          {day.habits.supplements.completed && (
            <div className="flex-1 h-[var(--height-habit-bar)] rounded-sm bg-habit-supplements" />
          )}
          {day.habits.journal.completed && (
            <div className="flex-1 h-[var(--height-habit-bar)] rounded-sm bg-habit-journal" />
          )}
        </div>
      )}

      {/* 第三层：记账角点 - 显示收支状态 */}
      {day.hasAccountRecord && (
        <div className="absolute top-1 left-1 flex gap-0.5">
          {day.accountRecords.some(a => a.type === 'income') && (
            <div className="w-1.5 h-1.5 rounded-full bg-account-income" />
          )}
          {day.accountRecords.some(a => a.type === 'expense') && (
            <div className="w-1.5 h-1.5 rounded-full bg-account-expense" />
          )}
        </div>
      )}
    </div>
  );
}
