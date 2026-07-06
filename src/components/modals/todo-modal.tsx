'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  type TodoItem,
  type Priority,
  type TaskTimeType,
  type PlanLevel,
  type ReminderType,
  type RepeatType,
  type FirstCategory,
  getSecondCategories,
  getThirdCategories,
  PRIORITY_CONFIG,
  FIRST_CATEGORIES,
  PLAN_LEVEL_CONFIG,
  CATEGORY_TREE
} from '@/types';
import { X } from 'lucide-react';

interface TodoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: TodoItem | null;
  onSave: (data: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  defaultDate?: string;
}

export function TodoModal({ open, onOpenChange, todo, onSave, defaultDate }: TodoModalProps) {
  const isEdit = !!todo;

  // 表单状态
  const [title, setTitle] = useState('');
  const [firstCategory, setFirstCategory] = useState<FirstCategory | ''>('');
  const [secondCategory, setSecondCategory] = useState('');
  const [thirdCategory, setThirdCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [taskTimeType, setTaskTimeType] = useState<TaskTimeType>('allDay');
  const [planLevel, setPlanLevel] = useState<PlanLevel>('today');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [reminder, setReminder] = useState<ReminderType>('none');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [note, setNote] = useState('');

  // 校验状态
  const [timeError, setTimeError] = useState('');

  // 编辑模式回填
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setFirstCategory(todo.firstCategory);
      setSecondCategory(todo.secondCategory);
      setThirdCategory(todo.thirdCategory || '');
      setPriority(todo.priority);
      setTaskTimeType(todo.taskTimeType);
      setPlanLevel(todo.planLevel);
      setStartTime(todo.startTime || '');
      setEndTime(todo.endTime || '');
      setDate(todo.date);
      setReminder(todo.reminder || 'none');
      setRepeat(todo.repeat || 'none');
      setNote(todo.note || '');
    } else {
      // 重置表单
      setTitle('');
      setFirstCategory('');
      setSecondCategory('');
      setThirdCategory('');
      setPriority('normal');
      setTaskTimeType('allDay');
      setPlanLevel('today');
      setStartTime('');
      setEndTime('');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setReminder('none');
      setRepeat('none');
      setNote('');
    }
  }, [todo, defaultDate, open]);

  // 时间校验
  useEffect(() => {
    if (taskTimeType === 'fixedTime' && startTime && endTime) {
      if (endTime <= startTime) {
        setTimeError('结束时间必须晚于开始时间');
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [startTime, endTime, taskTimeType]);

  // 归属计划变更时，强制全天任务
  useEffect(() => {
    if (planLevel !== 'today') {
      setTaskTimeType('allDay');
    }
  }, [planLevel]);

  // 二级分类列表
  const secondCategories = firstCategory ? getSecondCategories(firstCategory) : [];
  // 三级分类列表
  const thirdCategories = firstCategory && secondCategory ? getThirdCategories(firstCategory, secondCategory) : [];
  const thirdRequired = thirdCategories.length > 0;

  // 是否可以保存
  const canSave =
    title.trim() !== '' &&
    firstCategory !== '' &&
    secondCategory !== '' &&
    (!thirdRequired || thirdCategory !== '') &&
    (taskTimeType === 'allDay' || (startTime && endTime && !timeError));

  // 提交
  const handleSubmit = () => {
    if (!canSave || !firstCategory) return;

    onSave({
      title: title.trim(),
      firstCategory,
      secondCategory,
      thirdCategory: thirdRequired ? thirdCategory : undefined,
      priority,
      taskTimeType,
      planLevel,
      startTime: taskTimeType === 'fixedTime' ? startTime : undefined,
      endTime: taskTimeType === 'fixedTime' ? endTime : undefined,
      date,
      reminder,
      repeat,
      isCompleted: todo?.isCompleted || false,
      completedAt: todo?.completedAt,
      note: note.trim() || undefined
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-medium">
            {isEdit ? '编辑任务' : '新增任务'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 1. 任务标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              任务标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="请输入任务标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 2. 一级分类、二级分类、三级分类 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>
                一级分类 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={firstCategory}
                onValueChange={(value) => {
                  setFirstCategory(value as FirstCategory);
                  setSecondCategory('');
                  setThirdCategory('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择一级分类" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_TREE) as FirstCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                二级分类 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={secondCategory}
                onValueChange={(value) => {
                  setSecondCategory(value);
                  setThirdCategory('');
                }}
                disabled={!firstCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder={firstCategory ? '选择二级分类' : '请先选择一级分类'} />
                </SelectTrigger>
                <SelectContent>
                  {secondCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                三级分类 {thirdRequired && <span className="text-destructive">*</span>}
              </Label>
              <Select
                value={thirdCategory}
                onValueChange={setThirdCategory}
                disabled={!firstCategory || !secondCategory || !thirdRequired}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!secondCategory ? '请先选二级' : thirdRequired ? '选择三级分类' : '无需选择'} />
                </SelectTrigger>
                <SelectContent>
                  {thirdCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3. 重要程度 */}
          <div className="space-y-2">
            <Label>
              重要程度 <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(
                ([key, config]) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    className={cn(
                      'flex-1 h-10 gap-2',
                      priority === key && 'border-2 font-medium'
                    )}
                    style={
                      priority === key
                        ? { borderColor: config.color, color: config.color }
                        : undefined
                    }
                    onClick={() => setPriority(key)}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* 4. 任务时段类型 */}
          <div className="space-y-2">
            <Label>
              任务时段类型 <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className={cn('flex-1 h-10', taskTimeType === 'allDay' && 'border-primary bg-primary/10')}
                onClick={() => setTaskTimeType('allDay')}
              >
                全天任务
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn('flex-1 h-10', taskTimeType === 'fixedTime' && 'border-primary bg-primary/10')}
                onClick={() => setTaskTimeType('fixedTime')}
                disabled={planLevel !== 'today'}
              >
                固定时段
              </Button>
            </div>
            {planLevel !== 'today' && (
              <p className="text-xs text-muted-foreground">
                周/月/年度计划仅支持全天任务
              </p>
            )}
          </div>

          {/* 5. 归属计划层级 */}
          <div className="space-y-2">
            <Label>
              归属计划 <span className="text-destructive">*</span>
            </Label>
            <Select value={planLevel} onValueChange={(value) => setPlanLevel(value as PlanLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PLAN_LEVEL_CONFIG) as [PlanLevel, typeof PLAN_LEVEL_CONFIG[PlanLevel]][]).map(
                  ([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 6. 起止时间（固定时段时显示） */}
          {taskTimeType === 'fixedTime' && planLevel === 'today' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>开始时间</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>结束时间</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              {timeError && (
                <p className="col-span-2 text-xs text-destructive">{timeError}</p>
              )}
            </div>
          )}

          {/* 7. 提醒设置 */}
          <div className="space-y-2">
            <Label>提醒设置</Label>
            <Select value={reminder} onValueChange={(value) => setReminder(value as ReminderType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不提醒</SelectItem>
                <SelectItem value="date">日期提醒</SelectItem>
                {taskTimeType === 'fixedTime' && planLevel === 'today' && (
                  <>
                    <SelectItem value="10min">提前10分钟</SelectItem>
                    <SelectItem value="30min">提前30分钟</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 8. 重复周期 */}
          <div className="space-y-2">
            <Label>重复周期</Label>
            <Select value={repeat} onValueChange={(value) => setRepeat(value as RepeatType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不重复</SelectItem>
                <SelectItem value="daily">每日</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 9. 备注 */}
          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea
              placeholder="补充说明、地点、物料清单等"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* 10. 底部操作按钮 */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            className="flex-1 h-11"
            onClick={handleSubmit}
            disabled={!canSave}
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
