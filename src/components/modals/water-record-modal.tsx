'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DRINK_TYPES, type DrinkType } from '@/types';

interface WaterRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (drinkType: DrinkType, amount: number) => void;
  currentAmount?: number;
}

const QUICK_AMOUNTS = [100, 200, 250, 330, 500];

export function WaterRecordModal({ open, onOpenChange, onConfirm, currentAmount = 0 }: WaterRecordModalProps) {
  const [drinkType, setDrinkType] = useState<DrinkType>('纯净水');
  const [amount, setAmount] = useState('');
  const [lastDrinkType, setLastDrinkType] = useState<DrinkType>('纯净水');

  useEffect(() => {
    if (open) {
      setDrinkType(lastDrinkType);
      setAmount('');
    }
  }, [open, lastDrinkType]);

  const handleConfirm = () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) return;
    
    setLastDrinkType(drinkType);
    onConfirm(drinkType, amountNum);
    onOpenChange(false);
  };

  const canConfirm = amount !== '' && parseInt(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-base font-medium">记录饮水</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* 饮品类型 */}
          <div className="space-y-2">
            <Label className="text-xs">饮品类型</Label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {DRINK_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setDrinkType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border',
                    drinkType === type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 饮水量 */}
          <div className="space-y-2">
            <Label className="text-xs">饮水量 (ml)</Label>
            <Input
              type="number"
              placeholder="输入饮水量"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9"
            />
            <div className="flex gap-2">
              {QUICK_AMOUNTS.map(ml => (
                <button
                  key={ml}
                  onClick={() => setAmount(String(ml))}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-xs transition-all border',
                    amount === String(ml)
                      ? 'bg-primary/10 border-primary text-primary font-medium'
                      : 'bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  {ml}ml
                </button>
              ))}
            </div>
          </div>

          {/* 当前进度 */}
          <div className="text-xs text-muted-foreground text-center">
            今日已饮 <span className="text-primary font-medium">{currentAmount}</span> ml / 目标 2000 ml
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 pt-3 border-t">
          <Button variant="outline" className="flex-1 h-10" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button className="flex-1 h-10" onClick={handleConfirm} disabled={!canConfirm}>
            确认添加
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
