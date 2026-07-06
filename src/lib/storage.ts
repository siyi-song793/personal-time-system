import type {
  TimeRecord,
  HabitRecord,
  BookRecord,
  FitnessRecord,
  AccountRecord,
  TodoItem,
  Plan,
  UndoAction,
  AppData,
  HabitType,
  FirstCategory,
  AccountType,
  ExpenseFirstCategory,
  IncomeCategory,
  WaterDrink,
  DrinkType
} from '@/types';

import { autoDetectTag } from '@/types';

// ============================================
// 存储键名
// ============================================

const STORAGE_KEYS = {
  TIME_RECORDS: 'time_records',
  HABIT_RECORDS: 'habit_records',
  BOOK_RECORDS: 'user_book_records',
  FITNESS_RECORDS: 'user_fitness_records',
  ACCOUNT_RECORDS: 'user_account_records',
  TODOS: 'todos',
  PLANS: 'plans',
  UNDO_ACTIONS: 'undo_actions',
  THEME: 'theme'
};

// ============================================
// 通用工具函数
// ============================================

const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// ============================================
// A轨：时间记录服务
// ============================================

export const TimeStorage = {
  getAll: (): TimeRecord[] => {
    return getFromStorage<TimeRecord[]>(STORAGE_KEYS.TIME_RECORDS, []);
  },

  getByDate: (date: string): TimeRecord[] => {
    const records = TimeStorage.getAll();
    return records.filter(r => r.date === date);
  },

  getByDateRange: (startDate: string, endDate: string): TimeRecord[] => {
    const records = TimeStorage.getAll();
    return records.filter(r => r.date >= startDate && r.date <= endDate);
  },

  getByCategory: (category: FirstCategory): TimeRecord[] => {
    const records = TimeStorage.getAll();
    return records.filter(r => r.firstCategory === category);
  },

  add: (record: Omit<TimeRecord, 'id' | 'createdAt' | 'updatedAt'>): TimeRecord => {
    const records = TimeStorage.getAll();
    const now = new Date().toISOString();
    const newRecord: TimeRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    records.push(newRecord);
    saveToStorage(STORAGE_KEYS.TIME_RECORDS, records);
    UndoStorage.addAction('create', 'time', newRecord.id, undefined, newRecord);
    return newRecord;
  },

  update: (id: string, updates: Partial<TimeRecord>): TimeRecord | null => {
    const records = TimeStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    const beforeData = { ...records[index] };
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.TIME_RECORDS, records);
    UndoStorage.addAction('update', 'time', id, beforeData, records[index]);
    return records[index];
  },

  delete: (id: string): boolean => {
    const records = TimeStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    const deleted = records[index];
    records.splice(index, 1);
    saveToStorage(STORAGE_KEYS.TIME_RECORDS, records);
    UndoStorage.addAction('delete', 'time', id, deleted, undefined);
    
    // 删除关联：待办状态回退
    if (deleted.todoId) {
      TodoStorage.unlinkTimeRecord(deleted.todoId);
    }
    // 删除关联：账单关联清空
    if (deleted.accountIds?.length) {
      deleted.accountIds.forEach(accountId => {
        AccountStorage.unlinkTimeRecord(accountId);
      });
    }
    return true;
  },

  // 获取某天的总时长（分钟）
  getDailyTotal: (date: string): number => {
    const records = TimeStorage.getByDate(date);
    return records.reduce((sum, r) => sum + r.duration, 0);
  },

  // 获取某天的分类时长
  getDailyCategoryMinutes: (date: string): Record<FirstCategory, number> => {
    const records = TimeStorage.getByDate(date);
    const result = {} as Record<FirstCategory, number>;
    
    // 初始化所有分类为0
    (['学习成长', '工作事务', '运动健康', '休息娱乐', '外出出行', '生活日常', '其他'] as FirstCategory[]).forEach(cat => {
      result[cat] = 0;
    });
    
    records.forEach(r => {
      result[r.firstCategory] = (result[r.firstCategory] || 0) + r.duration;
    });
    
    return result;
  },

  // 取消账单关联
  unlinkAccount: (timeRecordId: string, accountId: string): void => {
    const records = TimeStorage.getAll();
    const index = records.findIndex(r => r.id === timeRecordId);
    if (index !== -1) {
      records[index].accountIds = records[index].accountIds?.filter(id => id !== accountId) || [];
      saveToStorage(STORAGE_KEYS.TIME_RECORDS, records);
    }
  }
};

