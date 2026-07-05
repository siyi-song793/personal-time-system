'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Book, Dumbbell, Wallet, Check, Trash2, Edit2 } from 'lucide-react';
import { TodoStorage, HabitStorage } from '@/lib/storage';
import type { TodoItem, HabitRecord, FirstCategory, HabitType } from '@/types';
import { getCategoryColor, HABIT_CONFIG, getSecondCategories, getThirdCategories } from '@/types';
import { TimeRecordModal } from '@/components/modals/time-record-modal';
import { BookRecordModal } from '@/components/modals/book-record-modal';
import { FitnessRecordModal } from '@/components/modals/fitness-record-modal';
import { AccountRecordModal } from '@/components/modals/account-record-modal';

export default function TodayPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [habitRecord, setHabitRecord] = useState<HabitRecord | null>(null);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 新增待办表单
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoFirstCat, setNewTodoFirstCat] = useState<FirstCategory>('工作事务');
  const [newTodoSecondCat, setNewTodoSecondCat] = useState('');
  const [newTodoThirdCat, setNewTodoThirdCat] = useState('');
  const [newTodoStartTime, setNewTodoStartTime] = useState('');
  const [newTodoEndTime, setNewTodoEndTime] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    loadData();
  }, [isClient]);

  const loadData = () => {
    const today = new Date().toISOString().split('T')[0];
    setTodos(TodoStorage.getByDate(today));
    setHabitRecord(HabitStorage.getOrCreateToday());
  };

  const handleAddTodo = () => {
    if (!newTodoTitle.trim()) return;
    
    const today = new Date().toISOString().split('T')[0];
    const startTime = newTodoStartTime ? `${today}T${newTodoStartTime}:00` : undefined;
    const endTime = newTodoEndTime ? `${today}T${newTodoEndTime}:00` : undefined;

    TodoStorage.add({
      title: newTodoTitle,
      firstCategory: newTodoFirstCat,
      secondCategory: newTodoSecondCat || getSecondCategories(newTodoFirstCat)[0] || '',
      thirdCategory: newTodoThirdCat || undefined,
      isCompleted: false,
      date: today,
      startTime,
      endTime
    });

    setNewTodoTitle('');
    setNewTodoStartTime('');
    setNewTodoEndTime('');
    setShowAddTodo(false);
    loadData();
  };

  const handleToggleComplete = (id: string) => {
    TodoStorage.toggleComplete(id);
    loadData();
  };

  const handleDeleteTodo = (id: string) => {
    TodoStorage.delete(id);
    loadData();
  };

  const handleUpdateHabit = (type: HabitType, value?: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (type === 'water' && value !== undefined) {
      HabitStorage.updateWater(today, value);
    } else if (type === 'supplements') {
      HabitStorage.toggleSupplements(today);
    } else if (type === 'journal') {
      HabitStorage.toggleJournal(today);
    }
    
    loadData();
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 周${weekdays[today.getDay()]}`;

  return (
    <div className="px-4 py-6 max-w-md mx-auto pb-24">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">{dateStr}</h1>
        <p className="text-sm text-muted-foreground">今日待办与习惯追踪</p>
      </div>

      {/* 三项习惯打卡 */}
      <Card className="p-4 mb-6">
        <h2 className="text-sm font-medium mb-3">今日习惯</h2>
        <div className="space-y-3">
          {/* 饮水 */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: HABIT_CONFIG.water.color }}
            >
              <span className="text-white text-xs">💧</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{HABIT_CONFIG.water.label}</div>
              <div className="text-xs text-muted-foreground">
                目标 {HABIT_CONFIG.water.target}ml
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={habitRecord?.water.amount || 0}
                onChange={(e) => handleUpdateHabit('water', parseInt(e.target.value) || 0)}
                className="w-16 h-8 px-2 text-sm text-center border rounded-[var(--radius-standard)]"
                inputMode="numeric"
              />
              <span className="text-xs text-muted-foreground">ml</span>
              {habitRecord?.water.completed && (
                <Check className="w-4 h-4 text-habit-water" />
              )}
            </div>
          </div>

          {/* 保健品 */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: HABIT_CONFIG.supplements.color }}
            >
              <span className="text-white text-xs">💊</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{HABIT_CONFIG.supplements.label}</div>
              <div className="text-xs text-muted-foreground">每日打卡</div>
            </div>
            <Button
              variant={habitRecord?.supplements.completed ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpdateHabit('supplements')}
              style={habitRecord?.supplements.completed ? { backgroundColor: HABIT_CONFIG.supplements.color } : {}}
            >
              {habitRecord?.supplements.completed ? '已完成' : '打卡'}
            </Button>
          </div>

          {/* 手帐 */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: HABIT_CONFIG.journal.color }}
            >
              <span className="text-white text-xs">📔</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{HABIT_CONFIG.journal.label}</div>
              <div className="text-xs text-muted-foreground">每日打卡</div>
            </div>
            <Button
              variant={habitRecord?.journal.completed ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpdateHabit('journal')}
              style={habitRecord?.journal.completed ? { backgroundColor: HABIT_CONFIG.journal.color } : {}}
            >
              {habitRecord?.journal.completed ? '已完成' : '打卡'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 待办事项 */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">待办事项</h2>
          <Button
            size="sm"
            onClick={() => setShowAddTodo(true)}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            添加
          </Button>
        </div>

        {/* 添加待办表单 */}
        {showAddTodo && (
          <div className="mb-4 p-3 bg-muted/30 rounded-[var(--radius-standard)]">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="待办事项标题"
              className="w-full h-9 px-3 text-sm border rounded-[var(--radius-standard)] mb-2"
              autoFocus
            />
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={newTodoFirstCat}
                onChange={(e) => {
                  setNewTodoFirstCat(e.target.value as FirstCategory);
                  setNewTodoSecondCat('');
                  setNewTodoThirdCat('');
                }}
                className="h-8 px-2 text-xs border rounded-[var(--radius-standard)]"
              >
                {(['学习成长', '工作事务', '运动健康', '休息娱乐', '外出出行', '生活日常', '其他'] as FirstCategory[]).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={newTodoSecondCat}
                onChange={(e) => setNewTodoSecondCat(e.target.value)}
                className="h-8 px-2 text-xs border rounded-[var(--radius-standard)]"
              >
                <option value="">选择二级分类</option>
                {getSecondCategories(newTodoFirstCat).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-muted-foreground">开始时间</label>
                <input
                  type="time"
                  value={newTodoStartTime}
                  onChange={(e) => setNewTodoStartTime(e.target.value)}
                  className="w-full h-8 px-2 text-xs border rounded-[var(--radius-standard)]"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">结束时间</label>
                <input
                  type="time"
                  value={newTodoEndTime}
                  onChange={(e) => setNewTodoEndTime(e.target.value)}
                  className="w-full h-8 px-2 text-xs border rounded-[var(--radius-standard)]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTodo} className="flex-1 h-7 text-xs">
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddTodo(false)} className="h-7 text-xs">
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 待办列表 */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              暂无待办事项，点击上方按钮添加
            </div>
          ) : (
            todos.map(todo => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-[var(--radius-standard)] ${
                  todo.isCompleted ? 'bg-muted/30' : 'bg-card border'
                }`}
              >
                <button
                  onClick={() => handleToggleComplete(todo.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    todo.isCompleted
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {todo.isCompleted && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </button>
                
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(todo.firstCategory) }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${
                    todo.isCompleted ? 'line-through text-muted-foreground' : ''
                  }`}>
                    {todo.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {todo.secondCategory}
                    {todo.startTime && (
                      <span className="ml-2">
                        {new Date(todo.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 专项记录入口 */}
      <Card className="p-4">
        <h2 className="text-sm font-medium mb-3">专项记录</h2>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => setShowBookModal(true)}
          >
            <Book className="w-5 h-5 text-habit-water" />
            <span className="text-xs">阅读记录</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => setShowFitnessModal(true)}
          >
            <Dumbbell className="w-5 h-5 text-habit-supplements" />
            <span className="text-xs">健身记录</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => setShowAccountModal(true)}
          >
            <Wallet className="w-5 h-5 text-habit-journal" />
            <span className="text-xs">记账</span>
          </Button>
        </div>
      </Card>

      {/* 专项记录弹窗 */}
      {showBookModal && (
        <BookRecordModal
          onClose={() => setShowBookModal(false)}
          onSaved={() => {
            setShowBookModal(false);
            loadData();
          }}
        />
      )}

      {showFitnessModal && (
        <FitnessRecordModal
          onClose={() => setShowFitnessModal(false)}
          onSaved={() => {
            setShowFitnessModal(false);
            loadData();
          }}
        />
      )}

      {showAccountModal && (
        <AccountRecordModal
          onClose={() => setShowAccountModal(false)}
          onSaved={() => {
            setShowAccountModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
