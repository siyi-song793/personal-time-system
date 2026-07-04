'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/components/providers/data-provider';
import { FITNESS_TYPES, type FitnessType, type FitnessRecord } from '@/types';

interface FitnessRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  editRecord?: FitnessRecord;
}

export function FitnessRecordModal({ isOpen, onClose, date, editRecord }: FitnessRecordModalProps) {
  const { addFitnessRecord, updateFitnessRecord } = useData();
  
  const [fitnessType, setFitnessType] = useState<FitnessType>(editRecord?.fitnessType || 'running');
  const [duration, setDuration] = useState(editRecord?.duration || 30);
  const [calories, setCalories] = useState(editRecord?.calories || 0);
  const [distance, setDistance] = useState(editRecord?.distance || 0);
  const [notes, setNotes] = useState(editRecord?.notes || '');

  const handleSubmit = () => {
    if (duration <= 0) return;

    if (editRecord) {
      updateFitnessRecord(editRecord.id, {
        fitnessType,
        duration,
        calories: calories || undefined,
        distance: distance || undefined,
        notes: notes || undefined,
      });
    } else {
      addFitnessRecord({
        date,
        fitnessType,
        duration,
        calories: calories || undefined,
        distance: distance || undefined,
        notes: notes || undefined,
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>💪</span>
            <span>{editRecord ? '编辑健身记录' : '新增健身记录'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="fitnessType">运动类型</Label>
            <Select
              value={fitnessType}
              onValueChange={(value) => setFitnessType(value as FitnessType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择运动类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FITNESS_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">时长（分钟）</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="calories">卡路里（可选）</Label>
              <Input
                id="calories"
                type="number"
                min={0}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="font-mono"
              />
            </div>
          </div>

          {/* 距离（跑步/骑行专用） */}
          {(fitnessType === 'running' || fitnessType === 'cycling') && (
            <div>
              <Label htmlFor="distance">距离（公里）</Label>
              <Input
                id="distance"
                type="number"
                min={0}
                step={0.1}
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="font-mono"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">备注（可选）</Label>
            <Textarea
              id="notes"
              placeholder="运动感受..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={duration <= 0}>
            {editRecord ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}