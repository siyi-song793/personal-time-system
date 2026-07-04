'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  TimeRecordStorage,
  HabitStorage,
  BookStorage,
  FitnessStorage,
  AccountStorage,
  TodoStorage,
} from '@/lib/storage';
import type {
  TimeRecord,
  HabitDaily,
  BookRecord,
  FitnessRecord,
  AccountRecord,
  TodoItem,
} from '@/types';

interface DataContextType {
  // 时间记录
  timeRecords: TimeRecord[];
  refreshTimeRecords: () => void;
  addTimeRecord: (record: Omit<TimeRecord, 'id' | 'createdAt' | 'updatedAt'>) => TimeRecord;
  updateTimeRecord: (id: string, updates: Partial<TimeRecord>) => TimeRecord | null;
  deleteTimeRecord: (id: string) => boolean;
  
  // 习惯记录
  habits: HabitDaily[];
  refreshHabits: () => void;
  updateHabitProgress: (date: string, habitType: 'water' | 'supplement' | 'journal', completed: number) => HabitDaily | null;
  initTodayHabits: (date: string) => HabitDaily[];
  
  // 阅读记录
  bookRecords: BookRecord[];
  refreshBookRecords: () => void;
  addBookRecord: (record: Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>) => BookRecord;
  updateBookRecord: (id: string, updates: Partial<BookRecord>) => BookRecord | null;
  deleteBookRecord: (id: string) => boolean;
  
  // 健身记录
  fitnessRecords: FitnessRecord[];
  refreshFitnessRecords: () => void;
  addFitnessRecord: (record: Omit<FitnessRecord, 'id' | 'createdAt' | 'updatedAt'>) => FitnessRecord;
  updateFitnessRecord: (id: string, updates: Partial<FitnessRecord>) => FitnessRecord | null;
  deleteFitnessRecord: (id: string) => boolean;
  
  // 记账记录
  accountRecords: AccountRecord[];
  refreshAccountRecords: () => void;
  addAccountRecord: (record: Omit<AccountRecord, 'id' | 'createdAt' | 'updatedAt'>) => AccountRecord;
  updateAccountRecord: (id: string, updates: Partial<AccountRecord>) => AccountRecord | null;
  deleteAccountRecord: (id: string) => boolean;
  
  // 待办事项
  todos: TodoItem[];
  refreshTodos: () => void;
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => TodoItem;
  toggleTodoComplete: (id: string) => TodoItem | null;
  updateTodo: (id: string, updates: Partial<TodoItem>) => TodoItem | null;
  deleteTodo: (id: string) => boolean;
  
  // 当前日期
  currentDate: string;
  setCurrentDate: (date: string) => void;
  
