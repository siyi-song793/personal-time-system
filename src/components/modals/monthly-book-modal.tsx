'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import type { BookRecord } from '@/types';

interface MonthlyBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: BookRecord[];
  currentMonth: Date;
  onRecordClick?: (date: string) => void;
}

export function MonthlyBookModal({ open, onOpenChange, records, currentMonth, onRecordClick }: MonthlyBookModalProps) {
  // 筛选当月记录
  const monthlyRecords = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return records.filter(r => r.date.startsWith(monthStr));
  }, [records, currentMonth]);

  // 计算总阅读时长
  const totalMinutes = useMemo(() => {
    return monthlyRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
  }, [monthlyRecords]);

  // 按日期分组并倒序排列
  const recordsByDate = useMemo(() => {
    const grouped: Record<string, BookRecord[]> = {};
    monthlyRecords.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthlyRecords]);

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    monthlyRecords.forEach(r => {
      const cat = r.bookType || '未分类';
      stats[cat] = (stats[cat] || 0) + (r.duration || 0);
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [monthlyRecords]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    return `${day}日 周${weekDay}`;
  };

  const getCategoryLabel = (bookType: string) => {
    return bookType || '未分类';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-reading" />
            月度阅读汇总
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          {/* 总览统计 */}
          <div className="bg-reading/10 rounded-lg p-4 mb-4">
            <div className="text-sm text-muted-foreground mb-1">本月总阅读时长</div>
            <div className="text-2xl font-bold text-reading">{formatDuration(totalMinutes)}</div>
            <div className="text-xs text-muted-foreground mt-1">共 {monthlyRecords.length} 条记录</div>
          </div>

          {/* 分类统计图表 */}
          {categoryStats.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">分类统计</div>
              <div className="space-y-2">
                {categoryStats.map(([cat, minutes]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16 truncate">{getCategoryLabel(cat)}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-reading/60 rounded-full"
                        style={{ width: `${Math.min(100, (minutes / totalMinutes) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{formatDuration(minutes)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 按日期分组的记录列表 */}
          <div className="space-y-4">
            {recordsByDate.map(([date, dateRecords]) => (
              <div key={date} className="border rounded-lg overflow-hidden">
                <div
                  className="bg-muted/50 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => onRecordClick?.(date)}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {formatDate(date)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDuration(dateRecords.reduce((sum, r) => sum + (r.duration || 0), 0))}
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {dateRecords.map((record) => (
                    <div key={record.id} className="flex items-start gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-reading mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{record.bookName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{record.author}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(record.duration || 0)}
                          </span>
                          {record.bookType && (
                            <>
                              <span>·</span>
                              <Badge variant="outline" className="text-xs py-0 px-1.5">
                                {getCategoryLabel(record.bookType)}
                              </Badge>
                            </>
                          )}
                        </div>
                        {record.note && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">{record.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {monthlyRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>本月暂无阅读记录</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
