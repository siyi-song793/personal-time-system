'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useData } from '@/components/providers/data-provider';

interface ProgressCardProps {
  title: string;
  period: string;
  progress: number;
  color: string;
  stats: Array<{ label: string; value: string | number }>;
}

function ProgressCard({ title, period, progress, color, stats }: ProgressCardProps) {
  return (
    <Card className="progress-card p-4 animate-scale-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{period}</span>
      </div>
      
      <div className="progress-bar mb-3">
        <div
          className="progress-fill animate-progress-fill"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, index) => (
          <div key={index} className="text-xs">
            <span className="text-muted-foreground">{stat.label}:</span>
            <span className="font-mono ml-1">{stat.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ProgressCards() {
  const { 
    timeRecords, 
    habits, 
    bookRecords, 
    fitnessRecords, 
    accountRecords,
    currentDate 
  } = useData();

  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // 获取周一（周进度）
    const getMonday = (d: Date) => {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };
    
    const weekStart = getMonday(new Date(now));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // 年度统计
    const yearTimeRecords = timeRecords.filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === currentYear;
    });
    const yearHabits = habits.filter(h => {
      const d = new Date(h.date);
      return d.getFullYear() === currentYear && h.isCompleted;
    });
    const yearBooks = bookRecords.filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === currentYear;
    });
    const yearFitness = fitnessRecords.filter(f => {
      const d = new Date(f.date);
      return d.getFullYear() === currentYear;
    });
    const yearAccounts = accountRecords.filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === currentYear;
    });
    const yearIncome = yearAccounts.filter(a => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
    const yearExpense = yearAccounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    const yearSavings = yearIncome - yearExpense;

    // 月度统计
    const monthTimeRecords = timeRecords.filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const monthHabits = habits.filter(h => {
      const d = new Date(h.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const monthCompletedHabits = monthHabits.filter(h => h.isCompleted).length;
    const monthHabitRate = monthHabits.length > 0
      ? Math.round((monthCompletedHabits / monthHabits.length) * 100)
      : 0;
    const monthBooks = bookRecords.filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const monthFitness = fitnessRecords.filter(f => {
      const d = new Date(f.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const monthAccounts = accountRecords.filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const monthIncome = monthAccounts.filter(a => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
    const monthExpense = monthAccounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    const monthBalance = monthIncome - monthExpense;

    // 周度统计
    const weekTimeRecords = timeRecords.filter(r => {
      const d = new Date(r.date);
      return d >= weekStart && d <= weekEnd;
    });
    const weekHabits = habits.filter(h => {
      const d = new Date(h.date);
      return d >= weekStart && d <= weekEnd;
    });
    const weekCompletedHabits = weekHabits.filter(h => h.isCompleted).length;
    const weekHabitRate = weekHabits.length > 0
      ? Math.round((weekCompletedHabits / weekHabits.length) * 100)
      : 0;
    const weekBooks = bookRecords.filter(b => {
      const d = new Date(b.date);
      return d >= weekStart && d <= weekEnd;
    });
    const weekFitness = fitnessRecords.filter(f => {
      const d = new Date(f.date);
      return d >= weekStart && d <= weekEnd;
    });
    const weekAccounts = accountRecords.filter(a => {
      const d = new Date(a.date);
      return d >= weekStart && d <= weekEnd;
    });
    const weekIncome = weekAccounts.filter(a => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
    const weekExpense = weekAccounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    const weekBalance = weekIncome - weekExpense;

    // 今日统计
    const dayTimeRecords = timeRecords.filter(r => r.date === currentDate);
    const dayHabits = habits.filter(h => h.date === currentDate);
    const dayCompletedHabits = dayHabits.filter(h => h.isCompleted).length;
    const dayBooks = bookRecords.filter(b => b.date === currentDate);
    const dayFitness = fitnessRecords.filter(f => f.date === currentDate);
    const dayAccounts = accountRecords.filter(a => a.date === currentDate);
    const dayIncome = dayAccounts.filter(a => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
    const dayExpense = dayAccounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    const dayBalance = dayIncome - dayExpense;

    // 年进度（截至今天的天数/365）
    const yearProgress = Math.round(((now.getMonth() * 30 + now.getDate()) / 365) * 100);
    
    // 月进度（今天/本月天数）
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthProgress = Math.round((now.getDate() / daysInMonth) * 100);
    
    // 周进度（周几/7）
    const dayOfWeek = now.getDay();
    const weekDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const weekProgress = Math.round((weekDay / 7) * 100);
    
    // 日进度（当前小时/24）
    const dayProgress = Math.round((now.getHours() / 24) * 100);

    return {
      year: {
        progress: yearProgress,
        stats: [
          { label: '时序记录', value: yearTimeRecords.length },
          { label: '习惯达成', value: yearHabits.length },
          { label: '阅读天数', value: yearBooks.length },
          { label: '健身次数', value: yearFitness.length },
          { label: '年度储蓄', value: `¥${yearSavings}` },
        ],
      },
      month: {
        progress: monthProgress,
        stats: [
          { label: '时序记录', value: monthTimeRecords.length },
          { label: '习惯达成率', value: `${monthHabitRate}%` },
          { label: '阅读天数', value: monthBooks.length },
          { label: '健身次数', value: monthFitness.length },
          { label: '本月结余', value: `¥${monthBalance}` },
        ],
      },
      week: {
        progress: weekProgress,
        stats: [
          { label: '时序记录', value: weekTimeRecords.length },
          { label: '习惯达成率', value: `${weekHabitRate}%` },
          { label: '阅读天数', value: weekBooks.length },
          { label: '健身次数', value: weekFitness.length },
          { label: '本周结余', value: `¥${weekBalance}` },
        ],
      },
      day: {
        progress: dayProgress,
        stats: [
          { label: '时序记录', value: dayTimeRecords.length },
          { label: '习惯达成', value: `${dayCompletedHabits}/3` },
          { label: '阅读', value: dayBooks.length > 0 ? '✓' : '○' },
          { label: '健身', value: dayFitness.length > 0 ? '✓' : '○' },
          { label: '今日收支', value: `¥${dayBalance}` },
        ],
      },
    };
  }, [timeRecords, habits, bookRecords, fitnessRecords, accountRecords, currentDate]);

  return (
    <div className="progress-cards-grid grid gap-4 mb-6">
      <ProgressCard
        title="年度进度"
        period={`${new Date().getFullYear()}年`}
        progress={stats.year.progress}
        color="var(--progress-year)"
        stats={stats.year.stats}
      />
      <ProgressCard
        title="月度进度"
        period={`${new Date().getFullYear()}年${new Date().getMonth() + 1}月`}
        progress={stats.month.progress}
        color="var(--progress-month)"
        stats={stats.month.stats}
      />
      <ProgressCard
        title="周度进度"
        period="本周"
        progress={stats.week.progress}
        color="var(--progress-week)"
        stats={stats.week.stats}
      />
      <ProgressCard
        title="今日进度"
        period="今天"
        progress={stats.day.progress}
        color="var(--progress-day)"
        stats={stats.day.stats}
      />
    </div>
  );
}