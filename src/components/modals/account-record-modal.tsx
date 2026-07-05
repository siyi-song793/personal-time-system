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
    account?: string;
    note?: string;
  };
}

// 支付账户选项
const ACCOUNT_OPTIONS = ['微信', '支付宝', '银行卡', '现金', '信用卡', '其他'];

// 快捷模板
const QUICK_TEMPLATES = [
  { label: '早餐', amount: 15, category: '饮食餐饮' as ExpenseFirstCategory },
  { label: '午餐', amount: 25, category: '饮食餐饮' as ExpenseFirstCategory },
  { label: '晚餐', amount: 30, category: '饮食餐饮' as ExpenseFirstCategory },
  { label: '交通', amount: 10, category: '外出出行' as ExpenseFirstCategory },
  { label: '咖啡', amount: 20, category: '饮食餐饮' as ExpenseFirstCategory },
];

export function AccountRecordModal({ onClose, onSaved, editData }: AccountRecordModalProps) {
  const [type, setType] = useState<AccountType>(editData?.type || 'expense');
  const [firstCategory, setFirstCategory] = useState<string>(editData?.firstCategory || '饮食餐饮');
  const [secondCategory, setSecondCategory] = useState(editData?.secondCategory || '');
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [account, setAccount] = useState(editData?.account || '微信');
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

  // 应用快捷模板
  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setType('expense');
    setFirstCategory(template.category);
    setAmount(template.amount.toString());
    setSecondCategory('');
  };

  // 必填校验
  const isValid = amount && parseFloat(amount) > 0 && firstCategory;

  const handleSave = () => {
    if (!isValid) return;

    const today = new Date().toISOString().split('T')[0];
    const tag = autoDetectTag(firstCategory, note);

    if (editData) {
      AccountStorage.update(editData.id, {
        type,
        firstCategory: firstCategory as ExpenseFirstCategory | IncomeCategory,
        secondCategory: secondCategory || undefined,
        amount: parseFloat(amount),
        account,
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
        account,
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-center">
            {editData ? '编辑记账' : '新增记账'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 收支类型 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">收支类型 *</label>
            <div className="flex gap-2 p-1 bg-muted/50 rounded-[var(--radius-capsule)]">
              <button
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 py-2.5 text-sm rounded-[var(--radius-capsule)] transition-all font-medium ${
                  type === 'expense'
                    ? 'bg-account-expense text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground/80'
                }`}
              >
                支出
              </button>
              <button
                onClick={() => handleTypeChange('income')}
                className={`flex-1 py-2.5 text-sm rounded-[var(--radius-capsule)] transition-all font-medium ${
                  type === 'income'
                    ? 'bg-account-income text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground/80'
                }`}
              >
                收入
              </button>
            </div>
          </div>

          {/* 一级分类和二级分类 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">一级分类 *</label>
              <select
                value={firstCategory}
                onChange={(e) => handleFirstCategoryChange(e.target.value)}
                className="w-full h-11 px-3 border border-border/50 rounded-[var(--radius-standard)] bg-background focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              >
                {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">二级分类</label>
              <select
                value={secondCategory}
                onChange={(e) => setSecondCategory(e.target.value)}
                className="w-full h-11 px-3 border border-border/50 rounded-[var(--radius-standard)] bg-background focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                disabled={type === 'income' || currentSecondCategories.length === 0}
              >
                <option value="">请选择</option>
                {currentSecondCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 金额和支付账户 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">金额(元) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">¥</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 pl-7 pr-3 border border-border/50 rounded-[var(--radius-standard)] bg-background focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  inputMode="decimal"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">支付账户 *</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full h-11 px-3 border border-border/50 rounded-[var(--radius-standard)] bg-background focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              >
                {ACCOUNT_OPTIONS.map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 消费标签 */}
          {type === 'expense' && (
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">消费标签</label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-[var(--radius-standard)]">
                <span className="text-xs text-muted-foreground">自动识别：</span>
                <span
                  className="px-3 py-1 text-xs rounded-[var(--radius-pill)] text-white font-medium"
                  style={{ backgroundColor: tagColors[currentTag] }}
                >
                  {currentTag}
                </span>
              </div>
            </div>
          )}

          {/* 备注 */}
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选备注..."
              className="w-full h-16 px-4 py-3 border border-border/50 rounded-[var(--radius-standard)] bg-background resize-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* 快捷模板 */}
          {type === 'expense' && !editData && (
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground/80">快捷模板</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map(template => (
                  <button
                    key={template.label}
                    onClick={() => applyTemplate(template)}
                    className="px-3 py-1.5 text-xs rounded-[var(--radius-pill)] bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground/80 transition-all"
                  >
                    {template.label} ¥{template.amount}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSave} 
              className="flex-1 h-11 rounded-[var(--radius-pill)] bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
