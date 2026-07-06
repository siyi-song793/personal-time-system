'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import type { CalendarDay, FirstCategory } from '@/types';
import { getCategoryColor } from '@/types';

interface CalendarGridProps {
  days: CalendarDay[];
  currentMonth: number;
  currentYear: number;
  onDayClick: (date: string) => void;
  onDayLongPress?: (date: string) => void;
  selectedCategory?: FirstCategory | null;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function CalendarGrid({ 
  days, 
  currentMonth,
  currentYear,
  onDayClick,
  onDayLongPress,
  selectedCategory
}: CalendarGridProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // 计算日期的活跃度（基于时间记录时长）
  const getActivityLevel = (day: CalendarDay): number => {
    if (!day.timeRecords || day.timeRecords.length === 0) return 0;
    const totalMinutes = day.timeRecords.reduce((sum, r) => sum + r.duration, 0);
    // 0-60min: 1, 60-120min: 2, 120-240min: 3, 240min+: 4
    if (totalMinutes >= 240) return 4;
    if (totalMinutes >= 120) return 3;
    if (totalMinutes >= 60) return 2;
    if (totalMinutes > 0) return 1;
    return 0;
  };

  // 获取日期的主要分类色点
  const getCategoryDots = (day: CalendarDay): string[] => {
    if (!day.timeRecords || day.timeRecords.length === 0) return [];
    
    // 如果选择了分类筛选，只显示该分类
    if (selectedCategory) {
      const hasCategory = day.timeRecords.some(r => r.firstCategory === selectedCategory);
      return hasCategory ? [getCategoryColor(selectedCategory)] : [];
    }
    
    // 获取所有出现的分类（去重，最多显示3个）
    const categories = [...new Set(day.timeRecords.map(r => r.firstCategory))].slice(0, 3);
    return categories.map(cat => getCategoryColor(cat));
  };

  // 获取记账笔数
  const getAccountCount = (day: CalendarDay): number => {
    return day.accountRecords?.length || 0;
  };

  // 判断是否应该灰度显示（分类筛选时）
  const isDimmed = (day: CalendarDay): boolean => {
    if (!selectedCategory) return false;
    if (!day.timeRecords || day.timeRecords.length === 0) return true;
    return !day.timeRecords.some(r => r.firstCategory === selectedCategory);
  };

  return (
    <div className="bg-card rounded-[var(--radius-standard)] p-3 shadow-[var(--shadow-sm)]">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const activityLevel = getActivityLevel(day);
          const categoryDots = getCategoryDots(day);
          const accountCount = getAccountCount(day);
          const dimmed = isDimmed(day);
          
          // 活跃度背景色
          const activityBg = activityLevel > 0 
            ? `bg-muted-foreground/${activityLevel * 3 + 2}` 
            : '';

          return (
            <button
              key={index}
              onClick={() => {
                if (!isLongPress.current && day.date) {
                  onDayClick(day.date);
                }
                isLongPress.current = false;
              }}
              onMouseDown={() => {
                if (day.date && onDayLongPress) {
                  isLongPress.current = false;
                  longPressTimer.current = setTimeout(() => {
                    isLongPress.current = true;
                    onDayLongPress(day.date!);
                  }, 500);
                }
              }}
              onMouseUp={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
              onMouseLeave={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
              onTouchStart={() => {
                if (day.date && onDayLongPress) {
                  isLongPress.current = false;
                  longPressTimer.current = setTimeout(() => {
                    isLongPress.current = true;
                    onDayLongPress(day.date!);
                  }, 500);
                }
              }}
              onTouchEnd={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
              disabled={!day.isCurrentMonth}
              className={cn(
                'relative aspect-square rounded-[var(--radius-small)] flex flex-col items-center justify-center gap-0.5 transition-all',
                day.isCurrentMonth 
                  ? 'hover:bg-accent cursor-pointer' 
                  : 'opacity-30 cursor-default',
                day.isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                activityBg,
                dimmed && 'opacity-40'
              )}
            >
              {/* 分类色点 - 顶部 */}
              {categoryDots.length > 0 && (
                <div className="flex items-center gap-0.5 absolute top-0.5 left-1/2 -translate-x-1/2">
                  {categoryDots.map((color, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}

              {/* 日期数字 */}
              <span className={cn(
                'text-xs font-medium',
                day.isToday ? 'text-primary' : 'text-foreground',
                !day.isCurrentMonth && 'text-muted-foreground'
              )}>
                {day.day}
              </span>

              {/* 习惯打卡条 - 中间 */}
              {day.hasHabitCompleted && (
                <div className="w-3/4 h-[2px] rounded-full bg-habit-water" />
              )}
              {day.habitPartial && !day.hasHabitCompleted && (
                <div className="w-1/2 h-[2px] rounded-full bg-habit-water/50" />
              )}

              {/* 记账标记 - 右下角 */}
              {accountCount > 0 && (
                <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  {accountCount > 0 && (
                    <span className="text-[8px] text-muted-foreground/70">{accountCount}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
