'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/components/providers/data-provider';
import type { BookRecord } from '@/types';

interface BookRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  editRecord?: BookRecord;
}

export function BookRecordModal({ isOpen, onClose, date, editRecord }: BookRecordModalProps) {
  const { addBookRecord, updateBookRecord } = useData();
  
  const [bookTitle, setBookTitle] = useState(editRecord?.bookTitle || '');
  const [author, setAuthor] = useState(editRecord?.author || '');
  const [pagesRead, setPagesRead] = useState(editRecord?.pagesRead || 0);
  const [totalPages, setTotalPages] = useState(editRecord?.totalPages || 0);
  const [readingTime, setReadingTime] = useState(editRecord?.readingTime || 0);
  const [notes, setNotes] = useState(editRecord?.notes || '');

  const handleSubmit = () => {
    if (!bookTitle.trim()) return;

    if (editRecord) {
      updateBookRecord(editRecord.id, {
        bookTitle,
        author: author || undefined,
        pagesRead,
        totalPages: totalPages || undefined,
        readingTime: readingTime || undefined,
        notes: notes || undefined,
      });
    } else {
      addBookRecord({
        date,
        bookTitle,
        author: author || undefined,
        pagesRead,
        totalPages: totalPages || undefined,
        readingTime: readingTime || undefined,
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
            <span>📚</span>
            <span>{editRecord ? '编辑阅读记录' : '新增阅读记录'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="bookTitle">书名</Label>
            <Input
              id="bookTitle"
              placeholder="例如：原子习惯"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="author">作者（可选）</Label>
            <Input
              id="author"
              placeholder="例如：James Clear"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pagesRead">今日页数</Label>
              <Input
                id="pagesRead"
                type="number"
                min={0}
                value={pagesRead}
                onChange={(e) => setPagesRead(Number(e.target.value))}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="totalPages">总页数（可选）</Label>
              <Input
                id="totalPages"
                type="number"
                min={0}
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="readingTime">时长(分钟)</Label>
              <Input
                id="readingTime"
                type="number"
                min={0}
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">阅读笔记（可选）</Label>
            <Textarea
              id="notes"
              placeholder="今日阅读心得..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!bookTitle.trim()}>
            {editRecord ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}