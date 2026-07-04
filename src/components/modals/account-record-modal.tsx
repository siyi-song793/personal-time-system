'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/components/providers/data-provider';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, type AccountType, type AccountRecord } from '@/types';

interface AccountRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  editRecord?: AccountRecord;
}

export function AccountRecordModal({ isOpen, onClose, date, editRecord }: AccountRecordModalProps) {
  const { addAccountRecord, updateAccountRecord } = useData();
  
  const [type, setType] = useState<AccountType>(editRecord?.type || 'expense');
  const [category, setCategory] = useState<string>(editRecord?.category || 'food');
  const [amount, setAmount] = useState(editRecord?.amount || 0);
  const [description, setDescription] = useState(editRecord?.description || '');

  const handleSubmit = () => {
    if (amount <= 0) return;

    if (editRecord) {
      updateAccountRecord(editRecord.id, {
        type,
        category: category as any,
        amount,
        description: description || undefined,
      });
    } else {
      addAccountRecord({
        date,
        type,
        category: category as any,
        amount,
        description: description || undefined,
      });
    }

    onClose();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>💰</span>
            <span>{editRecord ? '编辑记账' : '新增记账'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs
            value={type}
            onValueChange={(value) => {
              setType(value as AccountType);
              // 切换类型时重置分类
              setCategory(value === 'income' ? 'salary' : 'food');
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="data-[state=active]:text-[var(--expense-orange)]">
                支出
              </TabsTrigger>
              <TabsTrigger value="income" className="data-[state=active]:text-[var(--income-mint)]">
                收入
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <Label htmlFor="category">{type === 'income' ? '收入分类' : '支出分类'}</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span>{config.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">金额（元）</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="font-mono"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="description">备注（可选）</Label>
            <Textarea
              id="description"
              placeholder="消费说明..."
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
          <Button
            onClick={handleSubmit}
            disabled={amount <= 0}
            style={{
              backgroundColor: type === 'income' ? 'var(--income-mint)' : 'var(--expense-orange)',
            }}
          >
            {editRecord ? '保存' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}