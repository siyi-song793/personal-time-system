// localStorage服务 - 离线优先架构

import type {
  TimeRecord,
  HabitDaily,
  BookRecord,
  FitnessRecord,
  AccountRecord,
  TodoItem,
  HabitType,
} from '@/types';

const STORAGE_KEYS = {
  TIME_RECORDS: 'time_records',
  HABIT_DAILY: 'habit_daily',
  BOOK_RECORDS: 'book_records',
  FITNESS_RECORDS: 'fitness_records',
  ACCOUNT_RECORDS: 'account_records',
  TODO_ITEMS: 'todo_items',
  THEME: 'theme',
};

// ==================== 通用存储函数 ====================
function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// ==================== A轨：time_record ====================
export const TimeRecordStorage = {
  getAll(): TimeRecord[] {
    return getItem<TimeRecord>(STORAGE_KEYS.TIME_RECORDS);
  },

  getByDate(date: string): TimeRecord[] {
    return this.getAll().filter(r => r.date === date);
  },

  getByMonth(year: number, month: number): TimeRecord[] {
    return this.getAll().filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  add(record: Omit<TimeRecord, 'id' | 'createdAt' | 'updatedAt'>): TimeRecord {
    const now = new Date().toISOString();
    const newRecord: TimeRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const records = this.getAll();
    records.push(newRecord);
    setItem(STORAGE_KEYS.TIME_RECORDS, records);
    return newRecord;
  },

  update(id: string, updates: Partial<TimeRecord>): TimeRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.TIME_RECORDS, records);
    return records[index];
  },

  delete(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    setItem(STORAGE_KEYS.TIME_RECORDS, filtered);
    return true;
  },
};

