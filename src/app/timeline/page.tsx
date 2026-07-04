'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/components/providers/data-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimeRecordModal } from '@/components/modals/time-record-modal';
import { TIME_CATEGORIES, type TimeRecord } from '@/types';

// 图标组件
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

export default function TimelinePage() {
  const { timeRecords, currentDate, setCurrentDate } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TimeRecord | null>(null);

  // 切换日期
  const goToPrevDay = () => {
    const current = new Date(currentDate);
    current.setDate(current.getDate() - 1);
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const current = new Date(currentDate);
    current.setDate(current.getDate() + 1);
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // 获取当日时间记录
  const dayTimeRecords = useMemo(() => {
    return timeRecords.filter(r => r.date === currentDate);
  }, [timeRecords, currentDate]);

  // 生成24小时时间轴数据
  const timelineData = useMemo(() => {
    const hours: Array<{
      hour: number;
      label: string;
      records: TimeRecord[];
    }> = [];

    for (let h = 0; h < 24; h++) {
      const hourStr = `${String(h).padStart(2, '0')}:00`;
      const hourEnd = `${String(h).padStart(2, '0')}:59`;

      // 查找该小时的时间记录
      const hourRecords = dayTimeRecords.filter(record => {
        const startHour = parseInt(record.startTime.split(':')[0]);
        const endHour = parseInt(record.endTime.split(':')[0]);
        return startHour <= h && endHour >= h;
      });

      hours.push({
        hour: h,
        label: hourStr,
        records: hourRecords,
      });
    }

    return hours;
  }, [dayTimeRecords]);

  // 日期显示
  const dateDisplay = useMemo(() => {
    const date = new Date(currentDate);
    const today = new Date();
    const isToday = currentDate === today.toISOString().split('T')[0];
    
    return {
      full: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
      isToday,
    };
  }, [currentDate]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        {/* 页面标题 */}
        <header className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl text-foreground">
            时间轴
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            24h竖向时间轴 · 可视化一天的时间分配
          </p>
        </header>

        {/* 日期选择器 */}
        <Card className="mb-4 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevDay}
                aria-label="前一天"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2 px-2">
                <span className="font-medium text-foreground">
                  {dateDisplay.full}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {dateDisplay.weekday}
                </Badge>
                {dateDisplay.isToday && (
                  <Badge className="text-xs bg-[var(--ink-blue)] text-white">
                    今天
                  </Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextDay}
                aria-label="后一天"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                回到今天
              </Button>
              
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[var(--ink-blue)] text-white"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                新增
              </Button>
            </div>
          </div>
        </Card>

        {/* 时间轴 */}
        <Card className="overflow-hidden">
          <ScrollArea className="h-[calc(100vh-280px)] md:h-[600px]">
            <div className="p-4 space-y-1">
              {timelineData.map(({ hour, label, records }) => (
                <div
                  key={hour}
                  className="timeline-hour relative"
                  data-hour={label}
                >
                  {/* 时间记录卡片 */}
                  {records.map((record) => {
                    const startHour = parseInt(record.startTime.split(':')[0]);
                    const startMinute = parseInt(record.startTime.split(':')[1]);
                    const endHour = parseInt(record.endTime.split(':')[0]);
                    const endMinute = parseInt(record.endTime.split(':')[1]);
                    
                    // 只在开始小时显示完整卡片
                    if (hour !== startHour) return null;

                    const categoryConfig = TIME_CATEGORIES[record.category];

                    return (
                      <div
                        key={record.id}
                        className="timeline-slot clickable"
                        style={{
                          backgroundColor: `${categoryConfig?.color || 'var(--cat-other)'}20`,
                          borderLeft: `3px solid ${categoryConfig?.color || 'var(--cat-other)'}`,
                        }}
                        onClick={() => setEditRecord(record)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {record.startTime}-{record.endTime}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {record.title}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: categoryConfig?.color,
                              color: categoryConfig?.color,
                            }}
                          >
                            {categoryConfig?.name}
                          </Badge>
                        </div>
                        {record.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* 分类统计 */}
        <Card className="mt-4 p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">今日时间分配</h3>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {Object.entries(TIME_CATEGORIES).map(([key, config]) => {
              const categoryRecords = dayTimeRecords.filter(r => r.category === key);
              const totalMinutes = categoryRecords.reduce((sum, r) => {
                const start = parseInt(r.startTime.split(':')[0]) * 60 + parseInt(r.startTime.split(':')[1]);
                const end = parseInt(r.endTime.split(':')[0]) * 60 + parseInt(r.endTime.split(':')[1]);
                return sum + (end - start);
              }, 0);

              return (
                <div
                  key={key}
                  className="text-center p-2 rounded-lg bg-muted/30"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: config.color }}
                  />
                  <p className="text-xs font-medium">{config.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {totalMinutes > 0 ? `${Math.round(totalMinutes / 60)}h` : '0h'}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 新增时间记录弹窗 */}
      <TimeRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        date={currentDate}
      />

      {/* 编辑时间记录弹窗 */}
      {editRecord && (
        <TimeRecordModal
          isOpen={true}
          onClose={() => setEditRecord(null)}
          date={currentDate}
          editRecord={editRecord}
        />
      )}
    </div>
  );
}