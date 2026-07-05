'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookStorage } from '@/lib/storage';

interface BookRecordModalProps {
  onClose: () => void;
  onSaved: () => void;
  editData?: {
    id: string;
    bookName: string;
    author?: string;
    bookType?: string;
    startPage?: number;
    endPage?: number;
    note?: string;
    duration?: number;
  };
}

export function BookRecordModal({ onClose, onSaved, editData }: BookRecordModalProps) {
  const [bookName, setBookName] = useState(editData?.bookName || '');
  const [author, setAuthor] = useState(editData?.author || '');
  const [bookType, setBookType] = useState(editData?.bookType || '');
  const [startPage, setStartPage] = useState(editData?.startPage?.toString() || '');
  const [endPage, setEndPage] = useState(editData?.endPage?.toString() || '');
  const [duration, setDuration] = useState(editData?.duration?.toString() || '');
  const [note, setNote] = useState(editData?.note || '');

  const handleSave = () => {
    if (!bookName.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    if (editData) {
      BookStorage.update(editData.id, {
        bookName,
        author: author || undefined,
        bookType: bookType || undefined,
        startPage: startPage ? parseInt(startPage) : undefined,
        endPage: endPage ? parseInt(endPage) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        note: note || undefined
      });
    } else {
      BookStorage.add({
        bookName,
        author: author || undefined,
        bookType: bookType || undefined,
        startPage: startPage ? parseInt(startPage) : undefined,
        endPage: endPage ? parseInt(endPage) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        note: note || undefined,
        date: today
      });
    }

    onSaved();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? '编辑阅读记录' : '新增阅读记录'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 书名 */}
          <div>
            <label className="text-sm font-medium mb-1 block">书名 *</label>
            <input
              type="text"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="请输入书名"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
            />
          </div>

          {/* 作者 */}
          <div>
            <label className="text-sm font-medium mb-1 block">作者</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="请输入作者"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="text-sm font-medium mb-1 block">类型</label>
            <input
              type="text"
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              placeholder="如：小说、技术、历史等"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
            />
          </div>

          {/* 页码 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">起始页</label>
              <input
                type="number"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">结束页</label>
              <input
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* 阅读时长 */}
          <div>
            <label className="text-sm font-medium mb-1 block">阅读时长（分钟）</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
              inputMode="numeric"
            />
          </div>

          {/* 笔记 */}
          <div>
            <label className="text-sm font-medium mb-1 block">笔记</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录你的阅读心得..."
              className="w-full h-24 px-3 py-2 border rounded-[var(--radius-standard)] resize-none"
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