// ==================== B轨：habit_daily ====================
export const HabitStorage = {
  getAll(): HabitDaily[] {
    return getItem<HabitDaily>(STORAGE_KEYS.HABIT_DAILY);
  },

  getByDate(date: string): HabitDaily[] {
    return this.getAll().filter(h => h.date === date);
  },

  getByDateAndType(date: string, habitType: HabitType): HabitDaily | undefined {
    return this.getByDate(date).find(h => h.habitType === habitType);
  },

  getByMonth(year: number, month: number): HabitDaily[] {
    return this.getAll().filter(h => {
      const d = new Date(h.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  // 初始化今日习惯（如果不存在）
  initTodayHabits(date: string = getDateString()): HabitDaily[] {
    const existing = this.getByDate(date);
    const habitTypes: HabitType[] = ['water', 'supplement', 'journal'];
    
    for (const type of habitTypes) {
      if (!existing.find(h => h.habitType === type)) {
        this.add({
          date,
          habitType: type,
          target: type === 'water' ? 2000 : 1,
          completed: 0,
          isCompleted: false,
        });
      }
    }
    
    return this.getByDate(date);
  },

  add(habit: Omit<HabitDaily, 'id' | 'createdAt' | 'updatedAt'>): HabitDaily {
    const now = new Date().toISOString();
    const newHabit: HabitDaily = {
      ...habit,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const habits = this.getAll();
    habits.push(newHabit);
    setItem(STORAGE_KEYS.HABIT_DAILY, habits);
    return newHabit;
  },

  updateProgress(date: string, habitType: HabitType, completed: number): HabitDaily | null {
    const habits = this.getAll();
    const index = habits.findIndex(h => h.date === date && h.habitType === habitType);
    if (index === -1) {
      // 如果不存在，先创建
      const newHabit = this.add({
        date,
        habitType,
        target: habitType === 'water' ? 2000 : 1,
        completed,
        isCompleted: completed >= (habitType === 'water' ? 2000 : 1),
      });
      return newHabit;
    }
    
    const target = habits[index].target;
    habits[index] = {
      ...habits[index],
      completed,
      isCompleted: completed >= target,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.HABIT_DAILY, habits);
    return habits[index];
  },

  delete(id: string): boolean {
    const habits = this.getAll();
    const filtered = habits.filter(h => h.id !== id);
    if (filtered.length === habits.length) return false;
    setItem(STORAGE_KEYS.HABIT_DAILY, filtered);
    return true;
  },
};

// ==================== C轨：专项附属表 ====================

// C1: 阅读记录
export const BookStorage = {
  getAll(): BookRecord[] {
    return getItem<BookRecord>(STORAGE_KEYS.BOOK_RECORDS);
  },

  getByDate(date: string): BookRecord[] {
    return this.getAll().filter(b => b.date === date);
  },

  getByMonth(year: number, month: number): BookRecord[] {
    return this.getAll().filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  add(record: Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>): BookRecord {
    const now = new Date().toISOString();
    const newRecord: BookRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const records = this.getAll();
    records.push(newRecord);
    setItem(STORAGE_KEYS.BOOK_RECORDS, records);
    return newRecord;
  },

  update(id: string, updates: Partial<BookRecord>): BookRecord | null {
    const records = this.getAll();
    const index = records.findIndex(b => b.id === id);
    if (index === -1) return null;
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.BOOK_RECORDS, records);
    return records[index];
  },

  delete(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(b => b.id !== id);
    if (filtered.length === records.length) return false;
    setItem(STORAGE_KEYS.BOOK_RECORDS, filtered);
    return true;
  },
};

// C2: 健身记录
export const FitnessStorage = {
  getAll(): FitnessRecord[] {
    return getItem<FitnessRecord>(STORAGE_KEYS.FITNESS_RECORDS);
  },

  getByDate(date: string): FitnessRecord[] {
    return this.getAll().filter(f => f.date === date);
  },

  getByMonth(year: number, month: number): FitnessRecord[] {
    return this.getAll().filter(f => {
      const d = new Date(f.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  add(record: Omit<FitnessRecord, 'id' | 'createdAt' | 'updatedAt'>): FitnessRecord {
    const now = new Date().toISOString();
    const newRecord: FitnessRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const records = this.getAll();
    records.push(newRecord);
    setItem(STORAGE_KEYS.FITNESS_RECORDS, records);
    return newRecord;
  },

  update(id: string, updates: Partial<FitnessRecord>): FitnessRecord | null {
    const records = this.getAll();
    const index = records.findIndex(f => f.id === id);
    if (index === -1) return null;
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.FITNESS_RECORDS, records);
    return records[index];
  },

  delete(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(f => f.id !== id);
    if (filtered.length === records.length) return false;
    setItem(STORAGE_KEYS.FITNESS_RECORDS, filtered);
    return true;
  },
};

// C3: 记账记录
export const AccountStorage = {
  getAll(): AccountRecord[] {
    return getItem<AccountRecord>(STORAGE_KEYS.ACCOUNT_RECORDS);
  },

  getByDate(date: string): AccountRecord[] {
    return this.getAll().filter(a => a.date === date);
  },

  getByMonth(year: number, month: number): AccountRecord[] {
    return this.getAll().filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  getBalance(year: number, month: number): { income: number; expense: number; balance: number } {
    const records = this.getByMonth(year, month);
    const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    return { income, expense, balance: income - expense };
  },

  add(record: Omit<AccountRecord, 'id' | 'createdAt' | 'updatedAt'>): AccountRecord {
    const now = new Date().toISOString();
    const newRecord: AccountRecord = {
      ...record,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const records = this.getAll();
    records.push(newRecord);
    setItem(STORAGE_KEYS.ACCOUNT_RECORDS, records);
    return newRecord;
  },

  update(id: string, updates: Partial<AccountRecord>): AccountRecord | null {
    const records = this.getAll();
    const index = records.findIndex(a => a.id === id);
    if (index === -1) return null;
    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.ACCOUNT_RECORDS, records);
    return records[index];
  },

  delete(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(a => a.id !== id);
    if (filtered.length === records.length) return false;
    setItem(STORAGE_KEYS.ACCOUNT_RECORDS, filtered);
    return true;
  },
};

// ==================== 待办事项 ====================
export const TodoStorage = {
  getAll(): TodoItem[] {
    return getItem<TodoItem>(STORAGE_KEYS.TODO_ITEMS);
  },

  getByDate(date: string): TodoItem[] {
    return this.getAll().filter(t => t.date === date);
  },

  add(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): TodoItem {
    const now = new Date().toISOString();
    const newTodo: TodoItem = {
      ...todo,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const todos = this.getAll();
    todos.push(newTodo);
    setItem(STORAGE_KEYS.TODO_ITEMS, todos);
    return newTodo;
  },

  toggleComplete(id: string): TodoItem | null {
    const todos = this.getAll();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return null;
    todos[index] = {
      ...todos[index],
      isCompleted: !todos[index].isCompleted,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.TODO_ITEMS, todos);
    return todos[index];
  },

  update(id: string, updates: Partial<TodoItem>): TodoItem | null {
    const todos = this.getAll();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return null;
    todos[index] = {
      ...todos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.TODO_ITEMS, todos);
    return todos[index];
  },

  delete(id: string): boolean {
    const todos = this.getAll();
    const filtered = todos.filter(t => t.id !== id);
    if (filtered.length === todos.length) return false;
    setItem(STORAGE_KEYS.TODO_ITEMS, filtered);
    return true;
  },
};

// ==================== 主题存储 ====================
export const ThemeStorage = {
  get(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as 'light' | 'dark') || 'light';
  },

  set(theme: 'light' | 'dark'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  toggle(): 'light' | 'dark' {
    const current = this.get();
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.set(newTheme);
    return newTheme;
  },
};

// ==================== 数据导出/导入（备份功能） ====================
export const DataExport = {
  exportAll(): string {
    const data = {
      timeRecords: TimeRecordStorage.getAll(),
      habits: HabitStorage.getAll(),
      books: BookStorage.getAll(),
      fitness: FitnessStorage.getAll(),
      accounts: AccountStorage.getAll(),
      todos: TodoStorage.getAll(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAll(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.timeRecords) setItem(STORAGE_KEYS.TIME_RECORDS, data.timeRecords);
      if (data.habits) setItem(STORAGE_KEYS.HABIT_DAILY, data.habits);
      if (data.books) setItem(STORAGE_KEYS.BOOK_RECORDS, data.books);
      if (data.fitness) setItem(STORAGE_KEYS.FITNESS_RECORDS, data.fitness);
      if (data.accounts) setItem(STORAGE_KEYS.ACCOUNT_RECORDS, data.accounts);
      if (data.todos) setItem(STORAGE_KEYS.TODO_ITEMS, data.todos);
      return true;
    } catch {
      return false;
    }
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};