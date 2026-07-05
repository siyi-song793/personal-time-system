'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  TimeStorage,
  HabitStorage,
  BookStorage,
  FitnessStorage,
  AccountStorage,
  TodoStorage,
} from '@/lib/storage';
import type {
  TimeRecord,
  HabitRecord,
  BookRecord,
  FitnessRecord,
  AccountRecord,
  TodoItem,
} from '@/types';

interface DataContextType {
  // 时间记录
  timeRecords: TimeRecord[];
  refreshTimeRecords: () => void;
  
  // 习惯记录
  habitRecords: HabitRecord[];
  refreshHabitRecords: () => void;
  
  // 阅读记录
  bookRecords: BookRecord[];
  refreshBookRecords: () => void;
  
  // 健身记录
  fitnessRecords: FitnessRecord[];
  refreshFitnessRecords: () => void;
  
  // 记账记录
  accountRecords: AccountRecord[];
  refreshAccountRecords: () => void;
  
  // 待办事项
  todos: TodoItem[];
  refreshTodos: () => void;
  
  // 当前日期
  currentDate: string;
  setCurrentDate: (date: string) => void;
  
  // 刷新所有数据
  refreshAll: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [habitRecords, setHabitRecords] = useState<HabitRecord[]>([]);
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
    setTimeRecords(TimeStorage.getAll());
  }, []);

  const refreshHabitRecords = useCallback(() => {
    setHabitRecords(HabitStorage.getAll());
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
    refreshHabitRecords();
    refreshBookRecords();
    refreshFitnessRecords();
    refreshAccountRecords();
    refreshTodos();
  }, [refreshTimeRecords, refreshHabitRecords, refreshBookRecords, refreshFitnessRecords, refreshAccountRecords, refreshTodos]);

  const value: DataContextType = {
    timeRecords,
    refreshTimeRecords,
    habitRecords,
    refreshHabitRecords,
    bookRecords,
    refreshBookRecords,
    fitnessRecords,
    refreshFitnessRecords,
    accountRecords,
    refreshAccountRecords,
    todos,
    refreshTodos,
    currentDate,
    setCurrentDate,
    refreshAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
