'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { TimeRecord, HabitRecord, AccountRecord, BookRecord, FitnessRecord, FirstCategory, WaterDrink } from '@/types';
import { getCategoryColor, HABIT_CONFIG } from '@/types';

interface DayDetailModalProps {
  date: string;
  timeRecords: TimeRecord[];
  habits: HabitRecord | null;
  accountRecords: AccountRecord[];
  bookRecords: BookRecord[];
  fitnessRecords: FitnessRecord[];
  onClose: () => void;
  onAddAccount?: () => void;
}

export function DayDetailModal({
  date,
  timeRecords,
  habits,
  accountRecords,
  bookRecords,
  fitnessRecords,
  onClose,
  onAddAccount
}: DayDetailModalProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`;
  };

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const totalMinutes = timeRecords.reduce((sum, r) => sum + r.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMinutes = totalMinutes % 60;

  // 分类统计
  const categoryStats: Record<string, number> = {};
  timeRecords.forEach(r => {
    categoryStats[r.firstCategory] = (categoryStats[r.firstCategory] || 0) + r.duration;
  });

  // 收支统计
  const incomeTotal = accountRecords
    .filter(a => a.type === 'income')
    .reduce((sum, a) => sum + a.amount, 0);
  const expenseTotal = accountRecords
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{formatDate(date)}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          {/* 时间记录概览 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">时间记录</h4>
              <span className="text-xs text-muted-foreground">
                共 {totalHours}h {remainMinutes}m
              </span>
            </div>
            
            {timeRecords.length > 0 ? (
              <div className="space-y-2">
                {timeRecords
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(record => (
                  <div
                    key={record.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-[var(--radius-standard)]"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(record.firstCategory) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {record.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(record.startTime)} - {formatTime(record.endTime)}
                        <span className="ml-2">{record.duration}分钟</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {record.secondCategory}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                暂无时间记录
              </div>
            )}

            {/* 分类统计 */}
            {Object.keys(categoryStats).length > 0 && (
              <div className="mt-3 p-2 bg-muted/20 rounded-[var(--radius-standard)]">
                <div className="text-xs text-muted-foreground mb-1">分类统计</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(categoryStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, minutes]) => (
                      <div
                        key={cat}
                        className="flex items-center gap-1 text-xs"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getCategoryColor(cat as FirstCategory) }}
                        />
                        <span>{cat}</span>
                        <span className="text-muted-foreground">{minutes}m</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 习惯完成情况 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">习惯打卡</h4>
            <div className="grid grid-cols-3 gap-2">
              {(['water', 'supplements', 'journal'] as const).map(type => {
                const config = HABIT_CONFIG[type];
                const isCompleted = habits ? habits[type].completed : false;
                
                return (
                  <div
                    key={type}
                    className={`p-2 rounded-[var(--radius-standard)] text-center ${
                      isCompleted ? 'bg-primary/10' : 'bg-muted/30'
                    }`}
                  >
                    <div
                      className="w-6 h-6 mx-auto rounded-full flex items-center justify-center mb-1"
                      style={{ backgroundColor: isCompleted ? config.color : 'var(--muted)' }}
                    >
                      {isCompleted && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="text-xs">{config.label}</div>
                    {type === 'water' && habits && (
                      <div className="text-xs text-muted-foreground">
                        {habits.water.amount}ml
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 饮水分时段明细 */}
          {habits && habits.water.drinks && habits.water.drinks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">饮水明细</h4>
              <div className="grid grid-cols-4 gap-2">
                {getTimePeriods(habits.water.drinks).map(period => (
                  <div
                    key={period.key}
                    className="p-2 rounded-[var(--radius-standard)] text-center"
                    style={{ backgroundColor: period.color }}
                  >
                    <div className="text-xs font-medium text-foreground/80">{period.label}</div>
                    <div className="text-sm font-bold text-foreground mt-1">
                      {period.totalMl > 0 ? `${period.totalMl}ml` : '0ml'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 阅读记录 */}
          {bookRecords.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <span className="text-amber-500">📖</span> 阅读记录
              </h4>
              <div className="space-y-2">
                {bookRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center gap-2 p-2 bg-amber-500/5 rounded-[var(--radius-standard)]"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-amber-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{record.bookName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {record.author && <span>{record.author}</span>}
                        {record.progress && <span>进度: {record.progress}</span>}
                        {record.duration && <span>{record.duration}分钟</span>}
                      </div>
                      {record.note && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {record.note}
                        </div>
                      )}
                    </div>
                    {record.readingStatus && (
                      <Badge variant="outline" className="text-xs">
                        {record.readingStatus === 'reading' ? '在读' : record.readingStatus === 'finished' ? '已读' : '想读'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 健身记录 */}
          {fitnessRecords.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <span className="text-green-500">🏃</span> 健身记录
              </h4>
              <div className="space-y-2">
                {fitnessRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center gap-2 p-2 bg-green-500/5 rounded-[var(--radius-standard)]"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{record.trainingType}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {record.duration && <span>{record.duration}分钟</span>}
                        {record.calories && <span>{record.calories}kcal</span>}
                        {record.distance && <span>{record.distance}km</span>}
                        {record.sets && <span>{record.sets}组</span>}
                      </div>
                      {record.feeling && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          感受: {record.feeling}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 记账记录 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">记账记录</h4>
              <div className="text-xs">
                <span className="text-account-income">+{incomeTotal.toFixed(2)}</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-account-expense">-{expenseTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {accountRecords.length > 0 ? (
              <div className="space-y-2">
                {accountRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-[var(--radius-standard)]"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      record.type === 'income' ? 'bg-account-income' : 'bg-account-expense'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        {record.firstCategory}
                        {record.secondCategory && ` - ${record.secondCategory}`}
                      </div>
                      {record.note && (
                        <div className="text-xs text-muted-foreground truncate">
                          {record.note}
                        </div>
                      )}
                    </div>
                    <div className={`text-sm font-medium ${
                      record.type === 'income' ? 'text-account-income' : 'text-account-expense'
                    }`}>
                      {record.type === 'income' ? '+' : '-'}{record.amount.toFixed(2)}
                    </div>
                    {record.tag && (
                      <Badge variant="outline" className="text-xs">
                        {record.tag}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                暂无记账记录
              </div>
            )}
          </div>

          {/* 新增该日记账按钮 */}
          {onAddAccount && (
            <button
              onClick={onAddAccount}
              className="w-full py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-[var(--radius-standard)] hover:bg-primary/20 transition-colors"
            >
              + 新增该日记账
            </button>
          )}

          {/* 只读提示 */}
          <div className="p-3 bg-muted/20 rounded-[var(--radius-standard)] text-center">
            <p className="text-xs text-muted-foreground">
              月历为只读视图，编辑请前往「今日待办」页面
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// 时段配置
const TIME_PERIOD_CONFIG = [
  { key: 'dawn', label: '凌晨', start: 0, end: 6, color: '#E8E8E8' },
  { key: 'morning', label: '上午', start: 7, end: 11, color: '#cce5ff' },
  { key: 'afternoon', label: '中午', start: 12, end: 17, color: '#fff2cc' },
  { key: 'evening', label: '晚上', start: 18, end: 23, color: '#e5ccff' },
] as const;

function getTimePeriods(drinks: WaterDrink[]) {
  return TIME_PERIOD_CONFIG.map(period => {
    const periodDrinks = drinks.filter(d => {
      const hour = parseInt(d.time.split(':')[0], 10);
      return hour >= period.start && hour <= period.end;
    });
    const totalMl = periodDrinks.reduce((sum, d) => sum + d.amount, 0);
    return { ...period, drinks: periodDrinks, totalMl };
  });
}
