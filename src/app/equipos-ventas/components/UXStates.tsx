/**
 * COMPONENT: LOADING, ERROR & EMPTY STATES
 * 
 * @description Componentes reutilizables para estados de carga (skeleton),
 * manejo de errores con retry, y estados vacíos con ilustraciones.
 * Mejora UX eliminando pantallas blancas y dando feedback visual.
 */

'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Inbox, Search, BarChart3, Users } from 'lucide-react';

/* ─── SKELETON LOADER ─────────────────────────────────────────── */

interface SkeletonProps {
  lines?: number;
  type?: 'card' | 'table' | 'chart' | 'list';
}

export const SkeletonLoader = ({ lines = 3, type = 'card' }: SkeletonProps) => {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-3 bg-slate-100 rounded flex-1" />
              <div className="h-3 bg-slate-100 rounded w-20" />
              <div className="h-3 bg-slate-100 rounded w-16" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="flex items-end gap-3 h-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 bg-slate-100 rounded-t-lg" style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-2 bg-slate-100 rounded w-1/3" />
            </div>
            <div className="h-6 bg-slate-100 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Default: card skeleton
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-100 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        ))}
      </div>
    </div>
  );
};

/* ─── ERROR STATE ─────────────────────────────────────────────── */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'Error al cargar datos',
  message = 'No pudimos obtener la información. Verifica tu conexión e intenta de nuevo.',
  onRetry,
}: ErrorStateProps) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center">
    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle size={28} className="text-red-500" />
    </div>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 mx-auto transition-colors"
      >
        <RefreshCw size={14} /> Reintentar
      </button>
    )}
  </div>
);

/* ─── EMPTY STATE ─────────────────────────────────────────────── */

type EmptyIcon = 'inbox' | 'search' | 'chart' | 'team';

const EMPTY_ICONS: Record<EmptyIcon, React.ElementType> = {
  inbox: Inbox,
  search: Search,
  chart: BarChart3,
  team: Users,
};

interface EmptyStateProps {
  icon?: EmptyIcon;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon = 'inbox',
  title = 'No hay datos',
  message = 'Aún no hay información disponible para mostrar.',
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const Icon = EMPTY_ICONS[icon];
  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
        <Icon size={32} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
