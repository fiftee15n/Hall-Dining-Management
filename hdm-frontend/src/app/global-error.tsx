'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Critical Application Error</h2>
          <p className="text-sm text-slate-500 mb-6">
            {error?.message || 'A global error occurred. Please refresh or reset.'}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
