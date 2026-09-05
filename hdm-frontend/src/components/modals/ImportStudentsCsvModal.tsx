'use client';

import React, { useState, useRef } from 'react';
import { useMess } from '@/context/MessContext';
import { Modal } from '@/components/ui/Modal';
import { Student } from '@/types';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

interface ImportStudentsCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedStudentRow {
  name: string;
  block: Student['block'];
  room: string;
  isValid: boolean;
  error?: string;
}

const SAMPLE_CSV_CONTENT = `name,block,room
Priya Bain,D,325
Prome Das,D,325
Asma Sulker Anika,D,325
Api Roy,D,325
Simanti Rani,D,326
Adrita Saha,D,326
Toma Rani,D,326
Nashat Rahman,D,326`;

export function ImportStudentsCsvModal({ isOpen, onClose }: ImportStudentsCsvModalProps) {
  const { importStudents } = useMess();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      alert('CSV file appears empty or is missing header row.');
      return;
    }

    const headerCols = lines[0]
      .split(',')
      .map((h) => h.trim().toLowerCase().replace(/['"_\s]/g, ''));

    // Find column positions for name, block, room
    const nameIdx = headerCols.findIndex((col) =>
      ['name', 'studentname', 'fullname'].some((k) => col.includes(k))
    );
    const blockIdx = headerCols.findIndex((col) =>
      ['block', 'building'].some((k) => col.includes(k))
    );
    const roomIdx = headerCols.findIndex((col) =>
      ['room', 'roomno', 'roomnumber'].some((k) => col.includes(k))
    );

    if (nameIdx === -1 || roomIdx === -1) {
      alert('CSV must contain at least "name" and "room" header columns.');
      return;
    }

    const rows: ParsedStudentRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rowCols = lines[i]
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((val) => val.trim().replace(/^["']|["']$/g, ''));

      const name = rowCols[nameIdx]?.trim() || '';
      const room = rowCols[roomIdx]?.trim() || '';
      const rawBlock = blockIdx !== -1 ? rowCols[blockIdx]?.trim().toUpperCase() : 'A';
      const block: Student['block'] = ['A', 'B', 'C', 'D', 'Main', 'Ext'].includes(rawBlock)
        ? (rawBlock as any)
        : 'A';

      const isValid = Boolean(name && room);
      const error = !name ? 'Missing Name' : !room ? 'Missing Room' : undefined;

      rows.push({
        name,
        block,
        room,
        isValid,
        error,
      });
    }

    setParsedRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvText(text);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert('Error reading CSV file');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid student rows found to import.');
      return;
    }

    const payload = validRows.map((r, idx) => ({
      name: r.name,
      studentId: `2024-${String(idx + 101).padStart(3, '0')}`,
      block: r.block,
      room: r.room,
      phone: '01700-000000',
      department: 'General Department',
      batch: '50',
      status: 'active' as const,
    }));

    const count = importStudents(payload);
    setImportedCount(count);

    setTimeout(() => {
      setImportedCount(null);
      setParsedRows([]);
      setFileName('');
      onClose();
    }, 1200);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setParsedRows([]);
        setFileName('');
        setImportedCount(null);
        onClose();
      }}
      title="Import Student Directory from CSV"
      subtitle="Bulk upload student resident records with Name, Block, and Room numbers"
      maxWidth="xl"
    >
      {importedCount !== null ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Import Successful!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Successfully imported <strong>{importedCount}</strong> student resident records into the hall directory.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          {/* Template Download Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-200/80 text-slate-800">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Download Pre-Formatted CSV Template</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensure columns include: <strong className="text-slate-800">name, block, room</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-xl text-xs transition shadow-2xs self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {parsedRows.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-10 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-3xl bg-slate-50/40 hover:bg-slate-50 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-slate-900 group-hover:text-white text-slate-700 border border-slate-200 shadow-xs flex items-center justify-center transition-all">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Click to browse or drop your CSV file here</p>
                <p className="text-xs text-slate-500 mt-1">Accepts standard .csv UTF-8 format</p>
              </div>
            </div>
          ) : (
            /* File & Preview Section */
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-slate-900 text-sm">{fileName}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {validCount} valid records found
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                  title="Choose another file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200/90 rounded-2xl max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-3">Student Full Name</th>
                      <th className="p-3">Block</th>
                      <th className="p-3">Room No</th>
                      <th className="p-3">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60'}>
                        <td className="p-3 font-bold text-slate-900">{row.name || '—'}</td>
                        <td className="p-3 font-medium text-slate-600">Block {row.block}</td>
                        <td className="p-3 font-bold text-slate-900">{row.room}</td>
                        <td className="p-3">
                          {row.isValid ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              Valid ✓
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                              <AlertCircle className="w-3 h-3" />
                              <span>{row.error}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
            >
              Cancel
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validCount === 0}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition"
              >
                Confirm Import ({validCount} Students)
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