// ============================================
// B轨：习惯记录服务
// ============================================

export const HabitStorage = {
  getAll: (): HabitRecord[] => {
    return getFromStorage<HabitRecord[]>(STORAGE_KEYS.HABIT_RECORDS, []);
  },

  getByDate: (date: string): HabitRecord | null => {
    const records = HabitStorage.getAll();
    return records.find(r => r.date === date) || null;
  },

  // 获取或创建今日习惯记录
  getOrCreateToday: (): HabitRecord => {
    const today = new Date().toISOString().split('T')[0];
    let record = HabitStorage.getByDate(today);
    
    if (!record) {
      record = HabitStorage.add({
        date: today,
        water: { completed: false, amount: 0 },
        supplements: { completed: false },
        journal: { completed: false }
      });
    }
    
    return record;
  },

  add: (data: Omit<HabitRecord, 'id' | 'createdAt' | 'updatedAt'>): HabitRecord => {
    const records = HabitStorage.getAll();
    const now = new Date().toISOString();
    const newRecord: HabitRecord = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    records.push(newRecord);
    saveToStorage(STORAGE_KEYS.HABIT_RECORDS, records);
    return newRecord;
  },

  update: (id: string, updates: Partial<HabitRecord>): HabitRecord | null => {
    const records = HabitStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.HABIT_RECORDS, records);
    return records[index];
  },

  // 更新饮水量
  updateWater: (date: string, amount: number): HabitRecord | null => {
    const record = HabitStorage.getByDate(date);
    if (!record) {
      return HabitStorage.add({
        date,
        water: { completed: amount >= 2000, amount },
        supplements: { completed: false },
        journal: { completed: false }
      });
    }
    
    return HabitStorage.update(record.id, {
      water: { completed: amount >= 2000, amount }
    });
  },

  // 添加饮品记录
  addWaterDrink: (date: string, drink: Omit<WaterDrink, 'id'>): { habit: HabitRecord; drink: WaterDrink } | null => {
    const record = HabitStorage.getByDate(date);
    const newDrink: WaterDrink = { ...drink, id: generateId() };
    
    if (!record) {
      const habit = HabitStorage.add({
        date,
        water: { completed: drink.amount >= 2000, amount: drink.amount, drinks: [newDrink] },
        supplements: { completed: false },
        journal: { completed: false }
      });
      return habit ? { habit, drink: newDrink } : null;
    }
    
    const existingDrinks = record.water.drinks || [];
    const newAmount = record.water.amount + drink.amount;
    const updated = HabitStorage.update(record.id, {
      water: { completed: newAmount >= 2000, amount: newAmount, drinks: [...existingDrinks, newDrink] }
    });
    return updated ? { habit: updated, drink: newDrink } : null;
  },

  // 删除饮品记录
  removeWaterDrink: (date: string, drinkId: string): HabitRecord | null => {
    const record = HabitStorage.getByDate(date);
    if (!record || !record.water.drinks) return record;
    
    const drink = record.water.drinks.find(d => d.id === drinkId);
    if (!drink) return record;
    
    const newDrinks = record.water.drinks.filter(d => d.id !== drinkId);
    const newAmount = Math.max(0, record.water.amount - drink.amount);
    
    // 删除关联的时间轴记录
    if (drink.timeRecordId) {
      TimeStorage.delete(drink.timeRecordId);
    }
    
    return HabitStorage.update(record.id, {
      water: { completed: newAmount >= 2000, amount: newAmount, drinks: newDrinks }
    });
  },

  // 切换保健品打卡
  toggleSupplements: (date: string): HabitRecord | null => {
    const record = HabitStorage.getByDate(date);
    if (!record) {
      return HabitStorage.add({
        date,
        water: { completed: false, amount: 0 },
        supplements: { completed: true },
        journal: { completed: false }
      });
    }
    
    return HabitStorage.update(record.id, {
      supplements: { completed: !record.supplements.completed }
    });
  },

  // 切换手帐打卡
  toggleJournal: (date: string): HabitRecord | null => {
    const record = HabitStorage.getByDate(date);
    if (!record) {
      return HabitStorage.add({
        date,
        water: { completed: false, amount: 0 },
        supplements: { completed: false },
        journal: { completed: true }
      });
    }
    
    return HabitStorage.update(record.id, {
      journal: { completed: !record.journal.completed }
    });
  },

  // 检查某天习惯是否全部完成
  isAllCompleted: (date: string): boolean => {
    const record = HabitStorage.getByDate(date);
    if (!record) return false;
    return record.water.completed && record.supplements.completed && record.journal.completed;
  },

  // 检查某天习惯是否部分完成
  isPartialCompleted: (date: string): boolean => {
    const record = HabitStorage.getByDate(date);
    if (!record) return false;
    const completedCount = [
      record.water.completed,
      record.supplements.completed,
      record.journal.completed
    ].filter(Boolean).length;
    return completedCount > 0 && completedCount < 3;
  }
};

