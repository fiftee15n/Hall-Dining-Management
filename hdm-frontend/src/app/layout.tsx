import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MessProvider } from '@/context/MessContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'New Female Hall Dining — Gazipur Agriculture University',
  description: 'Dining and mess management system for New Female Hall, Gazipur Agriculture University.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex antialiased">
        <MessProvider>
          <div className="flex w-full min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
              <Header />
              <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
            </div>
          </div>
        </MessProvider>
      </body>
    </html>
  );
}
