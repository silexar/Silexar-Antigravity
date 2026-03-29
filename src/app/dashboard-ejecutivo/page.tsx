/**
 * 📱 SILEXAR PULSE - Dashboard Ejecutivo Móvil
 * 
 * @description Dashboard móvil-first para ejecutivos de ventas en campo
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { 
  TrendingUp, Target, DollarSign, Users, Calendar, MessageCircle,
  Calculator, FileText, Bell, Sparkles, Award,
  Clock, Phone, Mail, ArrowUp, ArrowDown
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface MetricaVendedor {
  ventas: number;
  meta: number;
  cumplimiento: number;
  ranking: number;
  rankingCambio: number;
  comisiones: number;
}

interface Oportunidad {
  id: string;
  cliente: string;
  monto: number;
  probabilidad: number;
  proximaAccion: string;
  fechaAccion: string;
}

interface Actividad {
  id: string;
  tipo: 'llamada' | 'reunion' | 'email' | 'tarea';
  cliente: string;
  hora: string;
  descripcion: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const metricas: MetricaVendedor = {
  ventas: 72000000,
  meta: 85000000,
  cumplimiento: 85,
  ranking: 3,
  rankingCambio: 1,
  comisiones: 3600000
};

const oportunidades: Oportunidad[] = [
  { id: '1', cliente: 'Empresa ABC', monto: 15000000, probabilidad: 75, proximaAccion: 'Enviar cotización', fechaAccion: 'Hoy' },
  { id: '2', cliente: 'Comercial XYZ', monto: 8500000, probabilidad: 60, proximaAccion: 'Llamar para seguimiento', fechaAccion: 'Mañana' },
  { id: '3', cliente: 'Tech Solutions', monto: 22000000, probabilidad: 40, proximaAccion: 'Agendar reunión', fechaAccion: 'Esta semana' }
];

const actividades: Actividad[] = [
  { id: '1', tipo: 'llamada', cliente: 'Empresa ABC', hora: '09:00', descripcion: 'Confirmar envío cotización' },
  { id: '2', tipo: 'reunion', cliente: 'Servicios DEF', hora: '11:30', descripcion: 'Presentación Q1 2026' },
  { id: '3', tipo: 'email', cliente: 'Comercial XYZ', hora: '14:00', descripcion: 'Enviar propuesta ajustada' }
];

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════

export default function DashboardEjecutivoPage() {
  const [tabActiva, setTabActiva] = useState<'hoy' | 'pipeline' | 'metricas'>('hoy');
  
  const iconosTipo: Record<string, React.ReactNode> = {
    llamada: <Phone className="w-4 h-4" />,
    reunion: <Users className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    tarea: <FileText className="w-4 h-4" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      
      {/* Header Móvil */}
      <div className="bg-black/30 backdrop-blur-lg p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-sm">Buenos días,</p>
            <h1 className="text-xl font-bold text-white">Carlos Mendoza</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 bg-white/10 rounded-full">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              CM
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-6 h-6 opacity-80" />
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              <ArrowUp className="w-3 h-3" /> 12%
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">${(metricas.ventas / 1000000).toFixed(1)}M</p>
          <p className="text-emerald-100 text-xs">Ventas del mes</p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Target className="w-6 h-6 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{metricas.cumplimiento}%</span>
          </div>
          <p className="text-2xl font-bold mt-2">${(metricas.meta / 1000000).toFixed(1)}M</p>
          <p className="text-indigo-100 text-xs">Meta mensual</p>
          <div className="mt-2 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${metricas.cumplimiento}%` }} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <Award className="w-6 h-6 opacity-80" />
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {metricas.rankingCambio > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(metricas.rankingCambio)}
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">#{metricas.ranking}</p>
          <p className="text-amber-100 text-xs">Ranking equipo</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <DollarSign className="w-6 h-6 opacity-80" />
          <p className="text-2xl font-bold mt-2">${(metricas.comisiones / 1000000).toFixed(1)}M</p>
          <p className="text-purple-100 text-xs">Comisiones</p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="px-4 grid grid-cols-4 gap-2 mb-4">
        {[
          { icon: Calculator, label: 'Cotizar', color: 'from-cyan-400 to-cyan-500', href: '/cotizador' },
          { icon: MessageCircle, label: 'Asistente', color: 'from-violet-400 to-violet-500', href: '/asistente-comercial' },
          { icon: Users, label: 'Clientes', color: 'from-rose-400 to-rose-500', href: '/anunciantes' },
          { icon: Calendar, label: 'Agenda', color: 'from-emerald-400 to-emerald-500', href: '#' }
        ].map((acc, i) => (
          <a key={i} href={acc.href} className="flex flex-col items-center gap-1">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center`}>
              <acc.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-white/70">{acc.label}</span>
          </a>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2 mb-4">
        {(['hoy', 'pipeline', 'metricas'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tabActiva === tab 
                ? 'bg-white text-slate-900' 
                : 'bg-white/10 text-white/70'
            }`}
          >
            {tab === 'hoy' ? '📅 Hoy' : tab === 'pipeline' ? '🎯 Pipeline' : '📊 Métricas'}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <div className="px-4 pb-24 space-y-4">
        
        {tabActiva === 'hoy' && (
          <>
            <h2 className="text-white font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> Actividades de hoy
            </h2>
            {actividades.map((act) => (
              <div key={act.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    act.tipo === 'llamada' ? 'bg-emerald-500' :
                    act.tipo === 'reunion' ? 'bg-indigo-500' :
                    act.tipo === 'email' ? 'bg-amber-500' : 'bg-slate-500'
                  }`}>
                    {iconosTipo[act.tipo]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{act.cliente}</p>
                    <p className="text-white/60 text-sm">{act.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm">{act.hora}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tabActiva === 'pipeline' && (
          <>
            <h2 className="text-white font-medium flex items-center gap-2">
              <Target className="w-4 h-4" /> Oportunidades activas
            </h2>
            {oportunidades.map((op) => (
              <div key={op.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{op.cliente}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    op.probabilidad >= 70 ? 'bg-emerald-500/20 text-emerald-300' :
                    op.probabilidad >= 50 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {op.probabilidad}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">${(op.monto / 1000000).toFixed(1)}M</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">{op.proximaAccion}</span>
                  <span className="text-indigo-300">{op.fechaAccion}</span>
                </div>
              </div>
            ))}
            
            <div className="text-center">
              <p className="text-white/60 text-sm">Pipeline total:</p>
              <p className="text-2xl font-bold text-white">
                ${(oportunidades.reduce((sum, o) => sum + o.monto, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </>
        )}

        {tabActiva === 'metricas' && (
          <div className="space-y-4">
            <h2 className="text-white font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Tu rendimiento
            </h2>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span className="text-white font-medium">Recomendaciones IA</span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-300 text-sm">
                  ✅ Vas 85% a meta, estás en buen camino
                </div>
                <div className="p-3 bg-amber-500/20 rounded-lg text-amber-300 text-sm">
                  💡 Cierra "Empresa ABC" esta semana para subir a #2
                </div>
                <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-300 text-sm">
                  📅 Tu mejor día de cierre es miércoles
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="flex justify-around">
          {[
            { icon: TrendingUp, label: 'Dashboard', active: true },
            { icon: Users, label: 'Clientes' },
            { icon: MessageCircle, label: 'Asistente' },
            { icon: Calendar, label: 'Agenda' }
          ].map((item, i) => (
            <button key={i} className={`flex flex-col items-center gap-1 ${item.active ? 'text-indigo-400' : 'text-white/50'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
