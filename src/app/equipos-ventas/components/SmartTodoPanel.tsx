/**
 * COMPONENT: SMART TODO PANEL — AI-Prioritized Daily Tasks
 * 
 * @description Panel de tareas inteligente que prioriza acciones del vendedor
 * por urgencia, impacto en revenue, y deadlines. Incluye quick-actions
 * para marcar completado, postponer, o navegar al contexto.
 */

'use client';

import React, { useState } from 'react';
import {
  CheckCircle, Circle, Phone, Mail, Calendar, Clock,
  AlertTriangle, ArrowRight, Sparkles,
  ChevronDown, ChevronUp, Target
} from 'lucide-react';

/* ─── MOCK TASKS ──────────────────────────────────────────────── */

interface SmartTask {
  id: string;
  title: string;
  subtitle: string;
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'deadline';
  priority: 'critical' | 'high' | 'medium' | 'low';
  aiReason: string;
  dealValue?: number;
  dueTime?: string;
  daysSinceActivity?: number;
  done: boolean;
}

const INITIAL_TASKS: SmartTask[] = [
  {
    id: 't1', title: 'Call Retail Giant — Negotiation closing', subtitle: 'Deal: $120K • Closes in 3 days',
    type: 'call', priority: 'critical', aiReason: 'High-value deal closing soon. 1 competitor active.',
    dealValue: 120000, dueTime: '10:00 AM', daysSinceActivity: 2, done: false,
  },
  {
    id: 't2', title: 'Send proposal to TechCorp SA', subtitle: 'Deal: $50K • Probability 60%',
    type: 'email', priority: 'high', aiReason: '7 days without activity. Risk of going cold.',
    dealValue: 50000, dueTime: '11:30 AM', daysSinceActivity: 7, done: false,
  },
  {
    id: 't3', title: 'Prep demo deck for FinServ Solutions', subtitle: 'Meeting tomorrow at 9:00 AM',
    type: 'meeting', priority: 'high', aiReason: 'New qualified opportunity. First demo = impression critical.',
    dealValue: 85000, dueTime: 'Before EOD', done: false,
  },
  {
    id: 't4', title: 'Follow up HealthTech Labs — no response', subtitle: 'Sent proposal 5 days ago',
    type: 'follow-up', priority: 'medium', aiReason: 'Proposal viewed but no reply. 2nd follow-up recommended.',
    dealValue: 40000, daysSinceActivity: 5, done: false,
  },
  {
    id: 't5', title: 'Submit forecast update for Q1', subtitle: 'Due today by 5:00 PM',
    type: 'deadline', priority: 'critical', aiReason: 'Manager requested before weekly pipeline review.',
    dueTime: '5:00 PM', done: false,
  },
  {
    id: 't6', title: 'Log activity from yesterday\'s calls', subtitle: '3 unlogged calls detected',
    type: 'call', priority: 'low', aiReason: 'Activity logging keeps your metrics accurate.',
    done: false,
  },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const typeIcons = { call: Phone, email: Mail, meeting: Calendar, 'follow-up': ArrowRight, deadline: Clock };
const priorityDots = {
  critical: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-blue-400', low: 'bg-slate-300',
};

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}K`;

/* ─── COMPONENT ───────────────────────────────────────────── */

export const SmartTodoPanel = () => {
  const [tasks, setTasks] = useState<SmartTask[]>(INITIAL_TASKS);
  const [showAll, setShowAll] = useState(false);

  const toggleDone = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const displayTasks = showAll ? tasks : tasks.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* ──── HEADER ──── */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-orange-500" />
          <h3 className="font-bold text-slate-800">Tareas del Día</h3>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
            <Sparkles size={10} /> AI Prioritized
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">{completedCount}/{tasks.length}</span>
          <div className="w-16 bg-slate-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${(completedCount / tasks.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* ──── TASKS ──── */}
      <div className="divide-y divide-slate-50">
        {displayTasks.map((task) => {
          const Icon = typeIcons[task.type];
          return (
            <div key={task.id} className={`p-4 flex items-start gap-3 transition-all hover:bg-slate-50/50 ${task.done ? 'opacity-40' : ''}`}>
              {/* Checkbox */}
              <button onClick={() => toggleDone(task.id)} className="mt-0.5 flex-shrink-0">
                {task.done
                  ? <CheckCircle size={20} className="text-emerald-500" />
                  : <Circle size={20} className="text-slate-300 hover:text-orange-500 transition-colors" />
                }
              </button>

              {/* Priority dot */}
              <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${priorityDots[task.priority]}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{task.subtitle}</p>
                {/* AI Reason */}
                <div className="mt-1.5 flex items-start gap-1.5">
                  <Sparkles size={10} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-violet-500 italic">{task.aiReason}</p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-slate-400" />
                  {task.dueTime && <span className="text-[10px] font-semibold text-slate-500">{task.dueTime}</span>}
                </div>
                {task.dealValue && <span className="text-xs font-bold text-emerald-600">{fmt(task.dealValue)}</span>}
                {task.daysSinceActivity && task.daysSinceActivity >= 5 && (
                  <span className="text-[10px] text-red-500 flex items-center gap-0.5">
                    <AlertTriangle size={8} /> {task.daysSinceActivity}d idle
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ──── SHOW MORE ──── */}
      {tasks.length > 4 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 border-t border-slate-50">
          {showAll ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {tasks.length - 4} more tasks</>}
        </button>
      )}
    </div>
  );
};
