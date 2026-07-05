'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AccountStorage } from '@/lib/storage';
import type { AccountType, ExpenseFirstCategory, IncomeCategory, AccountTag } from '@/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, autoDetectTag } from '@/types';

interface AccountRecordModalProps {
  onClose: () => void;
  onSaved: () => void;
  editData?: {
    id: string;
    type: AccountType;
    firstCategory: string;
    secondCategory?: string;
    amount: number;
    note?: string;
  };
}

export function AccountRecordModal({ onClose, onSaved, editData }: AccountRecordModalProps) {
  const [type, setType] = useState<AccountType>(editData?.type || 'expense');
  const [firstCategory, setFirstCategory] = useState<string>(editData?.firstCategory || '饮食餐饮');
  const [secondCategory, setSecondCategory] = useState(editData?.secondCategory || '');
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [note, setNote] = useState(editData?.note || '');

  const expenseCategories = Object.keys(EXPENSE_CATEGORIES) as ExpenseFirstCategory[];
  const incomeCategories = INCOME_CATEGORIES;

  const currentSecondCategories = type === 'expense' 
    ? EXPENSE_CATEGORIES[firstCategory as ExpenseFirstCategory] || []
    : [];

  const handleTypeChange = (newType: AccountType) => {
    setType(newType);
    if (newType === 'expense') {
      setFirstCategory('饮食餐饮');
    } else {
      setFirstCategory('工资收入');
    }
    setSecondCategory('');
  };

  const handleFirstCategoryChange = (cat: string) => {
    setFirstCategory(cat);
    setSecondCategory('');
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    const tag = autoDetectTag(firstCategory, note);

    if (editData) {
      AccountStorage.update(editData.id, {
        type,
        firstCategory: firstCategory as ExpenseFirstCategory | IncomeCategory,
        secondCategory: secondCategory || undefined,
        amount: parseFloat(amount),
        note: note || undefined,
        tag
      });
    } else {
      AccountStorage.add({
        date: today,
        type,
        firstCategory: firstCategory as ExpenseFirstCategory | IncomeCategory,
        secondCategory: secondCategory || undefined,
        amount: parseFloat(amount),
        note: note || undefined,
        tag
      });
    }

    onSaved();
  };

  const tagColors: Record<AccountTag, string> = {
    '刚需消费': 'var(--tag-necessary)',
    '品质消费': 'var(--tag-quality)',
    '冲动消费': 'var(--tag-impulse)'
  };

  const currentTag = autoDetectTag(firstCategory, note);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? '编辑记账' : '新增记账'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 收入/支出切换 */}
          <div className="flex gap-2 p-1 bg-muted rounded-[var(--radius-capsule)]">
            <button
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 text-sm rounded-[var(--radius-capsule)] transition-all ${
                type === 'expense'
                  ? 'bg-account-expense text-white'
                  : 'text-muted-foreground'
              }`}
            >
              支出
            </button>
            <button
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 text-sm rounded-[var(--radius-capsule)] transition-all ${
                type === 'income'
                  ? 'bg-account-income text-white'
                  : 'text-muted-foreground'
              }`}
            >
              收入
            </button>
          </div>

          {/* 金额 */}
          <div>
            <label className="text-sm font-medium mb-1 block">金额 *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-8 pr-3 text-xl font-medium border rounded-[var(--radius-standard)]"
                inputMode="decimal"
                autoFocus
              />
            </div>
          </div>

          {/* 一级分类 */}
          <div>
            <label className="text-sm font-medium mb-2 block">分类</label>
            <div className="flex flex-wrap gap-2">
              {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                <button
                  key={cat}
                  onClick={() => handleFirstCategoryChange(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    firstCategory === cat
                      ? type === 'expense'
                        ? 'bg-account-expense text-white'
                        : 'bg-account-income text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 二级分类（仅支出） */}
          {type === 'expense' && currentSecondCategories.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">细分</label>
              <div className="flex flex-wrap gap-2">
                {currentSecondCategories.map(cat => (
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

          {/* 标签预览 */}
          {type === 'expense' && (
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-[var(--radius-standard)]">
              <span className="text-xs text-muted-foreground">自动标签：</span>
              <span
                className="px-2 py-0.5 text-xs rounded-full text-white"
                style={{ backgroundColor: tagColors[currentTag] }}
              >
                {currentTag}
              </span>
            </div>
          )}

          {/* 备注 */}
          <div>
            <label className="text-sm font-medium mb-1 block">备注</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选备注"
              className="w-full h-10 px-3 border rounded-[var(--radius-standard)]"
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
