'use client';

import { useState, useEffect } from 'react';
import { MonthSelector } from '@/components/calendar/month-selector';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { DayDetailModal } from '@/components/calendar/day-detail-modal';
import { TimeStorage, HabitStorage, AccountStorage } from '@/lib/storage';
import type { TimeRecord, HabitRecord, AccountRecord, CalendarDay, FirstCategory } from '@/types';
import { getCategoryColor, FIRST_CATEGORIES } from '@/types';

type ViewMode = 'month' | 'quarter' | 'year';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [habitRecords, setHabitRecords] = useState<HabitRecord[]>([]);
  const [accountRecords, setAccountRecords] = useState<AccountRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedCategory, setSelectedCategory] = useState<FirstCategory | null>(null);
  const [showReview, setShowReview] = useState(false);

  const loadData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    setTimeRecords(TimeStorage.getByDateRange(startDate, endDate));
    setHabitRecords(HabitStorage.getAll());
    setAccountRecords(AccountStorage.getAll());
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    loadData();
  }, [currentDate, isClient]);

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

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const createCalendarDay = (date: Date, isCurrentMonth: boolean): CalendarDay => {
    const dateStr = formatDate(date);
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

  // 计算月度总时长
  const getMonthlyTotalHours = () => {
    const totalMinutes = timeRecords.reduce((sum, r) => sum + r.duration, 0);
    return Math.round(totalMinutes / 60);
  };

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
      {/* 月份选择器 + 视图切换 */}
      <MonthSelector
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 分类筛选栏 - 单行横向滑动 */}
      <div className="mt-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max pb-2">
          {FIRST_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat 
                  ? 'ring-2 ring-offset-1 ring-offset-background' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ 
                backgroundColor: getCategoryColor(cat) + '20',
                color: getCategoryColor(cat),
                ...(selectedCategory === cat ? { ringColor: getCategoryColor(cat) } : {})
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 专项胶囊 - 独立一行居中 */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors">
          <span>📖</span>
          <span>阅读</span>
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-medium hover:bg-green-500/20 transition-colors">
          <span>🏃‍♂️</span>
          <span>健身</span>
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium hover:bg-blue-500/20 transition-colors">
          <span>💰</span>
          <span>记账</span>
        </button>
      </div>

      {/* 月度统计摘要 */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <span>本月总耗时：<strong className="text-foreground">{getMonthlyTotalHours()}h</strong></span>
      </div>

      {/* 月历网格 - 三层渲染 + 分类筛选 */}
      <div className="mt-4">
        <CalendarGrid
          days={days}
          currentMonth={currentDate.getMonth()}
          currentYear={currentDate.getFullYear()}
          onDayClick={handleDayClick}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* 图例说明 */}
      <div className="mt-4 p-3 bg-muted/30 rounded-[var(--radius-standard)]">
        <div className="text-xs text-muted-foreground mb-2">图例说明</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>时序色点</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 rounded bg-habit-water"></div>
            <span>习惯打卡</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
            <span>记账笔数</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted-foreground/10"></div>
            <span>活跃度</span>
          </div>
        </div>
      </div>

      {/* 复盘面板 - 默认折叠 */}
      <div className="mt-4">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-[var(--radius-standard)] hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-medium">月度复盘</span>
          <span className={`transform transition-transform ${showReview ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showReview && (
          <div className="mt-2 p-4 bg-muted/20 rounded-[var(--radius-standard)]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">总记录时长</div>
                <div className="font-medium">{getMonthlyTotalHours()}h</div>
              </div>
              <div>
                <div className="text-muted-foreground">记录天数</div>
                <div className="font-medium">{timeRecords.filter(r => r.date).length}天</div>
              </div>
              <div>
                <div className="text-muted-foreground">习惯完成</div>
                <div className="font-medium">{habitRecords.filter(h => h.water.completed && h.supplements.completed && h.journal.completed).length}天</div>
              </div>
              <div>
                <div className="text-muted-foreground">记账笔数</div>
                <div className="font-medium">{accountRecords.length}笔</div>
              </div>
            </div>
          </div>
        )}
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