  // 刷新所有数据
  refreshAll: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [habits, setHabits] = useState<HabitDaily[]>([]);
  const [bookRecords, setBookRecords] = useState<BookRecord[]>([]);
  const [fitnessRecords, setFitnessRecords] = useState<FitnessRecord[]>([]);
  const [accountRecords, setAccountRecords] = useState<AccountRecord[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // 初始化数据
  useEffect(() => {
    refreshAll();
  }, []);

  const refreshTimeRecords = useCallback(() => {
    setTimeRecords(TimeRecordStorage.getAll());
  }, []);

  const refreshHabits = useCallback(() => {
    setHabits(HabitStorage.getAll());
  }, []);

  const refreshBookRecords = useCallback(() => {
    setBookRecords(BookStorage.getAll());
  }, []);

  const refreshFitnessRecords = useCallback(() => {
    setFitnessRecords(FitnessStorage.getAll());
  }, []);

  const refreshAccountRecords = useCallback(() => {
    setAccountRecords(AccountStorage.getAll());
  }, []);

  const refreshTodos = useCallback(() => {
    setTodos(TodoStorage.getAll());
  }, []);

  const refreshAll = useCallback(() => {
    refreshTimeRecords();
    refreshHabits();
    refreshBookRecords();
    refreshFitnessRecords();
    refreshAccountRecords();
    refreshTodos();
  }, [refreshTimeRecords, refreshHabits, refreshBookRecords, refreshFitnessRecords, refreshAccountRecords, refreshTodos]);

  // 时间记录操作
  const addTimeRecord = useCallback((record: Omit<TimeRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = TimeRecordStorage.add(record);
    refreshTimeRecords();
    return newRecord;
  }, [refreshTimeRecords]);

  const updateTimeRecord = useCallback((id: string, updates: Partial<TimeRecord>) => {
    const result = TimeRecordStorage.update(id, updates);
    refreshTimeRecords();
    return result;
  }, [refreshTimeRecords]);

  const deleteTimeRecord = useCallback((id: string) => {
    const result = TimeRecordStorage.delete(id);
    refreshTimeRecords();
    return result;
  }, [refreshTimeRecords]);

  // 习惯操作
  const updateHabitProgress = useCallback((date: string, habitType: 'water' | 'supplement' | 'journal', completed: number) => {
    const result = HabitStorage.updateProgress(date, habitType, completed);
    refreshHabits();
    return result;
  }, [refreshHabits]);

  const initTodayHabits = useCallback((date: string) => {
    const result = HabitStorage.initTodayHabits(date);
    refreshHabits();
    return result;
  }, [refreshHabits]);

  // 阅读记录操作
  const addBookRecord = useCallback((record: Omit<BookRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = BookStorage.add(record);
    refreshBookRecords();
    return newRecord;
  }, [refreshBookRecords]);

  const updateBookRecord = useCallback((id: string, updates: Partial<BookRecord>) => {
    const result = BookStorage.update(id, updates);
    refreshBookRecords();
    return result;
  }, [refreshBookRecords]);

  const deleteBookRecord = useCallback((id: string) => {
    const result = BookStorage.delete(id);
    refreshBookRecords();
    return result;
  }, [refreshBookRecords]);

  // 健身记录操作
  const addFitnessRecord = useCallback((record: Omit<FitnessRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = FitnessStorage.add(record);
    refreshFitnessRecords();
    return newRecord;
  }, [refreshFitnessRecords]);

  const updateFitnessRecord = useCallback((id: string, updates: Partial<FitnessRecord>) => {
    const result = FitnessStorage.update(id, updates);
    refreshFitnessRecords();
    return result;
  }, [refreshFitnessRecords]);

  const deleteFitnessRecord = useCallback((id: string) => {
    const result = FitnessStorage.delete(id);
    refreshFitnessRecords();
    return result;
  }, [refreshFitnessRecords]);

  // 记账记录操作
  const addAccountRecord = useCallback((record: Omit<AccountRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = AccountStorage.add(record);
    refreshAccountRecords();
    return newRecord;
  }, [refreshAccountRecords]);

  const updateAccountRecord = useCallback((id: string, updates: Partial<AccountRecord>) => {
    const result = AccountStorage.update(id, updates);
    refreshAccountRecords();
    return result;
  }, [refreshAccountRecords]);

  const deleteAccountRecord = useCallback((id: string) => {
    const result = AccountStorage.delete(id);
    refreshAccountRecords();
    return result;
  }, [refreshAccountRecords]);

  // 待办事项操作
  const addTodo = useCallback((todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo = TodoStorage.add(todo);
    refreshTodos();
    return newTodo;
  }, [refreshTodos]);

  const toggleTodoComplete = useCallback((id: string) => {
    const result = TodoStorage.toggleComplete(id);
    refreshTodos();
    return result;
  }, [refreshTodos]);

  const updateTodo = useCallback((id: string, updates: Partial<TodoItem>) => {
    const result = TodoStorage.update(id, updates);
    refreshTodos();
    return result;
  }, [refreshTodos]);

  const deleteTodo = useCallback((id: string) => {
    const result = TodoStorage.delete(id);
    refreshTodos();
    return result;
  }, [refreshTodos]);

  return (
    <DataContext.Provider value={{
      timeRecords,
      refreshTimeRecords,
      addTimeRecord,
      updateTimeRecord,
      deleteTimeRecord,
      
      habits,
      refreshHabits,
      updateHabitProgress,
      initTodayHabits,
      
      bookRecords,
      refreshBookRecords,
      addBookRecord,
      updateBookRecord,
      deleteBookRecord,
      
      fitnessRecords,
      refreshFitnessRecords,
      addFitnessRecord,
      updateFitnessRecord,
      deleteFitnessRecord,
      
      accountRecords,
      refreshAccountRecords,
      addAccountRecord,
      updateAccountRecord,
      deleteAccountRecord,
      
      todos,
      refreshTodos,
      addTodo,
      toggleTodoComplete,
      updateTodo,
      deleteTodo,
      
      currentDate,
      setCurrentDate,
      refreshAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}