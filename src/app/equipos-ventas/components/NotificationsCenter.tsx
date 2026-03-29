/**
 * COMPONENT: NOTIFICATIONS CENTER — Enterprise Real-Time Alerts
 * 
 * @description Centro de notificaciones inteligente con alertas priorizadas,
 * badge counter, categorías filtradas, y mark-as-read functionality.
 */

'use client';

import React, { useState } from 'react';
import {
  Bell, X, TrendingDown, Calendar,
  DollarSign, Users, Clock,
  Sparkles
} from 'lucide-react';

/* ─── MOCK NOTIFICATIONS ──────────────────────────────────────── */

interface Notification {
  id: string;
  type: 'deal-risk' | 'meeting' | 'commission' | 'coaching' | 'team' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'urgent' | 'high' | 'normal';
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'deal-risk', title: 'Deal At Risk', message: 'Retail Giant — probability dropped from 80% to 55%. No contact in 7 days.', time: '5 min ago', read: false, priority: 'urgent' },
  { id: 'n2', type: 'meeting', title: 'Meeting in 30 min', message: 'Demo with TechCorp SA at 10:00 AM. Deck not yet reviewed.', time: '30 min ago', read: false, priority: 'urgent' },
  { id: 'n3', type: 'commission', title: 'Commission Update', message: 'Your Q4 commission statement is ready: $97,050 earned.', time: '1h ago', read: false, priority: 'normal' },
  { id: 'n4', type: 'coaching', title: 'New Training Available', message: 'Enterprise Negotiation course unlocked. 89% of top performers completed it.', time: '2h ago', read: false, priority: 'normal' },
  { id: 'n5', type: 'team', title: 'Manager Feedback', message: 'Carlos López left feedback on your last 1:1. View now.', time: '3h ago', read: true, priority: 'normal' },
  { id: 'n6', type: 'deal-risk', title: 'Stale Pipeline', message: '3 deals have had no activity in 10+ days. Review recommended.', time: '5h ago', read: true, priority: 'high' },
  { id: 'n7', type: 'system', title: 'Forecast Due', message: 'Q1 forecast submission deadline is tomorrow at 5:00 PM.', time: '1d ago', read: true, priority: 'high' },
];

const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'deal-risk': { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
  'meeting': { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
  'commission': { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'coaching': { icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50' },
  'team': { icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
  'system': { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50' },
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = filter
    ? notifications.filter(n => n.type === filter)
    : notifications;

  return (
    <div className="relative">
      {/* ──── BELL BUTTON ──── */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ──── DROPDOWN PANEL ──── */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{unreadCount} new</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-700 font-semibold">
                  Mark all read
                </button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-2 border-b border-slate-50 flex gap-1 overflow-x-auto">
              <button onClick={() => setFilter(null)} className={`text-[10px] px-2 py-1 rounded-full font-semibold transition-colors ${!filter ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>All</button>
              {Object.entries(TYPE_ICONS).map(([key]) => (
                <button key={key} onClick={() => setFilter(key)} className={`text-[10px] px-2 py-1 rounded-full font-semibold capitalize transition-colors ${filter === key ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                  {key.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {filteredNotifications.map((notif) => {
                const typeInfo = TYPE_ICONS[notif.type];
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                      <Icon size={14} className={typeInfo.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold ${!notif.read ? 'text-slate-800' : 'text-slate-500'}`}>{notif.title}</p>
                        {notif.priority === 'urgent' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-slate-300 mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