// ============================================
// C轨：阅读记录服务
// ============================================

export const BookStorage = {
  getAll: (): BookRecord[] => {
    return getFromStorage<BookRecord[]>(STORAGE_KEYS.BOOK_RECORDS, []);
  },

  getByDate: (date: string): BookRecord[] => {
    const records = BookStorage.getAll();
    return records.filter(r => r.date === date);
  },

  add: (record: Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>): BookRecord => {
    const records = BookStorage.getAll();
    const now = new Date().toISOString();
    const newRecord: BookRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    records.push(newRecord);
    saveToStorage(STORAGE_KEYS.BOOK_RECORDS, records);
    UndoStorage.addAction('create', 'book', newRecord.id, undefined, newRecord);
    return newRecord;
  },

  update: (id: string, updates: Partial<BookRecord>): BookRecord | null => {
    const records = BookStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    const beforeData = { ...records[index] };
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.BOOK_RECORDS, records);
    UndoStorage.addAction('update', 'book', id, beforeData, records[index]);
    return records[index];
  },

  delete: (id: string): boolean => {
    const records = BookStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    const deleted = records[index];
    records.splice(index, 1);
    saveToStorage(STORAGE_KEYS.BOOK_RECORDS, records);
    UndoStorage.addAction('delete', 'book', id, deleted, undefined);
    return true;
  }
};

// ============================================
// C轨：健身记录服务
// ============================================

export const FitnessStorage = {
  getAll: (): FitnessRecord[] => {
    return getFromStorage<FitnessRecord[]>(STORAGE_KEYS.FITNESS_RECORDS, []);
  },

  getByDate: (date: string): FitnessRecord[] => {
    const records = FitnessStorage.getAll();
    return records.filter(r => r.date === date);
  },

  add: (record: Omit<FitnessRecord, 'id' | 'createdAt' | 'updatedAt'>): FitnessRecord => {
    const records = FitnessStorage.getAll();
    const now = new Date().toISOString();
    const newRecord: FitnessRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    records.push(newRecord);
    saveToStorage(STORAGE_KEYS.FITNESS_RECORDS, records);
    UndoStorage.addAction('create', 'fitness', newRecord.id, undefined, newRecord);
    return newRecord;
  },

  update: (id: string, updates: Partial<FitnessRecord>): FitnessRecord | null => {
    const records = FitnessStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    const beforeData = { ...records[index] };
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.FITNESS_RECORDS, records);
    UndoStorage.addAction('update', 'fitness', id, beforeData, records[index]);
    return records[index];
  },

  delete: (id: string): boolean => {
    const records = FitnessStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    const deleted = records[index];
    records.splice(index, 1);
    saveToStorage(STORAGE_KEYS.FITNESS_RECORDS, records);
    UndoStorage.addAction('delete', 'fitness', id, deleted, undefined);
    return true;
  }
};

