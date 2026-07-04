'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/components/providers/data-provider';
import { TIME_CATEGORIES, type TimeCategory } from '@/types';

interface TimeRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  editRecord?: {
    id: string;
    startTime: string;
    endTime: string;
    category: TimeCategory;
    title: string;
    description?: string;
  };
}

export function TimeRecordModal({ isOpen, onClose, date, editRecord }: TimeRecordModalProps) {
  const { addTimeRecord, updateTimeRecord } = useData();
  
  const [startTime, setStartTime] = useState(editRecord?.startTime || '09:00');
  const [endTime, setEndTime] = useState(editRecord?.endTime || '10:00');
  const [category, setCategory] = useState<TimeCategory>(editRecord?.category || 'work');
  const [title, setTitle] = useState(editRecord?.title || '');
  const [description, setDescription] = useState(editRecord?.description || '');

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (editRecord) {
      updateTimeRecord(editRecord.id, {
        startTime,
        endTime,
        category,
        title,
        description: description || undefined,
      });
    } else {
      addTimeRecord({
        date,
        startTime,
        endTime,
        category,
        title,
        description: description || undefined,
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md modal-content">
        <DialogHeader>
          <DialogTitle>
            {editRecord ? '编辑时间记录' : '新增时间记录'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">开始时间</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="endTime">结束时间</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">时间分类</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as TimeCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span>{config.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">事项标题</Label>
            <Input
              id="title"
              placeholder="例如：完成项目报告"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">备注（可选）</Label>
            <Textarea
              id="description"
              placeholder="补充说明..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {editRecord ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}