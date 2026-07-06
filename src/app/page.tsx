'use client';

import { useState, useEffect, useRef } from 'react';
import { MonthSelector } from '@/components/calendar/month-selector';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { DayDetailModal } from '@/components/calendar/day-detail-modal';
import { MonthlyAccountModal } from '@/components/modals/monthly-account-modal';
import { MonthlyBookModal } from '@/components/modals/monthly-book-modal';
import { MonthlyFitnessModal } from '@/components/modals/monthly-fitness-modal';
import { AccountRecordModal } from '@/components/modals/account-record-modal';
import { TimeStorage, HabitStorage, AccountStorage, BookStorage, FitnessStorage } from '@/lib/storage';
import type { TimeRecord, HabitRecord, AccountRecord, BookRecord, FitnessRecord, CalendarDay, FirstCategory } from '@/types';
import { getCategoryColor, FIRST_CATEGORIES } from '@/types';

type ViewMode = 'month' | 'quarter' | 'year';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [habitRecords, setHabitRecords] = useState<HabitRecord[]>([]);
  const [accountRecords, setAccountRecords] = useState<AccountRecord[]>([]);
  const [bookRecords, setBookRecords] = useState<BookRecord[]>([]);
  const [fitnessRecords, setFitnessRecords] = useState<FitnessRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedCategory, setSelectedCategory] = useState<FirstCategory | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showMonthlyAccount, setShowMonthlyAccount] = useState(false);
  const [showMonthlyBook, setShowMonthlyBook] = useState(false);
  const [showMonthlyFitness, setShowMonthlyFitness] = useState(false);
  const [longPressDate, setLongPressDate] = useState<string | null>(null);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountModalDate, setAccountModalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const loadData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    setTimeRecords(TimeStorage.getByDateRange(startDate, endDate));
    setHabitRecords(HabitStorage.getAll());
    setAccountRecords(AccountStorage.getAll());
    setBookRecords(BookStorage.getAll());
    setFitnessRecords(FitnessStorage.getAll());
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

  const days = getDaysInMonth(currentDate);

  // 计算月度总时长
  const getMonthlyTotalHours = () => {
    const totalMinutes = timeRecords.reduce((sum, r) => sum + r.duration, 0);
    return Math.round(totalMinutes / 60);
  };

  // 月历是只读视图，点击日期打开详情弹窗查看
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      {/* 月份选择器 + 视图切换 */}
      <MonthSelector
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 筛选 + 胶囊统一单行区域 */}
      <div className="mt-4 flex items-center gap-3">
        {/* 左侧：一级分类筛选（可滚动） */}
        <div className="flex-1 overflow-x-auto scrollbar-hide min-w-0">
          <div className="flex items-center gap-2 min-w-max">
            {FIRST_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedCategory === cat 
                    ? 'ring-2 ring-offset-1 ring-offset-background border-transparent' 
                    : 'border-border/50 opacity-70 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: getCategoryColor(cat) + '15',
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

        {/* 右侧：专项胶囊（固定3个） */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setShowMonthlyBook(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-reading/15 text-reading rounded-full text-xs font-medium hover:bg-reading/25 transition-colors"
          >
            <span>📖</span>
            <span>阅读</span>
          </button>
          <button 
            onClick={() => setShowMonthlyFitness(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-fitness/15 text-fitness rounded-full text-xs font-medium hover:bg-fitness/25 transition-colors"
          >
            <span>🏃‍♂️</span>
            <span>健身</span>
          </button>
          <button 
            onClick={() => setShowMonthlyAccount(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium hover:bg-blue-500/25 transition-colors"
          >
            <span>💰</span>
            <span>记账</span>
          </button>
        </div>
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
          onDayLongPress={(date) => {
            setLongPressDate(date);
            setShowLongPressMenu(true);
          }}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* 长按菜单 */}
      {showLongPressMenu && longPressDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLongPressMenu(false)}>
          <div className="bg-card rounded-[var(--radius-standard)] p-4 shadow-lg min-w-[200px]" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-medium mb-3 text-center">{longPressDate}</div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowLongPressMenu(false);
                  setSelectedDate(longPressDate);
                }}
                className="w-full py-2 px-4 text-sm text-left rounded-[var(--radius-small)] hover:bg-accent transition-colors"
              >
                查看当日详情
              </button>
              <button
                onClick={() => {
                  setShowLongPressMenu(false);
                  setAccountModalDate(longPressDate);
                  setShowAccountModal(true);
                }}
                className="w-full py-2 px-4 text-sm text-left rounded-[var(--radius-small)] hover:bg-accent transition-colors"
              >
                新增当日记账
              </button>
            </div>
          </div>
        </div>
      )}

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
          bookRecords={bookRecords.filter(r => r.date === selectedDate)}
          fitnessRecords={fitnessRecords.filter(r => r.date === selectedDate)}
          onClose={() => setSelectedDate(null)}
          onAddAccount={() => {
            setAccountModalDate(selectedDate);
            setShowAccountModal(true);
            setSelectedDate(null);
          }}
        />
      )}

      {/* 月度记账汇总弹窗 */}
      <MonthlyAccountModal
        open={showMonthlyAccount}
        onOpenChange={setShowMonthlyAccount}
        records={accountRecords}
        currentMonth={currentDate}
        onRecordClick={(date) => setSelectedDate(date)}
      />

      {/* 月度阅读汇总弹窗 */}
      <MonthlyBookModal
        open={showMonthlyBook}
        onOpenChange={setShowMonthlyBook}
        records={bookRecords}
        currentMonth={currentDate}
        onRecordClick={(date) => setSelectedDate(date)}
      />

      {/* 月度健身汇总弹窗 */}
      <MonthlyFitnessModal
        open={showMonthlyFitness}
        onOpenChange={setShowMonthlyFitness}
        records={fitnessRecords}
        currentMonth={currentDate}
        onRecordClick={(date) => setSelectedDate(date)}
      />

      {/* 新增记账弹窗 */}
      {showAccountModal && (
        <AccountRecordModal
          onClose={() => setShowAccountModal(false)}
          onSaved={() => {
            setShowAccountModal(false);
            loadData();
          }}
          initialDate={accountModalDate}
        />
      )}
    </div>
  );
}
