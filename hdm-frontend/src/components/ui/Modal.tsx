import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    full: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={cn(
          'w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-200',
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="px-4 py-3.5 sm:px-7 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h3>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex-shrink-0"
            title="Close dialog (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 sm:px-7 sm:py-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

