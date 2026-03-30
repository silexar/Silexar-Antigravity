/**
 * COMPONENT: EXPORT DATA BUTTON
 * 
 * @description Botón reutilizable para exportar datos de tablas y dashboards
 * en formato CSV. Soporta cualquier array de objetos. Mejora operativa
 * para que el usuario pueda descargar reportes.
 */

'use client';

import React, { useState } from 'react';
import { Download, Check, FileSpreadsheet } from 'lucide-react';

interface ExportDataButtonProps {
  /** Data to export as CSV */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  /** Filename without extension */
  filename?: string;
  /** Custom headers mapping: { key: 'Display Name' } */
  headers?: Record<string, string>;
  /** Button label */
  label?: string;
  /** Compact mode (icon only) */
  compact?: boolean;
}

export const ExportDataButton = ({
  data,
  filename = 'export',
  headers,
  label = 'Exportar CSV',
  compact = false,
}: ExportDataButtonProps) => {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    if (!data.length) return;

    const keys = headers ? Object.keys(headers) : Object.keys(data[0]);
    const headerRow = headers
      ? keys.map(k => headers[k])
      : keys;

    const csvRows = [
      headerRow.join(','),
      ...data.map(row =>
        keys.map(key => {
          const val = row[key];
          // Escape commas and quotes
          const str = String(val ?? '');
          return str.includes(',') || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  if (compact) {
    return (
      <button
        onClick={handleExport}
        className={`p-2 rounded-lg transition-colors ${exported ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
        title={label}
      >
        {exported ? <Check size={14} /> : <Download size={14} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
        exported
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
      }`}
    >
      {exported ? <Check size={12} /> : <FileSpreadsheet size={12} />}
      {exported ? 'Descargado ✓' : label}
    </button>
  );
};
