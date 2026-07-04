'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/components/providers/data-provider';
import { HABIT_CONFIGS, type HabitType } from '@/types';

interface HabitUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  habitType: HabitType;
}

export function HabitUpdateModal({ isOpen, onClose, date, habitType }: HabitUpdateModalProps) {
  const { updateHabitProgress, habits } = useData();
  const config = HABIT_CONFIGS[habitType];
  
  const existingHabit = habits.find(h => h.date === date && h.habitType === habitType);
  const [completed, setCompleted] = useState(existingHabit?.completed || 0);

  const handleSubmit = () => {
    updateHabitProgress(date, habitType, completed);
    onClose();
  };

  const handleQuickAdd = (amount: number) => {
    setCompleted(prev => Math.min(prev + amount, config.target * 2));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{config.icon}</span>
            <span>{config.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-2">
              目标: {config.target} {config.unit}
            </p>
            
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompleted(prev => Math.max(prev - 50, 0))}
              >
                -50
              </Button>
              <Input
                type="number"
                value={completed}
                onChange={(e) => setCompleted(Number(e.target.value))}
                className="w-20 text-center font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(50)}
              >
                +50
              </Button>
            </div>

            {/* 进度条 */}
            <div className="mt-4 h-4 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--habit-complete)] transition-all duration-300"
                style={{
                  width: `${Math.min((completed / config.target) * 100, 100)}%`,
                }}
              />
            </div>
            
            <p className="mt-2 text-sm font-mono">
              {completed}/{config.target} {config.unit}
              {completed >= config.target && (
                <span className="text-[var(--habit-complete)] ml-2">✓ 已完成</span>
              )}
            </p>
          </div>

          {/* 快捷按钮（饮水专用） */}
          {habitType === 'water' && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickAdd(200)}>
                200ml
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickAdd(300)}>
                300ml
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickAdd(500)}>
                500ml
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}