'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AccountRecord } from '@/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';

interface MonthlyAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: AccountRecord[];
  currentMonth: Date;
  onRecordClick?: (date: string) => void;
}

export function MonthlyAccountModal({ open, onOpenChange, records, currentMonth, onRecordClick }: MonthlyAccountModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 筛选当月记录
  const monthlyRecords = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return records.filter(r => r.date.startsWith(monthStr));
  }, [records, currentMonth]);

  // 计算收支统计
  const stats = useMemo(() => {
    const income = monthlyRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const expense = monthlyRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthlyRecords]);

  // 按日期分组并倒序排列
  const recordsByDate = useMemo(() => {
    const grouped: Record<string, AccountRecord[]> = {};
    monthlyRecords.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthlyRecords]);

  // 支出分类统计
  const expenseByCategory = useMemo(() => {
    const stats: Record<string, number> = {};
    monthlyRecords.filter(r => r.type === 'expense').forEach(r => {
      const cat = r.firstCategory;
      stats[cat] = (stats[cat] || 0) + r.amount;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [monthlyRecords]);

  const formatDate = (dateStr: string) => {
    const [, m, d] = dateStr.split('-');
    return `${parseInt(m)}月${parseInt(d)}日`;
  };

  const handleRecordClick = (date: string) => {
    setSelectedDate(date);
    onRecordClick?.(date);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center">
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 收支总览
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-5 py-2">
            {/* 收支统计卡片 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-account-income/10 rounded-[var(--radius-standard)] p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">收入</div>
                <div className="text-lg font-semibold text-account-income">
                  ¥{stats.income.toFixed(0)}
                </div>
              </div>
              <div className="bg-account-expense/10 rounded-[var(--radius-standard)] p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">支出</div>
                <div className="text-lg font-semibold text-account-expense">
                  ¥{stats.expense.toFixed(0)}
                </div>
              </div>
              <div className="bg-muted/50 rounded-[var(--radius-standard)] p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">结余</div>
                <div className={`text-lg font-semibold ${stats.balance >= 0 ? 'text-account-income' : 'text-account-expense'}`}>
                  ¥{stats.balance.toFixed(0)}
                </div>
              </div>
            </div>

            {/* 支出分类分析 */}
            {expenseByCategory.length > 0 && (
              <div className="bg-muted/30 rounded-[var(--radius-standard)] p-4">
                <div className="text-sm font-medium mb-3">支出分类</div>
                <div className="space-y-2">
                  {expenseByCategory.map(([cat, amount]) => {
                    const percentage = stats.expense > 0 ? (amount / stats.expense) * 100 : 0;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs text-foreground/70 w-20 truncate">{cat}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-account-expense/60 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground/70 w-16 text-right">
                          ¥{amount.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 按日期分组的记录列表 */}
            <div className="space-y-4">
              {recordsByDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  本月暂无记账记录
                </div>
              ) : (
                recordsByDate.map(([date, dateRecords]) => (
                  <div key={date}>
                    <button
                      onClick={() => handleRecordClick(date)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between mb-2 hover:opacity-70 transition-opacity">
                        <span className="text-sm font-medium text-foreground">{formatDate(date)}</span>
                        <span className="text-xs text-muted-foreground">
                          收入 ¥{dateRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0).toFixed(0)} / 
                          支出 ¥{dateRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0).toFixed(0)}
                        </span>
                      </div>
                    </button>
                    <div className="space-y-1.5">
                      {dateRecords.map(record => (
                        <div 
                          key={record.id}
                          className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded-[var(--radius-small)]"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              record.type === 'income' 
                                ? 'bg-account-income/20 text-account-income' 
                                : 'bg-account-expense/20 text-account-expense'
                            }`}>
                              {record.type === 'income' ? '收' : '支'}
                            </span>
                            <span className="text-sm text-foreground">{record.firstCategory}</span>
                            {record.note && (
                              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {record.note}
                              </span>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            record.type === 'income' ? 'text-account-income' : 'text-account-expense'
                          }`}>
                            {record.type === 'income' ? '+' : '-'}¥{record.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
