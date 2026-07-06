'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Book, Dumbbell, Wallet, Check, Trash2, Droplets, Edit } from 'lucide-react';
import { TodoStorage, HabitStorage, PlanStorage, TimeStorage } from '@/lib/storage';
import type { TodoItem, HabitRecord, FirstCategory, HabitType, DrinkType } from '@/types';
import { getCategoryColor, HABIT_CONFIG, getSecondCategories } from '@/types';
import { BookRecordModal } from '@/components/modals/book-record-modal';
import { FitnessRecordModal } from '@/components/modals/fitness-record-modal';
import { AccountRecordModal } from '@/components/modals/account-record-modal';
import { TodoModal } from '@/components/modals/todo-modal';
import { WaterRecordModal } from '@/components/modals/water-record-modal';

export default function TodayPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [habitRecord, setHabitRecord] = useState<HabitRecord | null>(null);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [progress, setProgress] = useState({ year: 0, month: 0, week: 0, day: 0 });
  const [showReview, setShowReview] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);

  // 新增待办表单
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoFirstCat, setNewTodoFirstCat] = useState<FirstCategory>('工作事务');
  const [newTodoSecondCat, setNewTodoSecondCat] = useState('');
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
    setProgress(PlanStorage.getProgress());
  };

// handleAddTodo removed - now using TodoModal

  const handleToggleComplete = (id: string) => {
    TodoStorage.toggleComplete(id);
    loadData();
  };

  const handleDeleteTodo = (id: string) => {
    TodoStorage.delete(id);
    loadData();
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setShowTodoModal(true);
  };

  const handleOpenAddTodo = () => {
    setEditingTodo(null);
    setShowTodoModal(true);
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

  const handleWaterConfirm = (drinkType: DrinkType, amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 创建时间轴记录
    const timeRecord = TimeStorage.add({
      title: `饮水 - ${drinkType} ${amount}ml`,
      firstCategory: '生活日常',
      secondCategory: '饮食保健',
      thirdCategory: '饮水',
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      duration: Math.max(5, Math.round(amount / 30)),
      date: today,
      isPlanned: false,
      isCompleted: true,
      note: `${drinkType} ${amount}ml`,
      tags: ['饮水', drinkType]
    });
    
    // 添加饮品记录
    HabitStorage.addWaterDrink(today, {
      type: drinkType,
      amount,
      time: timeStr,
      timeRecordId: timeRecord.id
    });
    
    loadData();
  };

  const today = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 周${weekdays[today.getDay()]}`;

  // 计算今日完成率
  const completedCount = todos.filter(t => t.isCompleted).length;
  const completionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="px-4 py-6 max-w-md mx-auto pb-24">
      {/* 页面标题 + 心情 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-serif font-medium">{dateStr}</h1>
        </div>
        <button className="text-2xl">😊</button>
      </div>

      {/* 四维进度卡片 - 横排 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-card rounded-[var(--radius-standard)] p-2 text-center shadow-[var(--shadow-sm)]">
          <div className="text-xs text-muted-foreground">年度</div>
          <div className="text-sm font-medium">{progress.year}%</div>
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress.year}%` }} />
          </div>
        </div>
        <div className="bg-card rounded-[var(--radius-standard)] p-2 text-center shadow-[var(--shadow-sm)]">
          <div className="text-xs text-muted-foreground">月度</div>
          <div className="text-sm font-medium">{progress.month}%</div>
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress.month}%` }} />
          </div>
        </div>
        <div className="bg-card rounded-[var(--radius-standard)] p-2 text-center shadow-[var(--shadow-sm)]">
          <div className="text-xs text-muted-foreground">周</div>
          <div className="text-sm font-medium">{progress.week}%</div>
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress.week}%` }} />
          </div>
        </div>
        <div className="bg-card rounded-[var(--radius-standard)] p-2 text-center shadow-[var(--shadow-sm)]">
          <div className="text-xs text-muted-foreground">今日</div>
          <div className="text-sm font-medium">{completedCount}/{todos.length}</div>
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* 今日习惯 - 横向三列 */}
      <Card className="p-3 mb-4">
        <h2 className="text-sm font-medium mb-2">今日习惯</h2>
        <div className="flex gap-2.5">
          {/* 饮水 */}
          <button
            onClick={() => setShowWaterModal(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all hover:bg-muted/30 active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" style={{ color: HABIT_CONFIG.water.color }} />
              <span className="text-xs font-medium">{HABIT_CONFIG.water.label}</span>
            </div>
            <span className={`text-[11px] ${habitRecord?.water.completed ? 'font-medium' : 'text-muted-foreground'}`}
              style={habitRecord?.water.completed ? { color: HABIT_CONFIG.water.color } : {}}>
              {habitRecord?.water.amount || 0}/{HABIT_CONFIG.water.target}ml
            </span>
          </button>

          {/* 保健品 */}
          <button
            onClick={() => handleUpdateHabit('supplements')}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all hover:bg-muted/30 active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs">💊</span>
              <span className="text-xs font-medium">{HABIT_CONFIG.supplements.label}</span>
            </div>
            <span className={`text-[11px] ${habitRecord?.supplements.completed ? 'font-medium' : 'text-muted-foreground'}`}
              style={habitRecord?.supplements.completed ? { color: HABIT_CONFIG.supplements.color } : {}}>
              {habitRecord?.supplements.completed ? '已打卡' : '未打卡'}
            </span>
          </button>

          {/* 手帐 */}
          <button
            onClick={() => handleUpdateHabit('journal')}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all hover:bg-muted/30 active:scale-[0.98]"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs">📔</span>
              <span className="text-xs font-medium">{HABIT_CONFIG.journal.label}</span>
            </div>
            <span className={`text-[11px] ${habitRecord?.journal.completed ? 'font-medium' : 'text-muted-foreground'}`}
              style={habitRecord?.journal.completed ? { color: HABIT_CONFIG.journal.color } : {}}>
              {habitRecord?.journal.completed ? '已打卡' : '未打卡'}
            </span>
          </button>
        </div>
      </Card>

      {/* 饮水记录弹窗 */}
      <WaterRecordModal
        open={showWaterModal}
        onOpenChange={setShowWaterModal}
        onConfirm={handleWaterConfirm}
        currentAmount={habitRecord?.water.amount || 0}
      />

      {/* 待办事项 */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">待办事项</h2>
          <Button
            size="sm"
            onClick={() => setShowAddTodo(!showAddTodo)}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            新增任务
          </Button>
        </div>

        {/* 待办弹窗 */}
        <TodoModal
          open={showAddTodo}
          onOpenChange={setShowAddTodo}
          onSave={(data) => {
            TodoStorage.add(data);
            setShowAddTodo(false);
            loadData();
          }}
        />

        {/* 编辑待办弹窗 */}
        <TodoModal
          open={showTodoModal}
          onOpenChange={setShowTodoModal}
          todo={editingTodo}
          onSave={(data) => {
            if (editingTodo) {
              TodoStorage.update(editingTodo.id, data);
            }
            setShowTodoModal(false);
            setEditingTodo(null);
            loadData();
          }}
        />

        {/* 待办列表 */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              暂无待办，点击右上角添加
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
                    {todo.firstCategory} · {todo.secondCategory}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleEditTodo(todo)}
                >
                  <Edit className="h-3 w-3 text-muted-foreground" />
                </Button>

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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Button
          variant="outline"
          className="h-16 flex-col gap-1"
          onClick={() => setShowBookModal(true)}
        >
          <Book className="w-5 h-5 text-amber-500" />
          <span className="text-xs">📖阅读记录</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-16 flex-col gap-1"
          onClick={() => setShowFitnessModal(true)}
        >
          <Dumbbell className="w-5 h-5 text-green-500" />
          <span className="text-xs">🏋️健身记录</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-16 flex-col gap-1"
          onClick={() => setShowAccountModal(true)}
        >
          <Wallet className="w-5 h-5 text-blue-500" />
          <span className="text-xs">💰记账</span>
        </Button>
      </div>

      {/* 复盘区域 */}
      <Card className="p-4 mb-4">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-sm font-medium">今日复盘</h2>
          <span className={`transform transition-transform ${showReview ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showReview && (
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">今日原定计划</div>
                <div className="text-sm">
                  <span className="text-red-500">· 未完成 {todos.length - completedCount} 项</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">今日实际完成</div>
                <div className="text-sm">
                  <span className="text-green-500">· 已完成 {completedCount} 项</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-1">复盘小结</div>
              <div className="text-sm">
                完成率 <strong>{completionRate}%</strong> · 
                未完成 <strong>{todos.length - completedCount}</strong> 项
              </div>
            </div>
          </div>
        )}
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
