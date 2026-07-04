'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TimeRecordModal } from '@/components/modals/time-record-modal';
import { HabitUpdateModal } from '@/components/modals/habit-update-modal';
import { BookRecordModal } from '@/components/modals/book-record-modal';
import { FitnessRecordModal } from '@/components/modals/fitness-record-modal';
import { AccountRecordModal } from '@/components/modals/account-record-modal';
import { useData } from '@/components/providers/data-provider';
import type { CalendarDayData } from '@/types';
import type { TimeRecord, HabitDaily, AccountRecord } from '@/types';
import { TIME_CATEGORIES, HABIT_CONFIGS } from '@/types';
import { useState } from 'react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: CalendarDayData | null;
}

export function DayDetailModal({ isOpen, onClose, dayData }: DayDetailModalProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { updateHabitProgress } = useData();

  if (!dayData) return null;

  const date = new Date(dayData.date);
  const dateDisplay = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-serif">{dateDisplay}</span>
              <Badge variant="secondary" className="text-xs">{weekday}</Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* 时间记录区块 */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground">时间记录</h3>
                  <button
                    onClick={() => setActiveModal('time-add')}
                    className="text-xs text-[var(--ink-blue)] hover:underline"
                  >
                    + 新增
                  </button>
                </div>
                
                {dayData.timeRecords.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">暂无时间记录</p>
                ) : (
                  <div className="space-y-1">
                    {dayData.timeRecords.map((record: TimeRecord) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted clickable"
                        onClick={() => setActiveModal(`time-edit-${record.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: TIME_CATEGORIES[record.category]?.color || 'var(--cat-other)',
                            }}
                          />
                          <span className="text-xs font-mono">
                            {record.startTime}-{record.endTime}
                          </span>
                          <span className="text-xs">{record.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {TIME_CATEGORIES[record.category]?.name || '其他'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 习惯追踪区块 */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground">今日习惯</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['water', 'supplement', 'journal'] as const).map((habitType) => {
                    const habit = dayData.habits.find((h: HabitDaily) => h.habitType === habitType);
                    const config = HABIT_CONFIGS[habitType];
                    const completed = habit?.completed || 0;
                    const target = config.target;
                    const percent = Math.min((completed / target) * 100, 100);

                    return (
                      <button
                        key={habitType}
                        onClick={() => setActiveModal(`habit-${habitType}`)}
                        className="p-3 rounded-lg border border-border hover:border-[var(--habit-complete)] transition-colors clickable"
                      >
                        <div className="text-center">
                          <span className="text-lg mb-1">{config.icon}</span>
                          <p className="text-xs font-medium">{config.name}</p>
                          <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--habit-complete)] transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {completed}/{target}{config.unit}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 专项记录区块 */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground">专项记录</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveModal('book')}
                    className="p-3 rounded-lg border border-border hover:border-[var(--reading-amber)] transition-colors clickable text-center"
                  >
                    <span className="text-lg mb-1">📚</span>
                    <p className="text-xs font-medium">阅读</p>
                  </button>
                  <button
                    onClick={() => setActiveModal('fitness')}
                    className="p-3 rounded-lg border border-border hover:border-[var(--fitness-coral)] transition-colors clickable text-center"
                  >
                    <span className="text-lg mb-1">💪</span>
                    <p className="text-xs font-medium">健身</p>
                  </button>
                  <button
                    onClick={() => setActiveModal('account')}
                    className="p-3 rounded-lg border border-border hover:border-[var(--expense-orange)] transition-colors clickable text-center"
                  >
                    <span className="text-lg mb-1">💰</span>
                    <p className="text-xs font-medium">记账</p>
                  </button>
                </div>
              </section>

              {/* 记账记录区块 */}
              {dayData.accountRecords.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-foreground mb-2">今日收支</h3>
                  <div className="space-y-1">
                    {dayData.accountRecords.map((record: AccountRecord) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <span className="text-xs">{record.description || '未备注'}</span>
                        <span
                          className="text-xs font-mono font-medium"
                          style={{
                            color: record.type === 'income'
                              ? 'var(--income-mint)'
                              : 'var(--expense-orange)',
                          }}
                        >
                          {record.type === 'income' ? '+' : '-'}¥{record.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 子弹窗 */}
      {activeModal === 'time-add' && (
        <TimeRecordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={dayData.date}
        />
      )}
      
      {activeModal?.startsWith('habit-') && (
        <HabitUpdateModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={dayData.date}
          habitType={activeModal.split('-')[1] as 'water' | 'supplement' | 'journal'}
        />
      )}
      
      {activeModal === 'book' && (
        <BookRecordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={dayData.date}
        />
      )}
      
      {activeModal === 'fitness' && (
        <FitnessRecordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={dayData.date}
        />
      )}
      
      {activeModal === 'account' && (
        <AccountRecordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={dayData.date}
        />
      )}
    </>
  );
}