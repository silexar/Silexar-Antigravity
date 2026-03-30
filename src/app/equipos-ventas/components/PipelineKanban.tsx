/**
 * COMPONENT: PIPELINE KANBAN BOARD
 * 
 * @description Tablero Kanban visual para gestión de pipeline.
 * Deals organizados por stage en columnas con drag-and-drop visual,
 * totales por stage, indicadores de riesgo, y click-to-expand.
 * Diseño enterprise-grade con colores por stage.
 */

'use client';

import React, { useState } from 'react';
import {
  Target, AlertTriangle,
  ChevronDown, ChevronUp, Phone, Mail, Calendar,
  ArrowRight, Grip
} from 'lucide-react';

/* ─── TYPES & DATA ────────────────────────────────────────────── */

interface KanbanDeal {
  id: string;
  client: string;
  amount: number;
  prob: number;
  days: number;
  nextStep: string;
  owner: string;
  signal: string;
}

interface KanbanStage {
  id: string;
  label: string;
  color: string;
  borderColor: string;
  headerBg: string;
  deals: KanbanDeal[];
}

const STAGES: KanbanStage[] = [
  {
    id: 'prospecting',
    label: 'Prospección',
    color: 'text-slate-600',
    borderColor: 'border-slate-300',
    headerBg: 'bg-slate-100',
    deals: [
      { id: 'k-1', client: 'FinanzasPlus', amount: 80000, prob: 20, days: 1, nextStep: 'Investigar en LinkedIn', owner: 'Ana García', signal: '🆕' },
      { id: 'k-2', client: 'LogiTech Pro', amount: 45000, prob: 15, days: 3, nextStep: 'Cold email', owner: 'Ana García', signal: '🆕' },
    ],
  },
  {
    id: 'discovery',
    label: 'Discovery',
    color: 'text-blue-600',
    borderColor: 'border-blue-300',
    headerBg: 'bg-blue-50',
    deals: [
      { id: 'k-3', client: 'HealthTech Labs', amount: 35000, prob: 40, days: 5, nextStep: 'Reunión de descubrimiento', owner: 'Carlos Ruiz', signal: '🔵' },
    ],
  },
  {
    id: 'proposal',
    label: 'Propuesta',
    color: 'text-purple-600',
    borderColor: 'border-purple-300',
    headerBg: 'bg-purple-50',
    deals: [
      { id: 'k-4', client: 'TechCorp SA', amount: 50000, prob: 60, days: 2, nextStep: 'Enviar propuesta revisada', owner: 'Ana García', signal: '🟢' },
      { id: 'k-5', client: 'MediaGroup', amount: 28000, prob: 55, days: 8, nextStep: 'Follow-up propuesta', owner: 'Roberto Silva', signal: '🟡' },
    ],
  },
  {
    id: 'negotiation',
    label: 'Negociación',
    color: 'text-amber-600',
    borderColor: 'border-amber-300',
    headerBg: 'bg-amber-50',
    deals: [
      { id: 'k-6', client: 'Retail Giant', amount: 120000, prob: 80, days: 7, nextStep: 'Confirmar pricing final', owner: 'Ana García', signal: '🟡' },
    ],
  },
  {
    id: 'closed_won',
    label: 'Cerrado ✅',
    color: 'text-emerald-600',
    borderColor: 'border-emerald-300',
    headerBg: 'bg-emerald-50',
    deals: [
      { id: 'k-7', client: 'Startup Inc', amount: 15000, prob: 100, days: 0, nextStep: 'Facturar', owner: 'Carlos Ruiz', signal: '✅' },
    ],
  },
];

/* ─── DEAL CARD ───────────────────────────────────────────── */

