'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { TimeStorage, HabitStorage } from '@/lib/storage';
import type { TimeRecord, FirstCategory, HabitRecord, WaterDrink } from '@/types';
import { getCategoryColor, FIRST_CATEGORIES, HABIT_CONFIG } from '@/types';

export default function TimelinePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [habitRecord, setHabitRecord] = useState<HabitRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FirstCategory | 'all'>('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    loadRecords();
  }, [currentDate, isClient]);

  const loadRecords = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const records = TimeStorage.getByDate(dateStr);
    setTimeRecords(records);
    const habit = HabitStorage.getByDate(dateStr);
    setHabitRecord(habit);
  };

  // 过滤掉饮水记录（饮水在底部独立板块展示）
  const nonWaterRecords = timeRecords.filter(r => r.secondCategory !== '饮水');

  const filteredRecords = selectedCategory === 'all'
    ? nonWaterRecords
    : nonWaterRecords.filter(r => r.firstCategory === selectedCategory);

  // 按开始时间排序
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  const formatDate = (date: Date) => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 周${weekdays[date.getDay()]}`;
  };

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const goToPrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 生成24小时时间刻度
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 计算记录在时间轴上的位置
  const getRecordPosition = (record: TimeRecord) => {
    const start = new Date(record.startTime);
    const end = new Date(record.endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;
    
    return {
      top: `${(startMinutes / 1440) * 100}%`,
      height: `${(duration / 1440) * 100}%`
    };
  };

  const totalMinutes = sortedRecords.reduce((sum, r) => sum + r.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMinutes = totalMinutes % 60;

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      {/* 日期选择器 */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevDay}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-serif font-bold">
            {formatDate(currentDate)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs h-6"
          >
            今天
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextDay}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="mb-4 p-3 bg-muted/30 rounded-[var(--radius-standard)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">今日时间记录</span>
          <span className="text-sm font-medium">
            {sortedRecords.length} 条 · {totalHours}h {remainMinutes}m
          </span>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className="text-xs h-7 flex-shrink-0"
        >
          全部
        </Button>
        {FIRST_CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="text-xs h-7 flex-shrink-0"
            style={selectedCategory === cat ? { backgroundColor: getCategoryColor(cat) } : {}}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* 24h时间轴 */}
      <div className="relative bg-card rounded-[var(--radius-standard)] shadow-[var(--shadow-global)] overflow-hidden">
        {/* 时间刻度 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/20 border-r">
          {hours.map(hour => (
            <div
              key={hour}
              className="absolute left-0 right-0 text-xs text-muted-foreground text-center"
              style={{ top: `${(hour / 24) * 100}%` }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* 时间轴内容 */}
        <div className="ml-12 relative" style={{ height: '600px' }}>
          {/* 小时线 */}
          {hours.map(hour => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-dashed border-border/50"
              style={{ top: `${(hour / 24) * 100}%` }}
            />
          ))}

          {/* 时间记录块 */}
          {sortedRecords.map(record => {
            const pos = getRecordPosition(record);
            return (
              <div
                key={record.id}
                className="absolute left-2 right-2 rounded-[var(--radius-standard)] p-2 text-white text-xs overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  top: pos.top,
                  height: pos.height,
                  minHeight: '24px',
                  backgroundColor: getCategoryColor(record.firstCategory)
                }}
              >
                <div className="font-medium truncate">{record.title}</div>
                <div className="opacity-80">
                  {formatTime(record.startTime)} - {formatTime(record.endTime)}
                </div>
                {record.duration >= 30 && (
                  <div className="opacity-80">{record.duration}分钟</div>
                )}
              </div>
            );
          })}

          {/* 当前时间指示线 */}
          {currentDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-destructive z-10"
              style={{
                top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 1440) * 100}%`
              }}
            >
              <div className="absolute left-0 w-2 h-2 rounded-full bg-destructive -translate-y-[3px]" />
            </div>
          )}
        </div>
      </div>

      {/* 今日饮水汇总板块 */}
      {habitRecord && habitRecord.water.drinks && habitRecord.water.drinks.length > 0 && (
        selectedCategory === 'all' || selectedCategory === '生活日常'
      ) && (
        <WaterSummarySection drinks={habitRecord.water.drinks || []} goal={HABIT_CONFIG.water.target} />
      )}

      {/* 只读提示 */}
      <div className="mt-4 p-3 bg-muted/20 rounded-[var(--radius-standard)] text-center">
        <p className="text-xs text-muted-foreground">
          时间轴为只读视图，添加记录请前往「今日待办」页面
        </p>
      </div>
    </div>
  );
}

// 时段配置
const TIME_PERIODS = [
  { key: 'dawn', label: '凌晨', start: 0, end: 6, color: '#E8E8E8' },
  { key: 'morning', label: '上午', start: 7, end: 11, color: '#cce5ff' },
  { key: 'afternoon', label: '中午', start: 12, end: 17, color: '#fff2cc' },
  { key: 'evening', label: '晚上', start: 18, end: 23, color: '#e5ccff' },
] as const;

type TimePeriodKey = typeof TIME_PERIODS[number]['key'];

function getTimePeriod(time: string): TimePeriodKey {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 0 && hour <= 6) return 'dawn';
  if (hour >= 7 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  return 'evening';
}

function WaterSummarySection({ drinks, goal }: { drinks: WaterDrink[]; goal: number }) {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<TimePeriodKey>>(new Set());

  const togglePeriod = (key: TimePeriodKey) => {
    setExpandedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // 按时段分组
  const periodData = TIME_PERIODS.map(period => {
    const periodDrinks = drinks.filter(d => getTimePeriod(d.time) === period.key);
    const totalMl = periodDrinks.reduce((sum, d) => sum + d.amount, 0);
    return { ...period, drinks: periodDrinks, totalMl };
  });

  const totalMl = drinks.reduce((sum, d) => sum + d.amount, 0);
  const progress = Math.min((totalMl / goal) * 100, 100);

  return (
    <div className="mt-4 bg-card rounded-[var(--radius-standard)] shadow-[var(--shadow-global)] overflow-hidden">
      {/* 顶部总览 */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">今日饮水</span>
          <span className="text-sm text-muted-foreground">
            总{totalMl}ml / 目标{goal}ml
          </span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-habit-water transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 四时段横向均分 */}
      <div className="grid grid-cols-4 divide-x">
        {periodData.map(period => (
          <div
            key={period.key}
            className="p-2 text-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: period.color }}
            onClick={() => period.drinks.length > 0 && togglePeriod(period.key)}
          >
            <div className="text-xs font-medium text-foreground/80">{period.label}</div>
            <div className="text-sm font-bold text-foreground mt-1">
              {period.totalMl > 0 ? `${period.totalMl}ml` : '0ml'}
            </div>
            {period.drinks.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {expandedPeriods.has(period.key) ? '收起' : `${period.drinks.length}条`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 展开的明细列表 */}
      {Array.from(expandedPeriods).map(periodKey => {
        const period = periodData.find(p => p.key === periodKey);
        if (!period || period.drinks.length === 0) return null;
        return (
          <div key={periodKey} className="px-3 py-2 border-t bg-muted/10">
            <div className="text-xs font-medium mb-1">{period.label}明细</div>
            <div className="space-y-1">
              {period.drinks.map(drink => (
                <div key={drink.id} className="flex items-center justify-between text-xs">
                  <span>{drink.type}</span>
                  <span className="text-muted-foreground">{drink.amount}ml</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
