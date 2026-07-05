'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FitnessStorage } from '@/lib/storage';

interface FitnessRecordModalProps {
  onClose: () => void;
  onSaved: () => void;
  editData?: {
    id: string;
    trainingType: string;
    sets?: number;
    weight?: number;
    feeling?: string;
    bodyWeight?: number;
    duration?: number;
    calories?: number;
    distance?: number;
  };
}

export function FitnessRecordModal({ onClose, onSaved, editData }: FitnessRecordModalProps) {
  const [trainingType, setTrainingType] = useState(editData?.trainingType || '');
  const [sets, setSets] = useState(editData?.sets?.toString() || '');
  const [weight, setWeight] = useState(editData?.weight?.toString() || '');
  const [feeling, setFeeling] = useState(editData?.feeling || '');
  const [bodyWeight, setBodyWeight] = useState(editData?.bodyWeight?.toString() || '');
  const [duration, setDuration] = useState(editData?.duration?.toString() || '');
  const [calories, setCalories] = useState(editData?.calories?.toString() || '');
  const [distance, setDistance] = useState(editData?.distance?.toString() || '');

  const trainingTypes = ['力量', '体态', '拉伸', '步行', '骑行', '游泳', '跑步', '瑜伽', '其他'];

  const handleSave = () => {
    if (!trainingType.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    if (editData) {
      FitnessStorage.update(editData.id, {
        trainingType,
        sets: sets ? parseInt(sets) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        feeling: feeling || undefined,
        bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        distance: distance ? parseFloat(distance) : undefined
      });
    } else {
      FitnessStorage.add({
        trainingType,
        sets: sets ? parseInt(sets) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        feeling: feeling || undefined,
        bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        distance: distance ? parseFloat(distance) : undefined,
        date: today
      });
    }

    onSaved();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? '编辑健身记录' : '新增健身记录'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 训练类型 */}
          <div>
            <label className="text-sm font-medium mb-2 block">训练类型 *</label>
            <div className="flex flex-wrap gap-2">
              {trainingTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTrainingType(type)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    trainingType === type
                      ? 'bg-habit-supplements text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 力量训练相关 */}
          {(trainingType === '力量' || trainingType === '体态') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">组数</label>
                <input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">负重(kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                  inputMode="decimal"
                />
              </div>
            </div>
          )}

          {/* 有氧运动相关 */}
          {(trainingType === '步行' || trainingType === '骑行' || trainingType === '游泳' || trainingType === '跑步') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">距离(km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">消耗(kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                  inputMode="numeric"
                />
              </div>
            </div>
          )}

          {/* 通用信息 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">时长(分钟)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">体重(kg)</label>
              <input
                type="number"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* 感受 */}
          <div>
            <label className="text-sm font-medium mb-1 block">训练感受</label>
            <textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="记录你的训练感受..."
              className="w-full h-20 px-3 py-2 border rounded-[var(--radius-standard)] resize-none"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
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
