// ============================================
// 行为三级分类（全时间模块通用）
// ============================================

// 一级分类
export type FirstCategory =
  | '学习成长'
  | '工作事务'
  | '运动健康'
  | '休息娱乐'
  | '外出出行'
  | '生活日常'
  | '其他';

// 二级分类映射
export const CATEGORY_TREE: Record<FirstCategory, { color: string; second: Record<string, string[]> }> = {
  '学习成长': {
    color: '#4285E4',
    second: {
      '自媒体': ['拍摄', '剪辑', '文案', '运营'],
      '认知提升': ['阅读', '课程', '浏览'],
      '技能提升': ['专业', '软件', '语言']
    }
  },
  '工作事务': {
    color: '#757575',
    second: {
      '办公': [],
      '外勤': [],
      '其他': []
    }
  },
  '运动健康': {
    color: '#34A853',
    second: {
      '健身': ['力量', '体态', '拉伸'],
      '运动': ['步行', '骑行', '游泳', '其他']
    }
  },
  '休息娱乐': {
    color: '#A962FF',
    second: {
      '线上': ['手机', '剧综', '游戏', '影音'],
      '线下': ['逛街', '看展', '聚会', '体验']
    }
  },
  '外出出行': {
    color: '#24C1E0',
    second: {
      '通勤': ['公共交通', '自驾'],
      '采购': ['超市', '日常'],
      '其他外出': []
    }
  },
  '生活日常': {
    color: '#FBBC05',
    second: {
      '家务': ['清洁', '衣物', '收纳'],
      '护理': ['仪容', '卫生', '睡眠'],
      '饮食保健': ['正餐', '饮水', '保健', '零食']
    }
  },
  '其他': {
    color: '#B8B8B8',
    second: {
      '未归类': []
    }
  }
};

// 获取一级分类列表
export const FIRST_CATEGORIES = Object.keys(CATEGORY_TREE) as FirstCategory[];

// 获取一级分类颜色
export const getCategoryColor = (category: FirstCategory): string => {
  return CATEGORY_TREE[category]?.color || '#B8B8B8';
};

// 获取二级分类列表
export const getSecondCategories = (first: FirstCategory): string[] => {
  return Object.keys(CATEGORY_TREE[first]?.second || {});
};

// 获取三级分类列表
export const getThirdCategories = (first: FirstCategory, second: string): string[] => {
  return CATEGORY_TREE[first]?.second[second] || [];
};

// ============================================
// 记账收支分类（独立子系统，仅记账使用）
// ============================================

export type AccountType = 'income' | 'expense';

// 支出一级分类
export type ExpenseFirstCategory =
  | '饮食餐饮'
  | '外出出行'
  | '居家日常'
  | '娱乐购物'
  | '其他支出';

// 支出一级分类对应的二级分类
export const EXPENSE_CATEGORIES: Record<ExpenseFirstCategory, string[]> = {
  '饮食餐饮': ['食材自购', '外卖餐厅', '零食饮品'],
  '外出出行': ['公共交通', '打车网约车', '自驾油费停车'],
  '居家日常': ['住房物业', '日用消耗', '通讯网络', '健康护理'],
  '娱乐购物': ['休闲娱乐', '购物消费', '会员充值'],
  '其他支出': ['人情往来', '杂项支出', '应急支出']
};

// 收入分类
export type IncomeCategory = '工资收入' | '副业收入' | '红包礼金' | '其他收入';
export const INCOME_CATEGORIES: IncomeCategory[] = ['工资收入', '副业收入', '红包礼金', '其他收入'];

// 记账标签自动判定
export type AccountTag = '刚需消费' | '品质消费' | '冲动消费';

// 刚需消费关键词
export const NECESSARY_KEYWORDS = ['房租', '水电', '食材', '交通', '药品', '话费', '正餐', '公共交通'];
// 品质消费关键词
export const QUALITY_KEYWORDS = ['健身', '书籍', '护肤', '家居', '课程', '专业'];
// 冲动消费关键词
export const IMPULSE_KEYWORDS = ['零食', '奶茶', '网购', '游戏', '充值', '娱乐'];

// 自动判定标签
export const autoDetectTag = (category: string, note?: string): AccountTag => {
  const text = `${category} ${note || ''}`;
  
  if (IMPULSE_KEYWORDS.some(k => text.includes(k))) return '冲动消费';
  if (QUALITY_KEYWORDS.some(k => text.includes(k))) return '品质消费';
  if (NECESSARY_KEYWORDS.some(k => text.includes(k))) return '刚需消费';
  
  return '刚需消费'; // 默认
};

// ============================================
// A轨：时间记录（主时序表）
// ============================================

export interface TimeRecord {
  id: string;
  title: string;
  // 行为三级分类
  firstCategory: FirstCategory;
  secondCategory: string;
  thirdCategory?: string;
  // 时间信息
  startTime: string; // ISO格式
  endTime: string;   // ISO格式
  duration: number;  // 分钟
  // 状态
  date: string;      // YYYY-MM-DD
  isPlanned: boolean; // 计划/实际
  isCompleted: boolean;
  // 关联
  todoId?: string;    // 关联的待办ID
  accountIds?: string[]; // 关联的账单ID列表
  // 元数据
  createdAt: string;
  updatedAt: string;
  // 扩展
  tags?: string[];    // 自定义标签
  note?: string;
}

// ============================================
// B轨：习惯记录（主习惯表）
// ============================================

