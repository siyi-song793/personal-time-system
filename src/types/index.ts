// A/B/C三轨数据架构类型定义

// ==================== 飞书7大时间分类 ====================
export type TimeCategory = 
  | 'work'      // 工作
  | 'study'     // 学习
  | 'life'      // 生活
  | 'entertainment' // 娱乐
  | 'social'    // 社交
  | 'rest'      // 休息
  | 'other';    // 其他

export const TIME_CATEGORIES: Record<TimeCategory, { name: string; color: string }> = {
  work: { name: '工作', color: 'oklch(0.55 0.18 250)' },
  study: { name: '学习', color: 'oklch(0.55 0.15 280)' },
  life: { name: '生活', color: 'oklch(0.55 0.12 35)' },
  entertainment: { name: '娱乐', color: 'oklch(0.55 0.18 320)' },
  social: { name: '社交', color: 'oklch(0.55 0.12 165)' },
  rest: { name: '休息', color: 'oklch(0.55 0.08 60)' },
  other: { name: '其他', color: 'oklch(0.55 0.05 0)' },
};

// ==================== 记账收支分类（完全独立体系） ====================
export type IncomeCategory = 
  | 'salary'      // 工资
  | 'bonus'       // 奖金
  | 'investment'  // 投资收益
  | 'gift'        // 礼物/红包
  | 'refund'      // 退款
  | 'other_income'; // 其他收入

export type ExpenseCategory = 
  | 'food'        // 餐饮
  | 'transport'   // 交通
  | 'shopping'    // 购物
  | 'entertainment' // 娱乐
  | 'education'   // 教育
  | 'health'      // 健康
  | 'housing'     // 住房
  | 'communication' // 通讯
  | 'other_expense'; // 其他支出

export const INCOME_CATEGORIES: Record<IncomeCategory, { name: string; color: string }> = {
  salary: { name: '工资', color: 'oklch(0.72 0.12 165)' },
  bonus: { name: '奖金', color: 'oklch(0.72 0.12 165)' },
  investment: { name: '投资收益', color: 'oklch(0.72 0.12 165)' },
  gift: { name: '礼物/红包', color: 'oklch(0.72 0.12 165)' },
  refund: { name: '退款', color: 'oklch(0.72 0.12 165)' },
  other_income: { name: '其他收入', color: 'oklch(0.72 0.12 165)' },
};

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { name: string; color: string }> = {
  food: { name: '餐饮', color: 'oklch(0.68 0.15 50)' },
  transport: { name: '交通', color: 'oklch(0.68 0.15 50)' },
  shopping: { name: '购物', color: 'oklch(0.68 0.15 50)' },
  entertainment: { name: '娱乐', color: 'oklch(0.68 0.15 50)' },
  education: { name: '教育', color: 'oklch(0.68 0.15 50)' },
  health: { name: '健康', color: 'oklch(0.68 0.15 50)' },
  housing: { name: '住房', color: 'oklch(0.68 0.15 50)' },
  communication: { name: '通讯', color: 'oklch(0.68 0.15 50)' },
  other_expense: { name: '其他支出', color: 'oklch(0.68 0.15 50)' },
};

// ==================== A轨：time_record 主时序表 ====================
export interface TimeRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  category: TimeCategory;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== B轨：habit_daily 主习惯表 ====================
export type HabitType = 'water' | 'supplement' | 'journal';

export interface HabitDaily {
  id: string;
  date: string;           // YYYY-MM-DD
  habitType: HabitType;
  target: number;         // 目标值（饮水2000ml）
  completed: number;      // 完成值
  isCompleted: boolean;   // 是否达标
  createdAt: string;
  updatedAt: string;
}

export const HABIT_CONFIGS: Record<HabitType, { name: string; target: number; unit: string; icon: string }> = {
  water: { name: '饮水', target: 2000, unit: 'ml', icon: '💧' },
  supplement: { name: '保健品', target: 1, unit: '次', icon: '💊' },
  journal: { name: '手帐', target: 1, unit: '次', icon: '📝' },
};

// ==================== C轨：专项附属表 ====================

// C1: user_book_record 阅读记录
export interface BookRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  bookTitle: string;
  author?: string;
  pagesRead: number;      // 今日阅读页数
  totalPages?: number;    // 总页数
  readingTime?: number;   // 阅读时长（分钟）
  notes?: string;         // 阅读笔记
  createdAt: string;
  updatedAt: string;
}

// C2: user_fitness_record 健身记录
export type FitnessType = 'running' | 'swimming' | 'gym' | 'yoga' | 'cycling' | 'other';

export interface FitnessRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  fitnessType: FitnessType;
  duration: number;       // 时长（分钟）
  calories?: number;      // 卡路里
  distance?: number;      // 距离（公里）
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const FITNESS_TYPES: Record<FitnessType, { name: string; icon: string }> = {
  running: { name: '跑步', icon: '🏃' },
  swimming: { name: '游泳', icon: '🏊' },
  gym: { name: '健身', icon: '💪' },
  yoga: { name: '瑜伽', icon: '🧘' },
  cycling: { name: '骑行', icon: '🚴' },
  other: { name: '其他', icon: '🎯' },
};

// C3: user_account_record 记账记录
export type AccountType = 'income' | 'expense';

export interface AccountRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  type: AccountType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 待办事项 ====================
export interface TodoItem {
  id: string;
  date: string;           // YYYY-MM-DD
  title: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  dueTime?: string;       // HH:mm
  createdAt: string;
  updatedAt: string;
}

// ==================== 进度统计 ====================
export interface ProgressStats {
  year: {
    timeRecords: number;
    habitsCompleted: number;
    booksRead: number;
    fitnessSessions: number;
    totalSavings: number;
  };
  month: {
    timeRecords: number;
    habitsCompletedRate: number;
    booksRead: number;
    fitnessSessions: number;
    balance: number;
  };
  week: {
    timeRecords: number;
    habitsCompletedRate: number;
    booksRead: number;
    fitnessSessions: number;
    balance: number;
  };
  day: {
    timeRecords: number;
    habitsCompleted: number;
    booksRead: number;
    fitnessDone: boolean;
    balance: number;
  };
}

// ==================== 月历渲染数据 ====================
export interface CalendarDayData {
  date: string;
  timeRecords: TimeRecord[];
  habits: HabitDaily[];
  accountRecords: AccountRecord[];
  hasTimeRecord: boolean;   // 时序圆点
  hasHabitCompleted: boolean; // 习惯底条
  hasAccountRecord: boolean; // 记账角点
}