const DealCard = ({ deal, onMove }: { deal: KanbanDeal; onMove: (dir: 'left' | 'right') => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all ${deal.days >= 7 ? 'ring-1 ring-amber-200' : ''}`}>
      {/* Drag Handle + Header */}
      <div
        className="p-3 cursor-pointer active:bg-slate-50 dark:active:bg-slate-700 transition-colors rounded-t-xl"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Grip size={10} className="text-slate-300 cursor-grab" />
            <span className="text-xs">{deal.signal}</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{deal.client}</span>
          </div>
          {expanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">${(deal.amount / 1000).toFixed(0)}K</span>
          <div className="flex items-center gap-2">
            {deal.days > 0 && (
              <span className={`text-[10px] flex items-center gap-0.5 ${deal.days >= 5 ? 'text-red-500' : 'text-slate-400'}`}>
                {deal.days >= 5 && <AlertTriangle size={8} />}
                {deal.days}d
              </span>
            )}
            <span className="text-[10px] text-slate-400">{deal.prob}%</span>
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-700 pt-2 space-y-2 animate-in slide-in-from-top-1 duration-150">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2.5 py-1.5 flex items-center gap-1">
            <ArrowRight size={10} className="text-blue-500" />
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">{deal.nextStep}</span>
          </div>
          <p className="text-[10px] text-slate-400">Owner: {deal.owner}</p>
          {/* Quick Actions */}
          <div className="flex gap-1.5">
            <button className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors">
              <Phone size={10} /> Llamar
            </button>
            <button className="flex-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 text-[10px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-purple-100 transition-colors">
              <Mail size={10} /> Email
            </button>
            <button className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors">
              <Calendar size={10} /> Agendar
            </button>
          </div>
          {/* Move Stage Buttons */}
          <div className="flex gap-1.5 pt-1">
            <button onClick={() => onMove('left')} className="flex-1 text-[10px] text-slate-400 hover:text-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg py-1 font-medium transition-colors">← Stage anterior</button>
            <button onClick={() => onMove('right')} className="flex-1 text-[10px] text-orange-500 hover:text-orange-600 border border-orange-200 dark:border-orange-700 rounded-lg py-1 font-semibold transition-colors">Stage siguiente →</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── MAIN COMPONENT ──────────────────────────────────────────── */

export const PipelineKanban = () => {
  const [stages, setStages] = useState(STAGES);

  const moveDeal = (dealId: string, stageIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'right' ? stageIndex + 1 : stageIndex - 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    setStages(prev => {
      const updated = prev.map(s => ({ ...s, deals: [...s.deals] }));
      const deal = updated[stageIndex].deals.find(d => d.id === dealId);
      if (!deal) return prev;
      updated[stageIndex].deals = updated[stageIndex].deals.filter(d => d.id !== dealId);
      updated[targetIndex].deals.push(deal);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Target size={18} className="text-orange-500" /> Pipeline Kanban
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {stages.reduce((sum, s) => sum + s.deals.length, 0)} deals •{' '}
            ${(stages.reduce((sum, s) => sum + s.deals.reduce((ds, d) => ds + d.amount, 0), 0) / 1000000).toFixed(1)}M total
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {stages.map((stage, stageIdx) => {
          const stageTotal = stage.deals.reduce((sum, d) => sum + d.amount, 0);
          return (
            <div key={stage.id} className="flex-shrink-0 w-64">
              {/* Stage Header */}
              <div className={`${stage.headerBg} rounded-t-xl px-3 py-2.5 border ${stage.borderColor} border-b-0`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>{stage.label}</span>
                  <span className="text-[10px] bg-white/80 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-full text-slate-500 font-bold">
                    {stage.deals.length}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">${(stageTotal / 1000).toFixed(0)}K</p>
              </div>

              {/* Cards Column */}
              <div className={`bg-slate-50/50 dark:bg-slate-900/50 border ${stage.borderColor} border-t-0 rounded-b-xl p-2 space-y-2 min-h-[200px]`}>
                {stage.deals.length === 0 ? (
                  <div className="text-center py-8 text-slate-300">
                    <Target size={20} className="mx-auto mb-1" />
                    <p className="text-[10px]">Sin deals</p>
                  </div>
                ) : (
                  stage.deals.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onMove={(dir) => moveDeal(deal.id, stageIdx, dir)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
