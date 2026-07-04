# 项目上下文

### 项目概述
个人时间与习惯管理系统 - 一个静谧、井然有序的私人生活记录空间。

### 版本技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **数据存储**: localStorage (离线优先架构)

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── page.tsx        # 月历概览页面（首页）
│   │   ├── timeline/       # 24h时间轴页面
│   │   │   └── page.tsx
│   │   └── today/          # 今日待办页面
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/             # Shadcn UI 组件库
│   │   ├── providers/      # 全局Provider
│   │   │   ├── theme-provider.tsx  # 主题Provider
│   │   │   └── data-provider.tsx   # 数据Provider
│   │   ├── layout/         # 布局组件
│   │   │   └── bottom-nav.tsx      # 底部导航栏
│   │   ├── calendar/       # 月历相关组件
│   │   │   ├── calendar-grid.tsx   # 月历网格
│   │   │   ├── month-selector.tsx  # 月份选择器
│   │   │   └── day-detail-modal.tsx # 日期详情弹窗
│   │   ├── progress/       # 进度组件
│   │   │   └── progress-cards.tsx  # 四维进度卡片
│   │   └── modals/         # 各种弹窗组件
│   │       ├── time-record-modal.tsx    # 时间记录弹窗
│   │       ├── habit-update-modal.tsx   # 习惯更新弹窗
│   │       ├── book-record-modal.tsx    # 阅读记录弹窗
│   │       ├── fitness-record-modal.tsx # 健身记录弹窗
│   │       └── account-record-modal.tsx # 记账弹窗
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── utils.ts        # 通用工具函数 (cn)
│   │   └── storage.ts      # localStorage服务
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts        # 数据模型定义
│   └── server.ts           # 自定义服务端入口
├── DESIGN.md               # 设计规范文档
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 核心架构

### 1. 三页固定架构
- **月历概览** (`/`): 月历三层渲染（时序圆点+习惯底条+记账角点）+ 四维进度卡片
- **24h时间轴** (`/timeline`): 竖向时间轴，可视化一天时间分配
- **今日待办** (`/today`): 待办事项 + 三项习惯 + 专项记录入口

### 2. A/B/C三轨数据架构
- **A轨**: `time_record` - 主时序表（时间记录）
- **B轨**: `habit_daily` - 主习惯表（三项固定习惯）
- **C轨**: 三张专项附属表
  - `user_book_record` - 阅读记录
  - `user_fitness_record` - 健身记录
  - `user_account_record` - 记账记录

### 3. 两套隔离分类体系
- **飞书7大时间分类**: 工作/学习/生活/娱乐/社交/休息/其他
- **记账专属收支分类**: 
  - 收入: 工资/奖金/投资收益/礼物红包/退款/其他
  - 支出: 餐饮/交通/购物/娱乐/教育/健康/住房/通讯/其他

### 4. 离线优先localStorage架构
- 所有数据存储在localStorage
- 支持数据导出/导入（备份功能）
- 自动初始化今日习惯数据

### 5. 全局CSS变量 + 深浅主题
- 主题色: 墨水蓝、朱砂红、暖灰
- 功能色: 习惯完成色、阅读琥珀、健身珊瑚、记账收支色
- 分类色: 飞书7大分类各有独立颜色
- 支持light/dark主题切换

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范
- 默认按 TypeScript `strict` 心智写代码
- 禁止隐式 `any` 和 `as any`
- 使用 'use client' 指令标记客户端组件
- Hydration问题防范：动态内容使用 useEffect + useState

### 响应式适配
- 移动端: 320px - 480px
- 平板端: 768px - 1024px
- 桌面端: 1024px+
- 底部导航：移动端底部固定，桌面端顶部固定

### 组件开发
- 使用 shadcn/ui 组件库
- 所有弹窗使用 Dialog 组件
- 列表使用 ScrollArea 实现滚动
- 使用 Badge 标记状态和分类

## 修改指南

### 添加新时间分类
1. 修改 `src/types/index.ts` - 添加分类类型和配置
2. 修改 `src/app/globals.css` - 添加分类颜色变量
3. 更新相关组件的分类选项

### 添加新习惯类型
1. 修改 `src/types/index.ts` - 添加习惯类型和配置
2. 修改 `src/lib/storage.ts` - HabitStorage 支持新类型
3. 修改 `src/app/today/page.tsx` - 显示新习惯卡片

### 添加新专项记录
1. 创建新的类型定义
2. 创建新的storage方法
3. 创建新的弹窗组件
4. 添加到日期详情弹窗和今日待办页面

## 测试与验证

运行 `pnpm ts-check` 进行类型检查
运行 `pnpm lint:build` 进行构建检查
使用 `test_run` 工具进行全面验证