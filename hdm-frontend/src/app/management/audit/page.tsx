'use client';

import React from 'react';
import { useMess } from '@/context/MessContext';
import {
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs } = useMess();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900">System Audit & Compliance Log</h1>
        <p className="text-xs text-slate-500">
          Immutable audit trail of financial actions and dining booking changes
        </p>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No audit records logged.</p>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 px-1.5 py-0.5 rounded bg-slate-200 text-[10px]">
                      {log.action}
                    </span>
                    <span className="font-medium text-slate-700">{log.details}</span>
                  </div>
                  {log.entityType && (
                    <span className="text-[10px] text-slate-400 block">
                      Target: {log.entityType} #{log.entityId?.slice(-6) || ''}
                    </span>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 block">{log.timestamp}</span>
                  <span className="text-[10px] font-bold text-slate-600">by {log.user}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