// ============================================
// C轨：记账记录服务
// ============================================

export const AccountStorage = {
  getAll: (): AccountRecord[] => {
    return getFromStorage<AccountRecord[]>(STORAGE_KEYS.ACCOUNT_RECORDS, []);
  },

  getByDate: (date: string): AccountRecord[] => {
    const records = AccountStorage.getAll();
    return records.filter(r => r.date === date);
  },

  getByType: (type: AccountType): AccountRecord[] => {
    const records = AccountStorage.getAll();
    return records.filter(r => r.type === type);
  },

  add: (record: Omit<AccountRecord, 'id' | 'createdAt' | 'updatedAt'>): AccountRecord => {
    const records = AccountStorage.getAll();
    const now = new Date().toISOString();
    
    // 自动判定标签
    const tag = record.tag || autoDetectTag(
      record.firstCategory as string,
      record.note
    );
    
    const newRecord: AccountRecord = {
      ...record,
      tag,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    records.push(newRecord);
    saveToStorage(STORAGE_KEYS.ACCOUNT_RECORDS, records);
    UndoStorage.addAction('create', 'account', newRecord.id, undefined, newRecord);
    return newRecord;
  },

  update: (id: string, updates: Partial<AccountRecord>): AccountRecord | null => {
    const records = AccountStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    const beforeData = { ...records[index] };
    const updated = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    
    // 重新计算标签
    if (updates.firstCategory || updates.note) {
      updated.tag = autoDetectTag(
        (updates.firstCategory || updated.firstCategory) as string,
        updates.note || updated.note
      );
    }
    
    records[index] = updated;
    saveToStorage(STORAGE_KEYS.ACCOUNT_RECORDS, records);
    UndoStorage.addAction('update', 'account', id, beforeData, updated);
    return updated;
  },

  delete: (id: string): boolean => {
    const records = AccountStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    const deleted = records[index];
    records.splice(index, 1);
    saveToStorage(STORAGE_KEYS.ACCOUNT_RECORDS, records);
    UndoStorage.addAction('delete', 'account', id, deleted, undefined);
    
    // 删除关联：时间记录关联清空
    if (deleted.timeRecordId) {
      TimeStorage.unlinkAccount(deleted.timeRecordId, id);
    }
    return true;
  },

  // 取消时间记录关联
  unlinkTimeRecord: (id: string): void => {
    const records = AccountStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index].timeRecordId = undefined;
      saveToStorage(STORAGE_KEYS.ACCOUNT_RECORDS, records);
    }
  },

  // 获取某天的收支汇总
  getDailySummary: (date: string): { income: number; expense: number } => {
    const records = AccountStorage.getByDate(date);
    return records.reduce(
      (acc, r) => {
        if (r.type === 'income') acc.income += r.amount;
        else acc.expense += r.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }
};

// ============================================
// 待办事项服务
// ============================================

export const TodoStorage = {
  getAll: (): TodoItem[] => {
    return getFromStorage<TodoItem[]>(STORAGE_KEYS.TODOS, []);
  },

  getByDate: (date: string): TodoItem[] => {
    const records = TodoStorage.getAll();
    return records.filter(r => r.date === date);
  },

  add: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): TodoItem => {
    const todos = TodoStorage.getAll();
    const now = new Date().toISOString();
    const newTodo: TodoItem = {
      ...todo,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    todos.push(newTodo);
    saveToStorage(STORAGE_KEYS.TODOS, todos);
    UndoStorage.addAction('create', 'todo', newTodo.id, undefined, newTodo);
    return newTodo;
  },

  update: (id: string, updates: Partial<TodoItem>): TodoItem | null => {
    const todos = TodoStorage.getAll();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    const beforeData = { ...todos[index] };
    const updated = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
    todos[index] = updated;
    saveToStorage(STORAGE_KEYS.TODOS, todos);
    UndoStorage.addAction('update', 'todo', id, beforeData, updated);
    
    // 待办完成状态变更联动
    if (updates.isCompleted !== undefined && updates.isCompleted !== beforeData.isCompleted) {
      if (updates.isCompleted) {
        // 标记完成：自动生成时间记录（仅当有有效时间时）
        if (updated.startTime && updated.endTime && updated.date) {
          // 构造完整的日期时间字符串
          const startDateTime = `${updated.date}T${updated.startTime}:00`;
          const endDateTime = `${updated.date}T${updated.endTime}:00`;
          const startTime = new Date(startDateTime);
          const endTime = new Date(endDateTime);
          
          // 验证日期有效性
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return null;
          }
          
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
          
          // 时长必须为正数
          if (duration <= 0) {
            return null;
          }
          
          const timeRecord = TimeStorage.add({
            title: updated.title,
            firstCategory: updated.firstCategory,
            secondCategory: updated.secondCategory,
            thirdCategory: updated.thirdCategory,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            date: updated.date,
            isPlanned: true,
            isCompleted: true,
            todoId: id
          });
          
          // 更新待办关联时间记录ID
          updated.timeRecordId = timeRecord.id;
          todos[index] = updated;
          saveToStorage(STORAGE_KEYS.TODOS, todos);
        }
      } else {
        // 取消完成：删除生成的时间记录
        if (beforeData.timeRecordId) {
          TimeStorage.delete(beforeData.timeRecordId);
          updated.timeRecordId = undefined;
          todos[index] = updated;
          saveToStorage(STORAGE_KEYS.TODOS, todos);
        }
      }
    }
    
    return updated;
  },

  delete: (id: string): boolean => {
    const todos = TodoStorage.getAll();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    const deleted = todos[index];
    todos.splice(index, 1);
    saveToStorage(STORAGE_KEYS.TODOS, todos);
    UndoStorage.addAction('delete', 'todo', id, deleted, undefined);
    
    // 删除关联的时间记录
    if (deleted.timeRecordId) {
      TimeStorage.delete(deleted.timeRecordId);
    }
    return true;
  },

  // 取消待办与时间记录的关联（时间记录被手动删除时调用）
  unlinkTimeRecord: (todoId: string): void => {
    const todos = TodoStorage.getAll();
    const index = todos.findIndex(t => t.id === todoId);
    if (index !== -1) {
      todos[index].timeRecordId = undefined;
      todos[index].isCompleted = false; // 状态回退
      saveToStorage(STORAGE_KEYS.TODOS, todos);
    }
  },

  // 切换完成状态
  toggleComplete: (id: string): TodoItem | null => {
    const todos = TodoStorage.getAll();
    const todo = todos.find(t => t.id === id);
    if (!todo) return null;
    return TodoStorage.update(id, { isCompleted: !todo.isCompleted });
  }
};

