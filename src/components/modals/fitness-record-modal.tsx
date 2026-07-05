'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FitnessStorage } from '@/lib/storage';

interface FitnessRecordModalProps {
  onClose: () => void;
  onSaved: () => void;
  editData?: {
    id: string;
    trainingType: string;
    subType?: string;
    intensity?: string;
    duration?: number;
    bodyWeight?: number;
    feeling?: string;
  };
}

// 训练类型与细分类型映射
const trainingTypeMap: Record<string, string[]> = {
  '有氧训练': ['跑步', '骑行', '游泳', '舞蹈', '球类'],
  '力量训练': ['上肢', '下肢', '核心', '全身'],
  '拉伸': ['全身拉伸', '瑜伽/普拉提', '筋膜放松', '静态拉伸', '动态热身'],
  '放松': ['全身拉伸', '瑜伽/普拉提', '筋膜放松', '静态拉伸', '动态热身'],
};

const intensityOptions = ['低', '中', '高', '极限'];

export function FitnessRecordModal({ onClose, onSaved, editData }: FitnessRecordModalProps) {
  const [trainingType, setTrainingType] = useState(editData?.trainingType || '');
  const [subType, setSubType] = useState(editData?.subType || '');
  const [intensity, setIntensity] = useState(editData?.intensity || '中');
  const [duration, setDuration] = useState(editData?.duration?.toString() || '');
  const [bodyWeight, setBodyWeight] = useState(editData?.bodyWeight?.toString() || '');
  const [feeling, setFeeling] = useState(editData?.feeling || '');

  // 获取当前训练类型的细分选项
  const subTypes = useMemo(() => {
    return trainingTypeMap[trainingType] || [];
  }, [trainingType]);

  // 切换训练类型时清空细分类型
  const handleTrainingTypeChange = (type: string) => {
    setTrainingType(type);
    setSubType('');
  };

  // 必填校验
  const isValid = trainingType && subType && intensity;

  const handleSave = () => {
    if (!isValid) return;

    const today = new Date().toISOString().split('T')[0];

    const recordData = {
      trainingType,
      subType,
      intensity,
      duration: duration ? parseInt(duration) : undefined,
      bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
      feeling: feeling || undefined,
      date: today,
    };

    if (editData) {
      FitnessStorage.update(editData.id, recordData);
    } else {
      FitnessStorage.add(recordData);
    }

    onSaved();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center">
            {editData ? '编辑健身记录' : '新增健身记录'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 训练类型 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">训练类型 *</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(trainingTypeMap).map(type => (
                <button
                  key={type}
                  onClick={() => handleTrainingTypeChange(type)}
                  className={`px-4 py-2 text-sm rounded-[var(--radius-pill)] transition-all ${
                    trainingType === type
                      ? 'bg-habit-supplements text-white font-medium shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 细分类型 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">细分类型 *</label>
            <div className="flex flex-wrap gap-2">
              {subTypes.length === 0 ? (
                <span className="text-sm text-muted-foreground/60">请先选择训练类型</span>
              ) : (
                subTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSubType(type)}
                    disabled={!trainingType}
                    className={`px-4 py-2 text-sm rounded-[var(--radius-pill)] transition-all ${
                      subType === type
                        ? 'bg-habit-supplements text-white font-medium shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {type}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 时长 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">时长（分钟）</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="请输入时长"
              className="w-full h-11 px-4 border border-border/50 rounded-[var(--radius-standard)] bg-background focus:border-habit-supplements/50 focus:ring-1 focus:ring-habit-supplements/20 transition-all"
              inputMode="numeric"
            />
          </div>

          {/* 每日体重 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">每日体重（kg）</label>
            <input
              type="number"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              placeholder="请输入体重"
              className="w-full h-11 px-4 border border-border/50 rounded-[var(--radius-standard)] bg-background focus:border-habit-supplements/50 focus:ring-1 focus:ring-habit-supplements/20 transition-all"
              inputMode="decimal"
            />
          </div>

          {/* 训练强度 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">训练强度 *</label>
            <div className="flex gap-2">
              {intensityOptions.map(level => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`flex-1 py-2.5 text-sm rounded-[var(--radius-pill)] transition-all ${
                    intensity === level
                      ? 'bg-habit-supplements text-white font-medium shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">备注</label>
            <textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="记录训练感受..."
              className="w-full h-20 px-4 py-3 border border-border/50 rounded-[var(--radius-standard)] bg-background resize-none focus:border-habit-supplements/50 focus:ring-1 focus:ring-habit-supplements/20 transition-all"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSave} 
              className="flex-1 h-11 rounded-[var(--radius-pill)] bg-habit-supplements hover:bg-habit-supplements/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isValid}
            >
              保存
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-11 rounded-[var(--radius-pill)] border-border/50"
            >
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
