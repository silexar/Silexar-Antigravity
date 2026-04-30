/**
 * 🏠 SILEXAR PULSE - Dashboard Principal Contratos TIER 0
 * 
 * @description Vista principal del módulo de contratos con
 * métricas, accesos rápidos y navegación a sub-módulos.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
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
// TOKENS OFICIALES NEUMORPHISM
// ═══════════════════════════════════════════════════════════════

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const neuXs = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;
const insetSm = `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`;

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
  { titulo: 'Contratos Activos', valor: 83, cambio: 12, icono: FileText, color: '#6888ff' },
  { titulo: 'Valor Cartera', valor: '$2.85B', cambio: 8, icono: DollarSign, color: '#6888ff' },
  { titulo: 'Pendientes Aprobación', valor: 7, cambio: -3, icono: Clock, color: '#6888ff' },
  { titulo: 'Tasa Conversión', valor: '78%', cambio: 5, icono: TrendingUp, color: '#6888ff' }
];

const accesosRapidos: AccesoRapido[] = [
  {
    titulo: 'Nuevo Contrato',
    descripcion: 'Crear contrato con wizard IA',
    icono: Plus,
    href: '/contratos/nuevo',
    color: '#6888ff',
    badge: 'Recomendado'
  },
  {
    titulo: 'Pipeline',
    descripcion: 'Vista Kanban de contratos',
    icono: Columns3,
    href: '/contratos/pipeline',
    color: '#3b82f6'
  },
  {
    titulo: 'Traffic',
    descripcion: 'Tracking de ejecución',
    icono: Radio,
    href: '/contratos/traffic',
    color: '#6888ff'
  },
  {
    titulo: 'Analytics',
    descripcion: 'Métricas y predicciones',
    icono: BarChart3,
    href: '/contratos/analytics',
    color: '#6888ff'
  },
  {
    titulo: 'Biblioteca Cláusulas',
    descripcion: 'Gestionar cláusulas legales',
    icono: BookOpen,
    href: '/contratos/clausulas',
    color: '#a855f7'
  },
  {
    titulo: 'Auditoría',
    descripcion: 'Trail de seguridad',
    icono: Shield,
    href: '/contratos/auditoria',
    color: '#69738c'
  }
];

const alertasRecientes = [
  { id: '1', tipo: 'renovacion', mensaje: 'Contrato Banco Nacional vence en 45 días', prioridad: 'alta' },
  { id: '2', tipo: 'aprobacion', mensaje: '3 contratos esperando tu aprobación', prioridad: 'media' },
  { id: '3', tipo: 'material', mensaje: 'Material pendiente para SuperMax', prioridad: 'normal' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUMORPHIC
// ═══════════════════════════════════════════════════════════════

function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: neu, ...style }}>
      {children}
    </div>
  );
}

function NeuButton({ children, onClick, variant = 'secondary', className = '', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string; disabled?: boolean;
}) {
  const s = variant === 'primary'
    ? { background: N.accent, color: '#fff', boxShadow: neuSm }
    : { background: N.base, color: N.text, boxShadow: neu };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`} style={s}>
      {children}
    </button>
  );
}

function MetricaCard({ metrica }: { metrica: MetricaDashboard }) {
  const { titulo, valor, cambio, icono: Icon, color } = metrica;
  return (
    <NeuCard className="p-6 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>{titulo}</p>
          <h3 className="text-3xl font-black mt-1" style={{ color: N.text }}>{valor}</h3>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className={`w-4 h-4 ${cambio < 0 ? 'rotate-180' : ''}`} style={{ color: cambio >= 0 ? '#6888ff' : '#9aa3b8' }} />
            <span style={{ color: cambio >= 0 ? '#6888ff' : '#9aa3b8' }}>{cambio >= 0 ? '+' : ''}{cambio}%</span>
            <span style={{ color: N.textSub }}>vs mes anterior</span>
          </div>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </NeuCard>
  );
}

function AccesoRapidoCard({ acceso }: { acceso: AccesoRapido }) {
  const router = useRouter();
  const { titulo, descripcion, icono: Icon, color, badge } = acceso;
  return (
    <motion.button
      onClick={() => router.push(acceso.href)}
      className="group p-5 rounded-2xl text-left w-full transition-all duration-300"
      style={{ background: N.base, boxShadow: neu }}
      whileHover={{ scale: 1.01 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = neu }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl flex-shrink-0" style={{ background: N.base, boxShadow: neuSm }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm truncate" style={{ color: N.text }}>{titulo}</h3>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${N.accent}18`, color: N.accent }}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm truncate mt-0.5" style={{ color: N.textSub }}>{descripcion}</p>
        </div>
        <ArrowUpRight className="w-5 h-5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: N.accent }} />
      </div>
    </motion.button>
  );
}

function AlertaItem({ alerta }: { alerta: typeof alertasRecientes[0] }) {
  const prioridadConfig = {
    alta: { color: '#9aa3b8', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
    media: { color: '#6888ff', bg: 'rgba(245,158,11,0.08)', icon: Clock },
    normal: { color: '#6888ff', bg: 'rgba(104,136,255,0.08)', icon: FileText }
  }[alerta.prioridad];

  if (!prioridadConfig) return null;
  const Icon = prioridadConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-2xl"
      style={{ background: prioridadConfig.bg }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
          <Icon className="w-4 h-4" style={{ color: prioridadConfig.color }} />
        </div>
        <p className="text-sm flex-1" style={{ color: N.text }}>{alerta.mensaje}</p>
        <button className="text-xs font-bold hover:underline" style={{ color: N.accent }}>Ver</button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ContratosDashboard() {
  const router = useRouter();
  const [alertas] = useState(alertasRecientes);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
              <FileText className="w-8 h-8" style={{ color: N.accent }} />
            </div>
            <div>
              <h1 className="text-3xl font-black" style={{ color: N.text }}>Gestión de Contratos</h1>
              <p className="text-sm mt-1 flex items-center gap-2" style={{ color: N.textSub }}>
                <Sparkles className="w-4 h-4" style={{ color: N.accent }} />
                Módulo Enterprise con IA integrada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeuButton variant="primary" onClick={() => router.push('/contratos/nuevo')}>
              <Plus className="w-5 h-5" /> Nuevo Contrato
            </NeuButton>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {metricas.map((metrica) => (
            <MetricaCard key={metrica.titulo} metrica={metrica} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Accesos rápidos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                <Zap className="w-5 h-5" style={{ color: N.accent }} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: N.textSub }}>Accesos Rápidos</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {accesosRapidos.map((acceso) => (
                <AccesoRapidoCard key={acceso.titulo} acceso={acceso} />
              ))}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Alertas */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.textSub }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#6888ff' }} /> Alertas Recientes
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#9aa3b8' }}>
                  {alertas.length}
                </span>
              </div>
              <div className="space-y-3">
                {alertas.map(alerta => (
                  <AlertaItem key={alerta.id} alerta={alerta} />
                ))}
              </div>
            </NeuCard>

            {/* Actividad reciente */}
            <NeuCard className="p-6">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4" style={{ color: N.textSub }}>
                <Clock className="w-4 h-4" style={{ color: N.accent }} /> Actividad Reciente
              </h3>
              <div className="space-y-4">
                {[
                  { accion: 'Contrato creado', detalle: 'CON-2024-00152', tiempo: 'Hace 5 min', icono: Plus },
                  { accion: 'Aprobación recibida', detalle: 'CON-2024-00145', tiempo: 'Hace 15 min', icono: CheckCircle2 },
                  { accion: 'Firma completada', detalle: 'CON-2024-00138', tiempo: 'Hace 1 hora', icono: FileText }
                ].map((item) => (
                  <div key={item.detalle} className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                      <item.icono className="w-4 h-4" style={{ color: N.textSub }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: N.text }}>{item.accion}</p>
                      <p className="text-xs" style={{ color: N.textSub }}>{item.detalle}</p>
                    </div>
                    <span className="text-xs" style={{ color: N.textSub }}>{item.tiempo}</span>
                  </div>
                ))}
              </div>
            </NeuCard>

            {/* Próximos vencimientos */}
            <NeuCard className="p-6" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,146,60,0.08) 100%)' }}>
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4" style={{ color: '#d97706' }}>
                <Calendar className="w-4 h-4" /> Próximos Vencimientos
              </h3>
              <div className="space-y-3">
                {[
                  { cliente: 'Banco Nacional', dias: 45, valor: '$180M' },
                  { cliente: 'SuperMax', dias: 60, valor: '$65M' },
                  { cliente: 'TechCorp', dias: 90, valor: '$25M' }
                ].map((item) => (
                  <div key={item.cliente} className="flex items-center justify-between p-3 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                    <div>
                      <p className="font-bold text-sm" style={{ color: N.text }}>{item.cliente}</p>
                      <p className="text-xs" style={{ color: '#6888ff' }}>{item.dias} días</p>
                    </div>
                    <span className="font-bold text-sm" style={{ color: N.text }}>{item.valor}</span>
                  </div>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs font-medium" style={{ color: N.textSub }}>
            &nbsp;
          </p>
        </div>
      </div>
    </div>
  );
}
