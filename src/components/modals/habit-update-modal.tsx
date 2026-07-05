'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HabitStorage } from '@/lib/storage';
import type { HabitType } from '@/types';
import { HABIT_CONFIG } from '@/types';

interface HabitUpdateModalProps {
  type: HabitType;
  date: string;
  currentValue?: number;
  currentCompleted?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function HabitUpdateModal({
  type,
  date,
  currentValue = 0,
  currentCompleted = false,
  onClose,
  onSaved
}: HabitUpdateModalProps) {
  const config = HABIT_CONFIG[type];
  const [value, setValue] = useState(currentValue);

  const handleSave = () => {
    if (type === 'water') {
      HabitStorage.updateWater(date, value);
    } else if (type === 'supplements') {
      HabitStorage.toggleSupplements(date);
    } else if (type === 'journal') {
      HabitStorage.toggleJournal(date);
    }
    onSaved();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>更新{config.label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {type === 'water' ? (
            <div>
              <label className="text-sm font-medium mb-2 block">
                饮水量（目标 {config.target}ml）
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  value={value}
                  onChange={(e) => setValue(parseInt(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: config.color }}
                />
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: config.color }}>
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground">ml</div>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>1000</span>
                <span>2000</span>
                <span>3000</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: currentCompleted ? config.color : 'var(--muted)' }}
              >
                {currentCompleted ? (
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-2xl">
                    {type === 'supplements' ? '💊' : '📔'}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentCompleted ? '已完成打卡' : '点击保存完成打卡'}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1" style={{ backgroundColor: config.color }}>
              保存
            </Button>
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
