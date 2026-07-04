'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { DayDetailModal } from '@/components/calendar/day-detail-modal';
import type { CalendarDayData } from '@/types';

interface CalendarGridProps {
  days: Array<{
    type: 'empty' | 'day';
    date: string | null;
    day?: number;
    hasTimeRecord?: boolean;
    hasHabitCompleted?: boolean;
    habitPartial?: boolean;
    hasAccountRecord?: boolean;
    hasIncome?: boolean;
    timeRecords?: CalendarDayData['timeRecords'];
    habits?: CalendarDayData['habits'];
    accountRecords?: CalendarDayData['accountRecords'];
  }>;
  selectedMonth: { year: number; month: number };
}

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarGrid({ days, selectedMonth }: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const handleDayClick = (dayData: typeof days[number]) => {
    if (dayData.type === 'day' && dayData.date) {
      setSelectedDay({
        date: dayData.date,
        timeRecords: dayData.timeRecords || [],
        habits: dayData.habits || [],
        accountRecords: dayData.accountRecords || [],
        hasTimeRecord: dayData.hasTimeRecord || false,
        hasHabitCompleted: dayData.hasHabitCompleted || false,
        hasAccountRecord: dayData.hasAccountRecord || false,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* 星期头部 */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`text-center py-2 text-xs font-medium ${
                index === 0 || index === 6
                  ? 'text-[var(--cinnabar-red)]'
                  : 'text-muted-foreground'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7">
          {days.map((dayData, index) => {
            if (dayData.type === 'empty') {
              return (
                <div
                  key={`empty-${index}`}
                  className="calendar-day bg-muted/30"
                />
              );
            }

            const isToday = dayData.date === todayStr;
            const dayOfWeek = new Date(dayData.date!).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <button
                key={dayData.date!}
                onClick={() => handleDayClick(dayData)}
                className={`calendar-day clickable relative flex flex-col items-center justify-center border-b border-r border-border/50 last:border-r-0 ${
                  isToday
                    ? 'bg-accent/50 ring-2 ring-[var(--ink-blue)] ring-inset'
                    : 'bg-background hover:bg-muted/30'
                }`}
              >
                {/* 日期数字 */}
                <span
                  className={`text-sm font-mono ${
                    isToday
                      ? 'text-[var(--ink-blue)] font-bold'
                      : isWeekend
                        ? 'text-[var(--cinnabar-red)]'
                        : 'text-foreground'
                  }`}
                >
                  {dayData.day}
                </span>

                {/* 三层渲染标记 */}
                {/* 时序圆点 - 左上角 */}
                {dayData.hasTimeRecord && (
                  <span className="calendar-dot" />
                )}

                {/* 习惯底条 - 底部 */}
                {dayData.hasHabitCompleted && (
                  <span
                    className={`calendar-habit-bar ${
                      dayData.habitPartial ? 'partial' : ''
                    }`}
                    style={{
                      width: dayData.habitPartial ? '50%' : undefined,
                    }}
                  />
                )}

                {/* 记账角点 - 右上角 */}
                {dayData.hasAccountRecord && (
                  <span
                    className={`calendar-corner ${
                      dayData.hasIncome ? 'income' : ''
                    }`}
                    style={{
                      backgroundColor: dayData.hasIncome
                        ? 'var(--income-mint)'
                        : undefined,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 日期详情弹窗 */}
      <DayDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dayData={selectedDay}
      />
    </>
  );
}