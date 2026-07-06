'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Calendar, Clock, Flame } from 'lucide-react';
import type { FitnessRecord } from '@/types';

interface MonthlyFitnessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: FitnessRecord[];
  currentMonth: Date;
  onRecordClick?: (date: string) => void;
}

export function MonthlyFitnessModal({ open, onOpenChange, records, currentMonth, onRecordClick }: MonthlyFitnessModalProps) {
  // 筛选当月记录
  const monthlyRecords = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return records.filter(r => r.date.startsWith(monthStr));
  }, [records, currentMonth]);

  // 计算总运动时长
  const totalMinutes = useMemo(() => {
    return monthlyRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
  }, [monthlyRecords]);

  // 计算总消耗卡路里
  const totalCalories = useMemo(() => {
    return monthlyRecords.reduce((sum, r) => sum + (r.calories || 0), 0);
  }, [monthlyRecords]);

  // 按日期分组并倒序排列
  const recordsByDate = useMemo(() => {
    const grouped: Record<string, FitnessRecord[]> = {};
    monthlyRecords.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthlyRecords]);

  // 训练类型统计
  const trainingTypeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    monthlyRecords.forEach(r => {
      const type = r.trainingType || '未分类';
      stats[type] = (stats[type] || 0) + (r.duration || 0);
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

  const getTrainingTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      strength: '力量训练',
      posture: '体态训练',
      stretch: '拉伸训练',
      walk: '步行',
      run: '跑步',
      cycling: '骑行',
      swimming: '游泳',
      yoga: '瑜伽',
      pilates: '普拉提',
      dance: '舞蹈',
      ball: '球类运动',
      hiking: '登山',
      other: '其他运动',
    };
    return typeMap[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-fitness" />
            月度健身汇总
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          {/* 总览统计 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-fitness/10 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">总运动时长</div>
              <div className="text-2xl font-bold text-fitness">{formatDuration(totalMinutes)}</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">总消耗</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalCalories} kcal</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-4 text-center">
            共 {monthlyRecords.length} 条训练记录
          </div>

          {/* 训练类型统计图表 */}
          {trainingTypeStats.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">训练类型统计</div>
              <div className="space-y-2">
                {trainingTypeStats.map(([type, minutes]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16 truncate">{getTrainingTypeLabel(type)}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-fitness/60 rounded-full"
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
                      <Dumbbell className="w-4 h-4 text-fitness mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{getTrainingTypeLabel(record.trainingType)}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(record.duration || 0)}
                          </span>
                          {(record.calories ?? 0) > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {record.calories} kcal
                              </span>
                            </>
                          )}
                          {(record.distance ?? 0) > 0 && (
                            <>
                              <span>·</span>
                              <span>{record.distance} km</span>
                            </>
                          )}
                        </div>
                        {record.feeling && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">感受：{record.feeling}</div>
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
              <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>本月暂无健身记录</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