// ============================================
// 计划服务（四级：年/月/周/日）
// ============================================

export const PlanStorage = {
  getAll: (): Plan[] => {
    return getFromStorage<Plan[]>(STORAGE_KEYS.PLANS, []);
  },

  getByLevel: (level: 'year' | 'month' | 'week' | 'day'): Plan[] => {
    const plans = PlanStorage.getAll();
    return plans.filter(p => p.level === level);
  },

  add: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Plan => {
    const plans = PlanStorage.getAll();
    const now = new Date().toISOString();
    const newPlan: Plan = {
      ...plan,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    plans.push(newPlan);
    saveToStorage(STORAGE_KEYS.PLANS, plans);
    return newPlan;
  },

  update: (id: string, updates: Partial<Plan>): Plan | null => {
    const plans = PlanStorage.getAll();
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    plans[index] = { ...plans[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.PLANS, plans);
    return plans[index];
  },

  // 获取进度统计
  getProgress: (): { year: number; month: number; week: number; day: number } => {
    const plans = PlanStorage.getAll();
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // 计算本周（周一开始）
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const weekStart = monday.toISOString().split('T')[0];
    
    const currentDay = now.toISOString().split('T')[0];
    
    const yearPlans = plans.filter(p => p.level === 'year' && p.date.startsWith(currentYear));
    const monthPlans = plans.filter(p => p.level === 'month' && p.date.startsWith(currentMonth));
    const weekPlans = plans.filter(p => p.level === 'week' && p.date >= weekStart);
    const dayPlans = plans.filter(p => p.level === 'today' && p.date === currentDay);
    
    const calcPercentage = (list: Plan[]) => {
      if (list.length === 0) return 0;
      const completed = list.filter(p => p.isCompleted).length;
      return Math.round((completed / list.length) * 100);
    };
    
    return {
      year: calcPercentage(yearPlans),
      month: calcPercentage(monthPlans),
      week: calcPercentage(weekPlans),
      day: calcPercentage(dayPlans)
    };
  }
};

// ============================================
// 撤销服务
// ============================================

export const UndoStorage = {
  getAll: (): UndoAction[] => {
    return getFromStorage<UndoAction[]>(STORAGE_KEYS.UNDO_ACTIONS, []);
  },

  addAction: (
    actionType: 'create' | 'update' | 'delete',
    entityType: 'time' | 'habit' | 'book' | 'fitness' | 'account' | 'todo' | 'plan',
    entityId: string,
    beforeData?: unknown,
    afterData?: unknown
  ): void => {
    const actions = UndoStorage.getAll();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后过期
    
    actions.push({
      id: generateId(),
      actionType,
      entityType,
      entityId,
      beforeData,
      afterData,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    });
    
    // 只保留24小时内的操作
    const validActions = actions.filter(a => new Date(a.expiresAt) > now);
    saveToStorage(STORAGE_KEYS.UNDO_ACTIONS, validActions);
  },

  // 获取最近的操作（用于撤销）
  getLastAction: (): UndoAction | null => {
    const actions = UndoStorage.getAll();
    if (actions.length === 0) return null;
    return actions[actions.length - 1];
  },

  // 执行撤销
  undo: (): boolean => {
    const action = UndoStorage.getLastAction();
    if (!action) return false;
    
    // 根据操作类型和实体类型执行撤销
    // 这里简化处理，实际需要根据具体类型调用对应的存储方法
    
    // 移除已撤销的操作
    const actions = UndoStorage.getAll();
    const filtered = actions.filter(a => a.id !== action.id);
    saveToStorage(STORAGE_KEYS.UNDO_ACTIONS, filtered);
    
    return true;
  },

  // 清理过期操作
  cleanup: (): void => {
    const actions = UndoStorage.getAll();
    const now = new Date();
    const validActions = actions.filter(a => new Date(a.expiresAt) > now);
    saveToStorage(STORAGE_KEYS.UNDO_ACTIONS, validActions);
  }
};

// ============================================
// 主题服务
// ============================================

export const ThemeStorage = {
  get: (): 'light' | 'dark' | 'system' => {
    return getFromStorage<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME, 'system');
  },

  set: (theme: 'light' | 'dark' | 'system'): void => {
    saveToStorage(STORAGE_KEYS.THEME, theme);
  }
};

// ============================================
// 数据导出/导入
// ============================================

export const DataExport = {
  exportAll: (): AppData => {
    return {
      timeRecords: TimeStorage.getAll(),
      habitRecords: HabitStorage.getAll(),
      bookRecords: BookStorage.getAll(),
      fitnessRecords: FitnessStorage.getAll(),
      accountRecords: AccountStorage.getAll(),
      todos: TodoStorage.getAll(),
      plans: PlanStorage.getAll(),
      undoActions: UndoStorage.getAll()
    };
  },

  importAll: (data: AppData): void => {
    saveToStorage(STORAGE_KEYS.TIME_RECORDS, data.timeRecords);
    saveToStorage(STORAGE_KEYS.HABIT_RECORDS, data.habitRecords);
    saveToStorage(STORAGE_KEYS.BOOK_RECORDS, data.bookRecords);
    saveToStorage(STORAGE_KEYS.FITNESS_RECORDS, data.fitnessRecords);
    saveToStorage(STORAGE_KEYS.ACCOUNT_RECORDS, data.accountRecords);
    saveToStorage(STORAGE_KEYS.TODOS, data.todos);
    saveToStorage(STORAGE_KEYS.PLANS, data.plans);
    saveToStorage(STORAGE_KEYS.UNDO_ACTIONS, data.undoActions);
  },

  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
