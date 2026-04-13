/**
 * 🏠 SILEXAR PULSE - Dashboard Principal Contratos TIER 0
 * 
 * @description Vista principal del módulo de contratos con
 * métricas, accesos rápidos y navegación a sub-módulos.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Columns3,
  Radio,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Zap,
  Shield,
  BookOpen
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS Y DATOS
// ═══════════════════════════════════════════════════════════════

interface MetricaDashboard {
  titulo: string;
  valor: string | number;
  cambio: number;
  icono: React.ElementType;
  color: string;
}

interface AccesoRapido {
  titulo: string;
  descripcion: string;
  icono: React.ElementType;
  href: string;
  color: string;
  badge?: string;
}

const metricas: MetricaDashboard[] = [
  { titulo: 'Contratos Activos', valor: 83, cambio: 12, icono: FileText, color: 'from-indigo-500 to-purple-600' },
  { titulo: 'Valor Cartera', valor: '$2.85B', cambio: 8, icono: DollarSign, color: 'from-emerald-500 to-teal-600' },
  { titulo: 'Pendientes Aprobación', valor: 7, cambio: -3, icono: Clock, color: 'from-amber-500 to-orange-600' },
  { titulo: 'Tasa Conversión', valor: '78%', cambio: 5, icono: TrendingUp, color: 'from-blue-500 to-cyan-600' }
];

const accesosRapidos: AccesoRapido[] = [
  { 
    titulo: 'Nuevo Contrato', 
    descripcion: 'Crear contrato con wizard IA', 
    icono: Plus, 
    href: '/contratos/nuevo', 
    color: 'from-indigo-500 to-purple-600',
    badge: 'Recomendado'
  },
  { 
    titulo: 'Pipeline', 
    descripcion: 'Vista Kanban de contratos', 
    icono: Columns3, 
    href: '/contratos/pipeline', 
    color: 'from-blue-500 to-cyan-600'
  },
  { 
    titulo: 'Traffic', 
    descripcion: 'Tracking de ejecución', 
    icono: Radio, 
    href: '/contratos/traffic', 
    color: 'from-emerald-500 to-teal-600'
  },
  { 
    titulo: 'Analytics', 
    descripcion: 'Métricas y predicciones', 
    icono: BarChart3, 
    href: '/contratos/analytics', 
    color: 'from-amber-500 to-orange-600'
  },
  { 
    titulo: 'Biblioteca Cláusulas', 
    descripcion: 'Gestionar cláusulas legales', 
    icono: BookOpen, 
    href: '/contratos/clausulas', 
    color: 'from-purple-500 to-pink-600'
  },
  { 
    titulo: 'Auditoría', 
    descripcion: 'Trail de seguridad', 
    icono: Shield, 
    href: '/contratos/auditoria', 
    color: 'from-slate-600 to-slate-800'
  }
];

const alertasRecientes = [
  { id: '1', tipo: 'renovacion', mensaje: 'Contrato Banco Nacional vence en 45 días', prioridad: 'alta' },
  { id: '2', tipo: 'aprobacion', mensaje: '3 contratos esperando tu aprobación', prioridad: 'media' },
  { id: '3', tipo: 'material', mensaje: 'Material pendiente para SuperMax', prioridad: 'normal' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const MetricaCard: React.FC<MetricaDashboard> = ({ titulo, valor, cambio, icono: Icon, color }) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color} text-white shadow-xl`}
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{titulo}</p>
        <h3 className="text-3xl font-bold mt-1">{valor}</h3>
        <div className={`flex items-center gap-1 mt-2 text-sm ${cambio >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
          <TrendingUp className={`w-4 h-4 ${cambio < 0 ? 'rotate-180' : ''}`} />
          <span>{cambio >= 0 ? '+' : ''}{cambio}%</span>
          <span className="text-white/50 ml-1">vs mes anterior</span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
  </motion.div>
);

const AccesoRapidoCard: React.FC<AccesoRapido & { onClick: () => void }> = ({
  titulo, descripcion, icono: Icon, color, badge, onClick
}) => (
  <motion.button
    onClick={onClick}
    className="relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all text-left w-full group"
    whileHover={{ y: -2 }}
  >
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800">{titulo}</h3>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{descripcion}</p>
      </div>
      <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
    </div>
  </motion.button>
);

const AlertaItem: React.FC<{
  alerta: typeof alertasRecientes[0];
}> = ({ alerta }) => {
  const prioridadConfig = {
    alta: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, color: 'text-red-500' },
    media: { bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, color: 'text-amber-500' },
    normal: { bg: 'bg-blue-50', border: 'border-blue-200', icon: FileText, color: 'text-blue-500' }
  }[alerta.prioridad];

  if (!prioridadConfig) return null;
  const Icon = prioridadConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl ${prioridadConfig.bg} border ${prioridadConfig.border}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${prioridadConfig.color}`} />
        <p className="text-sm text-slate-700 flex-1">{alerta.mensaje}</p>
        <button className="text-sm text-indigo-600 font-medium hover:underline">
          Ver
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ContratosDashboard() {
  const router = useRouter();
  const [alertas] = useState(alertasRecientes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Contratos</h1>
                <p className="text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Módulo Enterprise con IA integrada
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/contratos/nuevo')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Contrato
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricas.map((metrica) => (
            <MetricaCard key={metrica.titulo} {...metrica} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Accesos rápidos */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-800">Accesos Rápidos</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {accesosRapidos.map((acceso) => (
                <AccesoRapidoCard
                  key={acceso.titulo}
                  {...acceso}
                  onClick={() => router.push(acceso.href)}
                />
              ))}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Alertas */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Alertas Recientes
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                  {alertas.length}
                </span>
              </div>
              <div className="space-y-3">
                {alertas.map(alerta => (
                  <AlertaItem key={alerta.id} alerta={alerta} />
                ))}
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-500" />
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                {[
                  { accion: 'Contrato creado', detalle: 'CON-2024-00152', tiempo: 'Hace 5 min', icono: Plus },
                  { accion: 'Aprobación recibida', detalle: 'CON-2024-00145', tiempo: 'Hace 15 min', icono: CheckCircle2 },
                  { accion: 'Firma completada', detalle: 'CON-2024-00138', tiempo: 'Hace 1 hora', icono: FileText }
                ].map((item) => (
                  <div key={item.detalle} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <item.icono className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{item.accion}</p>
                      <p className="text-xs text-slate-500">{item.detalle}</p>
                    </div>
                    <span className="text-xs text-slate-400">{item.tiempo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos vencimientos */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                Próximos Vencimientos
              </h3>
              <div className="space-y-3">
                {[
                  { cliente: 'Banco Nacional', dias: 45, valor: '$180M' },
                  { cliente: 'SuperMax', dias: 60, valor: '$65M' },
                  { cliente: 'TechCorp', dias: 90, valor: '$25M' }
                ].map((item) => (
                  <div key={item.cliente} className="flex items-center justify-between p-3 rounded-lg bg-white/70">
                    <div>
                      <p className="font-medium text-slate-700">{item.cliente}</p>
                      <p className="text-xs text-amber-600">{item.dias} días</p>
                    </div>
                    <span className="font-semibold text-slate-700">{item.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
