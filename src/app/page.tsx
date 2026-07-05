'use client';

import { useState, useEffect } from 'react';
import { MonthSelector } from '@/components/calendar/month-selector';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { DayDetailModal } from '@/components/calendar/day-detail-modal';
import { ProgressCards } from '@/components/progress/progress-cards';
import { TimeStorage, HabitStorage, AccountStorage, PlanStorage } from '@/lib/storage';
import type { TimeRecord, HabitRecord, AccountRecord, CalendarDay, FirstCategory } from '@/types';
import { getCategoryColor } from '@/types';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [habitRecords, setHabitRecords] = useState<HabitRecord[]>([]);
  const [accountRecords, setAccountRecords] = useState<AccountRecord[]>([]);
  const [progress, setProgress] = useState({ year: 0, month: 0, week: 0, day: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    loadData();
  }, [currentDate, isClient]);

  const loadData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    setTimeRecords(TimeStorage.getByDateRange(startDate, endDate));
    setHabitRecords(HabitStorage.getAll());
    setAccountRecords(AccountStorage.getAll());
    setProgress(PlanStorage.getProgress());
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    // 填充月初空白
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(createCalendarDay(d, false));
    }

    // 填充当月日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(createCalendarDay(d, true));
    }

    // 填充月末空白至42天（6行）
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(createCalendarDay(d, false));
    }

    return days;
  };

  const createCalendarDay = (date: Date, isCurrentMonth: boolean): CalendarDay => {
    const dateStr = date.toISOString().split('T')[0];
    const dayRecords = timeRecords.filter(r => r.date === dateStr);
    const dayHabits = habitRecords.find(r => r.date === dateStr) || null;
    const dayAccounts = accountRecords.filter(r => r.date === dateStr);

    return {
      date: dateStr,
      day: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === new Date().toISOString().split('T')[0],
      hasTimeRecord: dayRecords.length > 0,
      hasHabitCompleted: dayHabits ? (
        dayHabits.water.completed && 
        dayHabits.supplements.completed && 
        dayHabits.journal.completed
      ) : false,
      habitPartial: dayHabits ? (
        [dayHabits.water.completed, dayHabits.supplements.completed, dayHabits.journal.completed]
          .filter(Boolean).length > 0 &&
        !(dayHabits.water.completed && dayHabits.supplements.completed && dayHabits.journal.completed)
      ) : false,
      hasAccountRecord: dayAccounts.length > 0,
      hasIncome: dayAccounts.some(a => a.type === 'income'),
      timeRecords: dayRecords,
      habits: dayHabits,
      accountRecords: dayAccounts
    };
  };

  const days = isClient ? getDaysInMonth(currentDate) : [];

  // 月历是只读视图，点击日期打开详情弹窗查看
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      {/* 月份选择器 */}
      <MonthSelector
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* 四维进度卡片 */}
      <ProgressCards progress={progress} />

      {/* 月历网格 - 三层渲染 */}
      <CalendarGrid
        days={days}
        currentMonth={currentDate.getMonth()}
        currentYear={currentDate.getFullYear()}
        onDayClick={handleDayClick}
      />

      {/* 图例说明 */}
      <div className="mt-4 p-3 bg-muted/30 rounded-[var(--radius-standard)]">
        <div className="text-xs text-muted-foreground mb-2">图例说明</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>时间记录</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 rounded bg-habit-water"></div>
            <span>习惯完成</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-account-income"></div>
            <span>收入</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-account-expense"></div>
            <span>支出</span>
          </div>
        </div>
      </div>

      {/* 分类色卡 */}
      <div className="mt-4 p-3 bg-muted/30 rounded-[var(--radius-standard)]">
        <div className="text-xs text-muted-foreground mb-2">行为分类</div>
        <div className="flex flex-wrap gap-2">
          {(['学习成长', '工作事务', '运动健康', '休息娱乐', '外出出行', '生活日常', '其他'] as FirstCategory[]).map(cat => (
            <div 
              key={cat}
              className="flex items-center gap-1 text-xs"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              ></div>
              <span className="text-foreground/70">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 日期详情弹窗 - 只读查看 */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          timeRecords={timeRecords.filter(r => r.date === selectedDate)}
          habits={habitRecords.find(r => r.date === selectedDate) || null}
          accountRecords={accountRecords.filter(r => r.date === selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
