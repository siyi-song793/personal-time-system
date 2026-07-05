import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { DataProvider } from '@/components/providers/data-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PWARegister } from '@/components/providers/pwa-register';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6b8cae',
};

export const metadata: Metadata = {
  title: {
    default: '个人时间与习惯管理系统',
    template: '%s | 时间习惯',
  },
  description: '一个静谧、井然有序的私人生活记录空间。月历概览、时间轴、待办事项、习惯追踪、专项记录。',
  keywords: [
    '时间管理',
    '习惯追踪',
    '待办事项',
    '月历',
    '时间轴',
    '阅读记录',
    '健身记录',
    '记账',
  ],
  authors: [{ name: 'Personal Life Tracker' }],
  generator: 'Coze Code',
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '时间管理',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased min-h-screen bg-background`}>
        <PWARegister />
        <ThemeProvider>
          <DataProvider>
            <div className="flex flex-col min-h-screen pb-16 md:pb-0">
              <main className="flex-1">
                {children}
              </main>
              <BottomNav />
            </div>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}