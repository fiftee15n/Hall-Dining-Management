import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-2xl"></div>
    </div>
  );
}
