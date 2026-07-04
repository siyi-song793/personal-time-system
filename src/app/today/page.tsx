'use client';

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/components/providers/data-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HabitUpdateModal } from '@/components/modals/habit-update-modal';
import { BookRecordModal } from '@/components/modals/book-record-modal';
import { FitnessRecordModal } from '@/components/modals/fitness-record-modal';
import { AccountRecordModal } from '@/components/modals/account-record-modal';
import { HABIT_CONFIGS, type TodoItem, type HabitDaily, type HabitType } from '@/types';

// 图标组件
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}

export default function TodayPage() {
  const {
    todos,
    habits,
    bookRecords,
    fitnessRecords,
    currentDate,
    initTodayHabits,
    addTodo,
    toggleTodoComplete,
    deleteTodo,
    updateHabitProgress,
  } = useData();

  // 初始化今日习惯
  useEffect(() => {
    initTodayHabits(currentDate);
  }, [currentDate, initTodayHabits]);

  // 弹窗状态
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // 新待办输入
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // 今日数据
  const todayTodos = useMemo(() => {
    return todos.filter(t => t.date === currentDate);
  }, [todos, currentDate]);

  const todayHabits = useMemo(() => {
    return habits.filter(h => h.date === currentDate);
  }, [habits, currentDate]);

  const todayBooks = useMemo(() => {
    return bookRecords.filter(b => b.date === currentDate);
  }, [bookRecords, currentDate]);

  const todayFitness = useMemo(() => {
    return fitnessRecords.filter(f => f.date === currentDate);
  }, [fitnessRecords, currentDate]);

  // 完成率统计
  const todoCompleteRate = useMemo(() => {
    if (todayTodos.length === 0) return 0;
    return Math.round((todayTodos.filter(t => t.isCompleted).length / todayTodos.length) * 100);
  }, [todayTodos]);

  const habitCompleteRate = useMemo(() => {
    if (todayHabits.length === 0) return 0;
    return Math.round((todayHabits.filter(h => h.isCompleted).length / todayHabits.length) * 100);
  }, [todayHabits]);

  // 添加待办
  const handleAddTodo = () => {
    if (!newTodoTitle.trim()) return;
    
    addTodo({
      date: currentDate,
      title: newTodoTitle.trim(),
      isCompleted: false,
      priority: newTodoPriority,
    });
    
    setNewTodoTitle('');
    setNewTodoPriority('medium');
  };

  // 日期显示
  const dateDisplay = useMemo(() => {
    const date = new Date(currentDate);
    return {
      full: `${date.getMonth() + 1}月${date.getDate()}日`,
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
    };
  }, [currentDate]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        {/* 页面标题 */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-foreground">
                {dateDisplay.full}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {dateDisplay.weekday} · 待办事项与习惯追踪
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                待办 {todoCompleteRate}%
              </Badge>
              <Badge className="text-xs font-mono bg-[var(--habit-complete)]">
                习惯 {habitCompleteRate}%
              </Badge>
            </div>
          </div>
        </header>

        {/* 三项习惯卡片 */}
        <Card className="mb-4 p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">今日习惯</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['water', 'supplement', 'journal'] as const).map((habitType) => {
              const habit = todayHabits.find((h: HabitDaily) => h.habitType === habitType);
              const config = HABIT_CONFIGS[habitType];
              const completed = habit?.completed || 0;
              const target = config.target;
              const percent = Math.min((completed / target) * 100, 100);
              const isComplete = habit?.isCompleted || false;

              return (
                <button
                  key={habitType}
                  onClick={() => setActiveModal(`habit-${habitType}`)}
                  className={`habit-card p-3 rounded-lg border-2 transition-all clickable ${
                    isComplete
                      ? 'border-[var(--habit-complete)] bg-[var(--habit-complete)]/10'
                      : 'border-border bg-background hover:border-[var(--habit-complete)]/50'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">{config.icon}</span>
                    <p className="text-sm font-medium text-foreground">{config.name}</p>
                    
                    {/* 进度条 */}
                    <div className="habit-progress mt-2">
                      <div
                        className="h-full rounded-full bg-[var(--habit-complete)] transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    
                    <p className="text-xs font-mono text-muted-foreground mt-2">
                      {completed}/{target}{config.unit}
                    </p>
                    
                    {isComplete && (
                      <p className="text-xs text-[var(--habit-complete)] mt-1">✓ 已完成</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 专项记录快捷入口 */}
        <Card className="mb-4 p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">专项记录</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setActiveModal('book')}
              className="p-3 rounded-lg border border-border hover:border-[var(--reading-amber)] bg-[var(--reading-amber)]/5 transition-colors clickable text-center"
            >
              <span className="text-2xl mb-1 block">📚</span>
              <p className="text-xs font-medium">阅读</p>
              {todayBooks.length > 0 && (
                <Badge variant="outline" className="text-xs mt-1 border-[var(--reading-amber)]">
                  {todayBooks.reduce((sum, b) => sum + b.pagesRead, 0)}页
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setActiveModal('fitness')}
              className="p-3 rounded-lg border border-border hover:border-[var(--fitness-coral)] bg-[var(--fitness-coral)]/5 transition-colors clickable text-center"
            >
              <span className="text-2xl mb-1 block">💪</span>
              <p className="text-xs font-medium">健身</p>
              {todayFitness.length > 0 && (
                <Badge variant="outline" className="text-xs mt-1 border-[var(--fitness-coral)]">
                  {todayFitness.reduce((sum, f) => sum + f.duration, 0)}分钟
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setActiveModal('account')}
              className="p-3 rounded-lg border border-border hover:border-[var(--expense-orange)] bg-[var(--expense-orange)]/5 transition-colors clickable text-center"
            >
              <span className="text-2xl mb-1 block">💰</span>
              <p className="text-xs font-medium">记账</p>
            </button>
          </div>
        </Card>

        {/* 待办事项 */}
        <Card className="mb-4">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">待办事项</h3>
          </div>

          {/* 新增待办输入 */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                placeholder="添加新待办..."
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                className="flex-1"
              />
              
              <Select
                value={newTodoPriority}
                onValueChange={(value) => setNewTodoPriority(value as 'high' | 'medium' | 'low')}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="text-[var(--cinnabar-red)]">高</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="text-[var(--ink-blue)]">中</span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="text-muted-foreground">低</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button size="icon" onClick={handleAddTodo} disabled={!newTodoTitle.trim()}>
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 待办列表 */}
          <ScrollArea className="h-[calc(100vh-520px)] md:h-[400px]">
            <div className="p-2">
              {todayTodos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  今日暂无待办事项
                </div>
              ) : (
                <div className="space-y-1">
                  {/* 未完成 */}
                  {todayTodos
                    .filter(t => !t.isCompleted)
                    .sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((todo: TodoItem) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors group"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => toggleTodoComplete(todo.id)}
                        />
                        
                        <span className="flex-1 text-sm text-foreground">
                          {todo.title}
                        </span>
                        
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            todo.priority === 'high'
                              ? 'border-[var(--cinnabar-red)] text-[var(--cinnabar-red)]'
                              : todo.priority === 'medium'
                                ? 'border-[var(--ink-blue)] text-[var(--ink-blue)]'
                                : ''
                          }`}
                        >
                          {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                        </Badge>
                        
                        {todo.dueTime && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {todo.dueTime}
                          </span>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          <TrashIcon className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  
                  {/* 已完成 */}
                  {todayTodos.filter(t => t.isCompleted).length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground px-3 py-1">
                        已完成 ({todayTodos.filter(t => t.isCompleted).length})
                      </p>
                      
                      {todayTodos
                        .filter(t => t.isCompleted)
                        .map((todo: TodoItem) => (
                          <div
                            key={todo.id}
                            className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 transition-colors group"
                          >
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => toggleTodoComplete(todo.id)}
                            />
                            
                            <span className="flex-1 text-sm text-muted-foreground line-through">
                              {todo.title}
                            </span>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteTodo(todo.id)}
                            >
                              <TrashIcon className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* 今日统计 */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">今日完成度</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-mono font-bold text-[var(--ink-blue)]">
                {todayTodos.filter(t => t.isCompleted).length}/{todayTodos.length}
              </p>
              <p className="text-xs text-muted-foreground">待办</p>
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-[var(--habit-complete)]">
                {todayHabits.filter(h => h.isCompleted).length}/3
              </p>
              <p className="text-xs text-muted-foreground">习惯</p>
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-[var(--reading-amber)]">
                {todayBooks.length > 0 ? '✓' : '○'}
              </p>
              <p className="text-xs text-muted-foreground">阅读</p>
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-[var(--fitness-coral)]">
                {todayFitness.length > 0 ? '✓' : '○'}
              </p>
              <p className="text-xs text-muted-foreground">健身</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 弹窗 */}
      {activeModal?.startsWith('habit-') && (
        <HabitUpdateModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={currentDate}
          habitType={activeModal.split('-')[1] as HabitType}
        />
      )}
      
      {activeModal === 'book' && (
        <BookRecordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={currentDate}
        />
      )}
      
      {activeModal === 'fitness' && (
        <FitnessRecordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={currentDate}
        />
      )}
      
      {activeModal === 'account' && (
        <AccountRecordModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          date={currentDate}
        />
      )}
    </div>
  );
}