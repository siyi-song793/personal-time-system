'use client';

interface ProgressCardsProps {
  progress: {
    year: number;
    month: number;
    week: number;
    day: number;
  };
}

export function ProgressCards({ progress }: ProgressCardsProps) {
  const cards = [
    { label: '年', value: progress.year, color: '#4285E4' },
    { label: '月', value: progress.month, color: '#34A853' },
    { label: '周', value: progress.week, color: '#FBBC05' },
    { label: '日', value: progress.day, color: '#FF6B35' }
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {cards.map(card => (
        <div
          key={card.label}
          className="relative p-3 bg-card rounded-[var(--radius-standard)] shadow-[var(--shadow-global)]"
          style={{ minWidth: 'var(--min-width-progress-card)' }}
        >
          {/* 进度环 */}
          <div className="relative w-10 h-10 mx-auto mb-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* 背景圆环 */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="3"
              />
              {/* 进度圆环 */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={card.color}
                strokeWidth="3"
                strokeDasharray={`${card.value * 0.88} 88`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            {/* 中心数值 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: card.color }}>
                {card.value}%
              </span>
            </div>
          </div>
          {/* 标签 */}
          <div className="text-center text-xs text-muted-foreground">
            {card.label}进度
          </div>
        </div>
      ))}
    </div>
  );
}
