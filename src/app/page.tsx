'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/components/providers/data-provider';
import { ProgressCards } from '@/components/progress/progress-cards';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { MonthSelector } from '@/components/calendar/month-selector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CalendarPage() {
  const { 
    timeRecords, 
    habits, 
    accountRecords, 
    currentDate,
    initTodayHabits 
  } = useData();
  
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    month: number;
  }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // 初始化今日习惯
  useEffect(() => {
    initTodayHabits(currentDate);
  }, [currentDate, initTodayHabits]);

  // 计算月历数据（三层渲染）
  const calendarData = useMemo(() => {
    const year = selectedMonth.year;
    const month = selectedMonth.month;
    
    // 获取该月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // 获取该月第一天是周几（0=周日）
    const startWeekday = firstDay.getDay();
    
    // 定义日历格子类型
    type CalendarDay = {
      type: 'empty';
      date: null;
    } | {
      type: 'day';
      date: string;
      day: number;
      hasTimeRecord: boolean;
      hasHabitCompleted: boolean;
      habitPartial: boolean;
      hasAccountRecord: boolean;
      hasIncome: boolean;
      timeRecords: typeof timeRecords;
      habits: typeof habits;
      accountRecords: typeof accountRecords;
    };
    
    // 生成日历格子数据
    const days: CalendarDay[] = [];
    
    // 前置空白格子
    for (let i = 0; i < startWeekday; i++) {
      days.push({ type: 'empty' as const, date: null });
    }
    
    // 实际日期格子
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // 查找该日期的数据
      const dayTimeRecords = timeRecords.filter(r => r.date === dateStr);
      const dayHabits = habits.filter(h => h.date === dateStr);
      const dayAccounts = accountRecords.filter(a => a.date === dateStr);
      
      // 三层渲染标记
      const hasTimeRecord = dayTimeRecords.length > 0;
      const habitCompletedCount = dayHabits.filter(h => h.isCompleted).length;
      const hasHabitCompleted = habitCompletedCount > 0;
      const habitPartial = habitCompletedCount > 0 && habitCompletedCount < 3;
      const hasAccountRecord = dayAccounts.length > 0;
      const hasIncome = dayAccounts.some(a => a.type === 'income');
      
      days.push({
        type: 'day' as const,
        date: dateStr,
        day,
        hasTimeRecord,
        hasHabitCompleted,
        habitPartial,
        hasAccountRecord,
        hasIncome,
        timeRecords: dayTimeRecords,
        habits: dayHabits,
        accountRecords: dayAccounts,
      });
    }
    
    return days;
  }, [selectedMonth, timeRecords, habits, accountRecords]);

  // 切换月份
  const goToPrevMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const goToToday = () => {
    const now = new Date();
    setSelectedMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  const monthName = `${selectedMonth.year}年${selectedMonth.month + 1}月`;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        {/* 页面标题 */}
        <header className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl text-foreground">
            {monthName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            月历概览 · 三层渲染（时序圆点 · 习惯底条 · 记账角点）
          </p>
        </header>

        {/* 四维进度卡片 */}
        <ProgressCards />

        {/* 月份选择器 */}
        <MonthSelector
          monthName={monthName}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
          onToday={goToToday}
        />

        {/* 月历网格 */}
        <CalendarGrid 
          days={calendarData}
          selectedMonth={selectedMonth}
        />

        {/* 说明卡片 */}
        <Card className="mt-6 p-4">
          <h3 className="text-sm font-medium text-foreground mb-2">月历标记说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--calendar-dot)]" />
              <span>左上圆点：有时间记录</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-full h-1 rounded bg-[var(--calendar-bar)]" />
              <span>底部底条：习惯完成</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-tl-none rounded-tr rounded-bl rounded-br bg-[var(--calendar-corner)]" />
              <span>右上角点：有记账</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}