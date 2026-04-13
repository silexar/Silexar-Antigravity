import type { LucideIcon } from 'lucide-react';
import { CheckCircle, XCircle, Settings, AlertTriangle, Clock } from 'lucide-react';

export const SYSTEM_TYPES = [
  { id: 'dalet', name: 'Dalet Galaxy', icon: '🎵', color: 'blue' },
  { id: 'wideorbit', name: 'WideOrbit', icon: '📡', color: 'green' },
  { id: 'sara', name: 'Sara Automation', icon: '🤖', color: 'purple' },
  { id: 'rcs', name: 'RCS Zetta', icon: '⚡', color: 'yellow' },
  { id: 'marketron', name: 'Marketron Traffic', icon: '📊', color: 'orange' },
  { id: 'nexgen', name: 'NexGen Digital', icon: '🚀', color: 'red' },
  { id: 'radiotraffic', name: 'RadioTraffic', icon: '📻', color: 'indigo' },
];

export const STATIONS = [
  { id: 'radio_1', name: 'Radio Uno 97.1 FM', type: 'FM' },
  { id: 'radio_2', name: 'Radio Dos 101.3 FM', type: 'FM' },
  { id: 'radio_3', name: 'Radio Tres 1180 AM', type: 'AM' },
  { id: 'tv_1', name: 'Canal TV Uno', type: 'TV' },
];

export function getSystemIcon(type: string): string {
  return SYSTEM_TYPES.find(st => st.id === type)?.icon ?? '📡';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online': return 'text-green-400';
    case 'offline': return 'text-red-400';
    case 'maintenance': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export function getStatusIcon(status: string): LucideIcon {
  switch (status) {
    case 'online': return CheckCircle;
    case 'offline': return XCircle;
    case 'maintenance': return Settings;
    case 'error': return AlertTriangle;
    default: return Clock;
  }
}
