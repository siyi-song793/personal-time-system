'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookStorage, TimeStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';

// 阅读状态选项
const READING_STATUS = [
  { value: 'reading', label: '在读', color: 'bg-book/10 text-book border-book/30' },
  { value: 'finished', label: '已读完', color: 'bg-habit/10 text-habit border-habit/30' },
  { value: 'want', label: '想读', color: 'bg-muted text-muted-foreground border-border' }
];

// 读书类型分类
const BOOK_TYPES = [
  '文学小说', '历史传记', '哲学心理', '职场成长', '商业管理',
  '科技科普', '艺术设计', '生活健康', '社科人文', '其他'
];

// 快捷模板
const BOOK_TEMPLATES = [
  { bookName: '《活着》', author: '余华', bookType: '文学小说' },
  { bookName: '《人类简史》', author: '尤瓦尔·赫拉利', bookType: '历史传记' },
  { bookName: '《思考，快与慢》', author: '丹尼尔·卡尼曼', bookType: '哲学心理' }
];

interface BookRecordModalProps {
  onClose: () => void;
  onSaved: () => void;
  editData?: {
    id: string;
    bookName: string;
    author?: string;
    bookType?: string;
    readingStatus?: 'reading' | 'finished' | 'want';
    progress?: string;
    duration?: number;
    note?: string;
  };
}

export function BookRecordModal({ onClose, onSaved, editData }: BookRecordModalProps) {
  const [bookName, setBookName] = useState(editData?.bookName || '');
  const [author, setAuthor] = useState(editData?.author || '');
  const [bookType, setBookType] = useState(editData?.bookType || '');
  const [readingStatus, setReadingStatus] = useState<'reading' | 'finished' | 'want'>(
    editData?.readingStatus || 'reading'
  );
  const [progress, setProgress] = useState(editData?.progress || '');
  const [duration, setDuration] = useState(editData?.duration?.toString() || '');
  const [note, setNote] = useState(editData?.note || '');
  const [showWxImport, setShowWxImport] = useState(false);

  const isValid = bookName.trim() && readingStatus;

  const handleSave = () => {
    if (!isValid) return;

    const today = new Date().toISOString().split('T')[0];
    const durationMinutes = duration ? parseInt(duration) : undefined;

    if (editData) {
      BookStorage.update(editData.id, {
        bookName,
        author: author || undefined,
        bookType: bookType || undefined,
        readingStatus,
        progress: progress || undefined,
        duration: durationMinutes,
        note: note || undefined
      });
    } else {
      // 添加读书记录
      const bookRecord = BookStorage.add({
        bookName,
        author: author || undefined,
        bookType: bookType || undefined,
        readingStatus,
        progress: progress || undefined,
        duration: durationMinutes,
        note: note || undefined,
        date: today
      });

      // 自动创建时间记录，分类为学习成长-认知提升-阅读
      if (durationMinutes) {
        const now = new Date();
        const startTime = new Date(now.getTime() - durationMinutes * 60000);
        TimeStorage.add({
          title: `阅读：${bookName}`,
          firstCategory: '学习成长',
          secondCategory: '认知提升',
          date: today,
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
          duration: durationMinutes,
          isPlanned: false,
          isCompleted: true,
          note: note || undefined,
          tags: ['阅读', bookRecord.id]
        });
      }
    }

    onSaved();
  };

  const handleTemplateSelect = (template: typeof BOOK_TEMPLATES[0]) => {
    setBookName(template.bookName);
    setAuthor(template.author);
    setBookType(template.bookType);
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? '编辑阅读记录' : '新增阅读记录'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 功能按钮区 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex-1 opacity-50 cursor-not-allowed"
              title="微信读书导入功能暂未开放"
            >
              微信读书导入
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect(BOOK_TEMPLATES[0])}
              className="flex-1"
            >
              快捷模板
            </Button>
          </div>

          {/* 书籍名称（必填） */}
          <div>
            <label className="text-sm font-medium mb-1 block">书籍名称 *</label>
            <input
              type="text"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="请输入书籍名称"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)] bg-background"
            />
          </div>

          {/* 作者（选填） */}
          <div>
            <label className="text-sm font-medium mb-1 block">作者</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="请输入作者"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)] bg-background"
            />
          </div>

          {/* 阅读状态（必填，胶囊单选） */}
          <div>
            <label className="text-sm font-medium mb-2 block">阅读状态 *</label>
            <div className="flex gap-2">
              {READING_STATUS.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setReadingStatus(status.value as 'reading' | 'finished' | 'want')}
                  className={cn(
                    'flex-1 h-9 rounded-[var(--radius-capsule)] border text-sm transition-all',
                    readingStatus === status.value
                      ? status.color
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* 读书类型（选填，胶囊单选） */}
          <div>
            <label className="text-sm font-medium mb-2 block">读书类型</label>
            <div className="flex flex-wrap gap-2">
              {BOOK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBookType(bookType === type ? '' : type)}
                  className={cn(
                    'h-8 px-3 rounded-[var(--radius-capsule)] border text-sm transition-all',
                    bookType === type
                      ? 'bg-book/10 text-book border-book/30'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 阅读进度 + 单次阅读时长（双栏等宽） */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">阅读进度 *</label>
              <input
                type="text"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="页数或百分比"
                className="w-full h-10 px-3 border rounded-[var(--radius-standard)] bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">阅读时长</label>
              <div className="relative">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 pr-10 border rounded-[var(--radius-standard)] bg-background"
                  inputMode="numeric"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  分钟
                </span>
              </div>
            </div>
          </div>

          {/* 读书笔记/感悟（选填） */}
          <div>
            <label className="text-sm font-medium mb-1 block">读书笔记/感悟</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录摘抄、阅读感悟..."
              className="w-full h-24 px-3 py-2 border rounded-[var(--radius-standard)] bg-background resize-none"
            />
          </div>

          {/* 底部操作区 */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={!isValid} className="flex-1 bg-book hover:bg-book/90">
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
