/**
 * COMPONENT: SLACK INTEGRATION — Notificaciones y Alertas
 * 
 * @description Panel de integración con Slack para notificaciones de equipo,
 * alertas de deals, logros y comunicación en tiempo real.
 * 
 * DESIGN: Neumorphic con base #EAF0F6, sombras #bec8de y #ffffff
 */

'use client';

import React, { useState } from 'react';
import {
    Hash, Bell, MessageSquare, UserPlus, Trophy, TrendingUp,
    AlertTriangle, CheckCircle2, Settings, Send, Zap,
    Star, Target, Users, Clock
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const SLACK_WORKSPACE = {
    name: 'Silexar Sales',
    connected: true,
    channel: '#sales-team',
    members: 24,
};

const ALERT_TYPES = [
    { id: 'deal_won', label: 'Deal Closed', icon: Trophy, enabled: true, color: 'text-amber-500' },
    { id: 'deal_lost', label: 'Deal Lost', icon: AlertTriangle, enabled: true, color: 'text-red-500' },
    { id: 'quota_attain', label: 'Quota Attainment', icon: Target, enabled: true, color: 'text-emerald-500' },
    { id: 'pipeline_alert', label: 'Pipeline Alert', icon: TrendingUp, enabled: false, color: 'text-blue-500' },
    { id: 'new_lead', label: 'New Lead', icon: UserPlus, enabled: true, color: 'text-violet-500' },
    { id: 'meeting_reminder', label: 'Meeting Reminder', icon: Clock, enabled: true, color: 'text-slate-500' },
];

const RECENT_NOTIFICATIONS = [
    { type: 'deal_won', message: 'Ana García closed $50K Enterprise deal', time: '5 min ago', channel: '#sales-team' },
    { type: 'quota_attain', message: 'Roberto Silva reached 100% quota!', time: '12 min ago', channel: '#sales-team' },
    { type: 'new_lead', message: 'New lead assigned: TechCorp Inc.', time: '25 min ago', channel: '#leads' },
    { type: 'pipeline_alert', message: 'Pipeline below target by 15%', time: '1 hour ago', channel: '#alerts' },
];

const QUICK_POSTS = [
    { message: 'Q1 Forecast meeting in 30 minutes', scheduled: true },
    { message: 'Weekly pipeline review - submit by Friday', scheduled: false },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const SlackIntegration = () => {
    const [alerts, setAlerts] = useState(ALERT_TYPES);
    const [message, setMessage] = useState('');

    const toggleAlert = (id: string) => {
        setAlerts(alerts.map(alert =>
            alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
        ));
    };

    const getIcon = (type: string) => {
        const alert = ALERT_TYPES.find(a => a.id === type);
        if (!alert) return Bell;
        return alert.icon;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-200" fill="currentColor">
                                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.122a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.521zm0-1.271a2.527 2.527 0 0 1-2.521-2.521 2.526 2.526 0 0 1 2.521-2.521h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-widest text-purple-200">Slack Integration</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Connected
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1">{SLACK_WORKSPACE.name}</h2>
                        <p className="text-purple-200 text-sm">{SLACK_WORKSPACE.channel} • {SLACK_WORKSPACE.members} members</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── STATS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-violet-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Messages</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">1,247</p>
                    <p className="text-xs text-slate-400 mt-1">This month</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell size={16} className="text-amber-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Alerts</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">89</p>
                    <p className="text-xs text-slate-400 mt-1">Sent</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy size={16} className="text-emerald-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Achievements</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">34</p>
                    <p className="text-xs text-slate-400 mt-1">Posted</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-blue-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Mentions</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">156</p>
                    <p className="text-xs text-slate-400 mt-1">Received</p>
                </div>
            </div>

            {/* ──── ALERT CONFIGURATION ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" /> Alert Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-[#EAF0F6] rounded-xl p-4 shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/50 ${alert.color}`}>
                                        <alert.icon size={18} />
                                    </div>
                                    <span className="font-semibold text-slate-700">{alert.label}</span>
                                </div>
                                <button
                                    onClick={() => toggleAlert(alert.id)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${alert.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${alert.enabled ? 'left-5' : 'left-0.5'
                                        }`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── RECENT NOTIFICATIONS ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Bell size={18} className="text-violet-500" /> Recent Notifications
                </h3>
                <div className="space-y-2">
                    {RECENT_NOTIFICATIONS.map((notification, idx) => {
                        const IconComponent = getIcon(notification.type);
                        return (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-[#EAF0F6] rounded-xl shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]">
                                <div className="p-2 rounded-lg bg-white/50">
                                    <IconComponent size={16} className="text-slate-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">{notification.message}</p>
                                    <p className="text-xs text-slate-400">{notification.time} • {notification.channel}</p>
                                </div>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ──── QUICK POST ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Send size={18} className="text-blue-500" /> Quick Post to Slack
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message to post to Slack..."
                        className="flex-1 px-4 py-3 bg-[#EAF0F6] rounded-xl shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
                    />
                    <button className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all flex items-center gap-2">
                        <Send size={16} /> Send
                    </button>
                </div>
                {QUICK_POSTS.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {QUICK_POSTS.map((post, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMessage(post.message)}
                                className="text-xs px-3 py-1.5 bg-white/50 text-slate-600 rounded-full hover:bg-white/70 transition-colors flex items-center gap-1"
                            >
                                {post.scheduled && <Clock size={10} />}
                                {post.message.substring(0, 30)}...
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ──── CHANNEL SELECTOR ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Hash size={18} className="text-slate-500" /> Connected Channels
                </h3>
                <div className="space-y-2">
                    {[
                        { name: '#sales-team', purpose: 'Main sales channel', active: true },
                        { name: '#leads', purpose: 'New lead notifications', active: true },
                        { name: '#alerts', purpose: 'Pipeline and quota alerts', active: true },
                        { name: '#achievements', purpose: 'Team wins and celebrations', active: false },
                    ].map((channel) => (
                        <div key={channel.name} className="flex items-center justify-between p-3 bg-[#EAF0F6] rounded-xl shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]">
                            <div className="flex items-center gap-3">
                                <Hash size={16} className="text-slate-400" />
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm">{channel.name}</p>
                                    <p className="text-xs text-slate-400">{channel.purpose}</p>
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${channel.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {channel.active ? 'Active' : 'Paused'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── ACTION BUTTONS ──── */}
            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-violet-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Settings size={16} /> Configure
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Star size={16} /> Manage Templates
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Bell size={16} /> View History
                </button>
            </div>
        </div>
    );
};
