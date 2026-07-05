'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TimeStorage } from '@/lib/storage';
import type { FirstCategory } from '@/types';
import { FIRST_CATEGORIES, getSecondCategories, getThirdCategories, getCategoryColor } from '@/types';

interface TimeRecordModalProps {
  onClose: () => void;
  onSaved: () => void;
  editData?: {
    id: string;
    title: string;
    firstCategory: FirstCategory;
    secondCategory: string;
    thirdCategory?: string;
    startTime: string;
    endTime: string;
    note?: string;
  };
}

export function TimeRecordModal({ onClose, onSaved, editData }: TimeRecordModalProps) {
  const [title, setTitle] = useState(editData?.title || '');
  const [firstCategory, setFirstCategory] = useState<FirstCategory>(editData?.firstCategory || '工作事务');
  const [secondCategory, setSecondCategory] = useState(editData?.secondCategory || '');
  const [thirdCategory, setThirdCategory] = useState(editData?.thirdCategory || '');
  const [startTime, setStartTime] = useState(editData?.startTime ? new Date(editData.startTime).toTimeString().slice(0, 5) : '');
  const [endTime, setEndTime] = useState(editData?.endTime ? new Date(editData.endTime).toTimeString().slice(0, 5) : '');
  const [note, setNote] = useState(editData?.note || '');

  const secondCategories = getSecondCategories(firstCategory);
  const thirdCategories = getThirdCategories(firstCategory, secondCategory);

  const handleFirstCategoryChange = (cat: FirstCategory) => {
    setFirstCategory(cat);
    setSecondCategory('');
    setThirdCategory('');
  };

  const handleSave = () => {
    if (!title.trim() || !startTime || !endTime) return;

    const today = new Date().toISOString().split('T')[0];
    const startDateTime = `${today}T${startTime}:00`;
    const endDateTime = `${today}T${endTime}:00`;
    
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    if (editData) {
      TimeStorage.update(editData.id, {
        title,
        firstCategory,
        secondCategory: secondCategory || secondCategories[0] || '',
        thirdCategory: thirdCategory || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
        note: note || undefined
      });
    } else {
      TimeStorage.add({
        title,
        firstCategory,
        secondCategory: secondCategory || secondCategories[0] || '',
        thirdCategory: thirdCategory || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
        date: today,
        isPlanned: false,
        isCompleted: true,
        note: note || undefined
      });
    }

    onSaved();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? '编辑时间记录' : '新增时间记录'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="text-sm font-medium mb-1 block">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入活动标题"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
            />
          </div>

          {/* 一级分类 */}
          <div>
            <label className="text-sm font-medium mb-2 block">一级分类</label>
            <div className="flex flex-wrap gap-2">
              {FIRST_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleFirstCategoryChange(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    firstCategory === cat
                      ? 'text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={firstCategory === cat ? { backgroundColor: getCategoryColor(cat) } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 二级分类 */}
          {secondCategories.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">二级分类</label>
              <div className="flex flex-wrap gap-2">
                {secondCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSecondCategory(cat)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                      secondCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 三级分类 */}
          {thirdCategories.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">三级分类</label>
              <div className="flex flex-wrap gap-2">
                {thirdCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setThirdCategory(cat)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                      thirdCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 时间选择 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">开始时间</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">结束时间</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
              />
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="text-sm font-medium mb-1 block">备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选备注"
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
