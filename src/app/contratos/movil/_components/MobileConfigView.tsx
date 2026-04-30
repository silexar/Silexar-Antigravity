/**
 * ?? MOBILE: Configuraci�n View
 * 
 * Configuraci�n del m�dulo contratos.
 * Paridad con desktop: contratos/configuracion/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Settings, Bell, Shield, Users, Mail, Webhook,
  Clock, Eye, ChevronRight, CheckCircle2, ToggleLeft, ToggleRight
} from 'lucide-react';

interface ConfigOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  tipo: 'toggle' | 'link';
  valor?: boolean;
}

export function MobileConfigView() {
  const [configs, setConfigs] = useState<ConfigOption[]>([
    { id: 'notif-vencimientos', label: 'Alertas de vencimientos', desc: 'Notificar 7 d�as antes del vencimientos', icon: <Bell className="w-5 h-5" />, color: 'bg-[#dfeaff] text-[#9aa3b8]', tipo: 'toggle', valor: true },
    { id: 'notif-aprobacion', label: 'Alertas de aprobaci�n', desc: 'Notificar cuando un contrato sea aprobado', icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-[#6888ff]/10 text-[#6888ff]', tipo: 'toggle', valor: true },
    { id: 'notif-firma', label: 'Alertas de firma digital', desc: 'Notificar cuando se firme un contrato', icon: <Shield className="w-5 h-5" />, color: 'bg-[#6888ff]/10 text-[#6888ff]', tipo: 'toggle', valor: false },
    { id: 'auto-renovacion', label: 'Auto-renovaci�n', desc: 'Generar borrador de renovaci�n autom�tico', icon: <Clock className="w-5 h-5" />, color: 'bg-[#6888ff]/10 text-[#6888ff]', tipo: 'toggle', valor: true },
    { id: 'visibilidad', label: 'Visibilidad contratos', desc: 'Solo mis contratos vs todos del equipo', icon: <Eye className="w-5 h-5" />, color: 'bg-[#6888ff]/10 text-[#6888ff]', tipo: 'toggle', valor: false },
  ]);

  const links: { label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { label: 'Permisos y roles', desc: 'Administrar acceso del equipo', icon: <Users className="w-5 h-5" />, color: 'bg-[#dfeaff] text-[#6888ff]' },
    { label: 'Plantillas de email', desc: 'Configurar emails autom�ticos', icon: <Mail className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600' },
    { label: 'Webhooks', desc: 'Integraciones externas', icon: <Webhook className="w-5 h-5" />, color: 'bg-[#dfeaff] text-[#69738c]' },
  ];

  const toggleConfig = (id: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, valor: !c.valor } : c));
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-[#6888ff] rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#9aa3b8]" />
          <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest">Configuraci�n</p>
        </div>
        <p className="text-sm text-[#9aa3b8] mt-2">Personaliza el comportamiento del m�dulo de contratos.</p>
      </div>

      {/* TOGGLES */}
      <div>
        <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest mb-3 px-1">Notificaciones y Automatraci�n</p>
        <div className="space-y-2">
          {configs.map(config => (
            <div key={config.id} className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#69738c] text-sm">{config.label}</p>
                <p className="text-[10px] text-[#9aa3b8]">{config.desc}</p>
              </div>
              <button onClick={() => toggleConfig(config.id)} className="shrink-0">
                {config.valor ? (
                  <ToggleRight className="w-8 h-8 text-[#6888ff]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[#9aa3b8]" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LINKS */}
      <div>
        <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest mb-3 px-1">Administraci�n</p>
        <div className="space-y-2">
          {links.map(link => (
            <button key={link.label} className="w-full bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-4 flex items-center gap-3 active:scale-[0.98]">
              <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center`}>{link.icon}</div>
              <div className="flex-1 text-left">
                <p className="font-bold text-[#69738c] text-sm">{link.label}</p>
                <p className="text-[10px] text-[#9aa3b8]">{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9aa3b8]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