export interface HabitRecord {
  id: string;
  date: string; // YYYY-MM-DD
  // 三项固定习惯
  water: {
    completed: boolean;
    amount: number; // ml，目标2000ml
  };
  supplements: {
    completed: boolean;
  };
  journal: {
    completed: boolean;
  };
  // 元数据
  createdAt: string;
  updatedAt: string;
}

// ============================================
// C轨：专项附属表
// ============================================

// 阅读记录
export interface BookRecord {
  id: string;
  bookName: string;
  author?: string;
  bookType?: string; // 类型/分类
  startPage?: number;
  endPage?: number;
  note?: string;
  date: string; // YYYY-MM-DD
  duration?: number; // 阅读时长（分钟）
  timeRecordId?: string; // 关联时间记录ID
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// 健身记录
export interface FitnessRecord {
  id: string;
  trainingType: string; // 训练类型：力量/体态/拉伸/步行/骑行/游泳等
  sets?: number;        // 组数
  weight?: number;      // 负重(kg)
  feeling?: string;     // 感受
  bodyWeight?: number;  // 体重(kg)
  date: string;         // YYYY-MM-DD
  duration?: number;    // 训练时长（分钟）
  calories?: number;    // 消耗卡路里
  distance?: number;    // 距离(km)
  timeRecordId?: string; // 关联时间记录ID
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// 记账记录
export interface AccountRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: AccountType; // 收入/支出
  // 分类（使用独立的记账分类体系）
  firstCategory: ExpenseFirstCategory | IncomeCategory;
  secondCategory?: string;
  amount: number;
  account?: string; // 支付账户：微信/支付宝/银行卡/现金/信用卡/其他
  tag?: AccountTag; // 自动判定标签
  note?: string;
  // 关联
  timeRecordId?: string; // 关联时间记录ID
  // 元数据
  createdAt: string;
  updatedAt: string;
  tags?: string[]; // 自定义标签
}

// ============================================
// 待办事项
// ============================================

export interface TodoItem {
  id: string;
  title: string;
  // 行为三级分类
  firstCategory: FirstCategory;
  secondCategory: string;
  thirdCategory?: string;
  // 状态
  isCompleted: boolean;
  date: string; // YYYY-MM-DD
  // 时间（可选，有时间则进入时间轴）
  startTime?: string;
  endTime?: string;
  // 关联
  timeRecordId?: string; // 完成后自动生成的时间记录ID
  // 元数据
  createdAt: string;
  updatedAt: string;
  note?: string;
}

// ============================================
// 计划（四级：年/月/周/日）
// ============================================

export type PlanLevel = 'year' | 'month' | 'week' | 'day';

export interface Plan {
  id: string;
  level: PlanLevel;
  title: string;
  date: string; // 对应日期：年-01-01，月-01，周-周一，日-当天
  isCompleted: boolean;
  children?: string[]; // 子计划ID列表
  parentId?: string;   // 父计划ID
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 撤销操作记录
// ============================================

export interface UndoAction {
  id: string;
  actionType: 'create' | 'update' | 'delete';
  entityType: 'time' | 'habit' | 'book' | 'fitness' | 'account' | 'todo' | 'plan';
  entityId: string;
  beforeData?: unknown;
  afterData?: unknown;
  timestamp: string;
  expiresAt: string; // 24小时后过期
}

// ============================================
// 统计相关
// ============================================

export interface DailyStats {
  date: string;
  totalMinutes: number;
  categoryMinutes: Record<FirstCategory, number>;
  habitCompleted: {
    water: boolean;
    supplements: boolean;
    journal: boolean;
  };
  accountTotal: {
    income: number;
    expense: number;
  };
}

export interface ProgressData {
  year: { completed: number; total: number; percentage: number };
  month: { completed: number; total: number; percentage: number };
  week: { completed: number; total: number; percentage: number };
  day: { completed: number; total: number; percentage: number };
}

// ============================================
// 习惯类型（用于UI显示）
// ============================================

export type HabitType = 'water' | 'supplements' | 'journal';

export const HABIT_CONFIG: Record<HabitType, { label: string; unit: string; target: number; color: string }> = {
  water: { label: '饮水', unit: 'ml', target: 2000, color: '#4285E4' },
  supplements: { label: '保健品', unit: '次', target: 1, color: '#34A853' },
  journal: { label: '手帐', unit: '次', target: 1, color: '#FBBC05' }
};

// ============================================
// 全局数据类型
// ============================================

export interface AppData {
  timeRecords: TimeRecord[];
  habitRecords: HabitRecord[];
  bookRecords: BookRecord[];
  fitnessRecords: FitnessRecord[];
  accountRecords: AccountRecord[];
  todos: TodoItem[];
  plans: Plan[];
  undoActions: UndoAction[];
}

// ============================================
// 日历相关
// ============================================

export interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTimeRecord: boolean;
  hasHabitCompleted: boolean;
  habitPartial: boolean;
  hasAccountRecord: boolean;
  hasIncome: boolean;
  timeRecords: TimeRecord[];
  habits: HabitRecord | null;
  accountRecords: AccountRecord[];
}

// ============================================
// 分类语义映射（用于首页大盘汇总）
// ============================================

export const CATEGORY_SEMANTIC_MAP: Record<FirstCategory, string[]> = {
  '学习成长': ['阅读', '课程', '自媒体', '技能'],
  '工作事务': ['办公', '外勤', '工作'],
  '运动健康': ['健身', '运动', '步行', '骑行'],
  '休息娱乐': ['手机', '剧综', '游戏', '逛街', '聚会'],
  '外出出行': ['通勤', '采购', '交通'],
  '生活日常': ['家务', '护理', '饮食', '饮水'],
  '其他': ['未归类']
};
