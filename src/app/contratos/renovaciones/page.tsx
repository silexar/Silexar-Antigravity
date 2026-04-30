/**
 * 🔮 SILEXAR PULSE - Renewals Dashboard TIER 0
 * 
 * @description Dashboard de renovaciones con motor predictivo,
 * análisis de factores y acciones automáticas.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  Target,
  Send,
  FileText,
  AlertCircle,
  XCircle,
  Brain
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
// TIPOS
// ═══════════════════════════════════════════════════════════════

type NivelProbabilidad = 'ALTA' | 'MEDIA' | 'BAJA' | 'CRITICA';

interface ContratoRenovacion {
  id: string;
  clienteNombre: string;
  fechaVencimientos: Date;
  valorActual: number;
  probabilidadRenovacion: number;
  nivelProbabilidad: NivelProbabilidad;
  accionRecomendada: string;
  factores: { nombre: string; valor: number; impacto: 'positivo' | 'negativo' | 'neutro' }[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockContratos: ContratoRenovacion[] = [
  {
    id: '1', clienteNombre: 'SuperMax', fechaVencimientos: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    valorActual: 125000000, probabilidadRenovacion: 92, nivelProbabilidad: 'ALTA',
    accionRecomendada: 'Contactar 7 días antes con oferta mejorada',
    factores: [
      { nombre: 'Performance Campaña', valor: 95, impacto: 'positivo' },
      { nombre: 'Satisfacción (NPS)', valor: 85, impacto: 'positivo' },
      { nombre: 'Historial', valor: 100, impacto: 'positivo' }
    ]
  },
  {
    id: '2', clienteNombre: 'Banco XYZ', fechaVencimientos: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    valorActual: 85000000, probabilidadRenovacion: 88, nivelProbabilidad: 'ALTA',
    accionRecomendada: 'Proponer extensión anual con descuento 5%',
    factores: [
      { nombre: 'Performance Campaña', valor: 88, impacto: 'positivo' },
      { nombre: 'Competencia', valor: 50, impacto: 'neutro' }
    ]
  },
  {
    id: '3', clienteNombre: 'AutoMax', fechaVencimientos: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    valorActual: 45000000, probabilidadRenovacion: 65, nivelProbabilidad: 'MEDIA',
    accionRecomendada: 'Reunión presencial + análisis de competencia',
    factores: [
      { nombre: 'Performance', valor: 70, impacto: 'neutro' },
      { nombre: 'Competencia', valor: 70, impacto: 'negativo' }
    ]
  },
  {
    id: '4', clienteNombre: 'TechCorp', fechaVencimientos: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    valorActual: 95000000, probabilidadRenovacion: 35, nivelProbabilidad: 'CRITICA',
    accionRecomendada: 'Intervención gerencial + oferta defensiva',
    factores: [
      { nombre: 'Performance', valor: 55, impacto: 'negativo' },
      { nombre: 'NPS', valor: 50, impacto: 'negativo' },
      { nombre: 'Competencia', valor: 90, impacto: 'negativo' }
    ]
  }
];

const factoresIA = [
  'Performance de campaña actual',
  'Satisfacción del cliente (NPS)',
  'Actividad de competencia',
  'Ciclo presupuestario del cliente',
  'Historial de renovaciones similar',
  'Cambios en el equipo del cliente'
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

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatDias = (fecha: Date) => {
  const dias = Math.ceil((fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return dias;
};

const ContratoRenovacionCard: React.FC<{
  contrato: ContratoRenovacion;
  expandido: boolean;
  onToggle: () => void;
}> = ({ contrato, expandido, onToggle }) => {
  const nivelConfig = {
    ALTA: { bg: 'rgba(34,197,94,0.08)', border: '#6888ff40', icon: <CheckCircle2 className="w-5 h-5" style={{ color: '#6888ff' }} />, label: '✅ Alta Probabilidad', color: '#6888ff' },
    MEDIA: { bg: 'rgba(245,158,11,0.08)', border: '#6888ff40', icon: <AlertTriangle className="w-5 h-5" style={{ color: '#6888ff' }} />, label: '⚠️ Riesgo Medio', color: '#6888ff' },
    BAJA: { bg: 'rgba(249,115,22,0.08)', border: '#f9731640', icon: <AlertCircle className="w-5 h-5" style={{ color: '#f97316' }} />, label: '🟠 Riesgo Alto', color: '#f97316' },
    CRITICA: { bg: 'rgba(239,68,68,0.08)', border: '#9aa3b840', icon: <XCircle className="w-5 h-5" style={{ color: '#9aa3b8' }} />, label: '❌ Riesgo Crítico', color: '#9aa3b8' }
  }[contrato.nivelProbabilidad];

  const diasRestantes = formatDias(contrato.fechaVencimientos);

  return (
    <motion.div layout className="rounded-2xl overflow-hidden" style={{ background: nivelConfig.bg, border: `1px solid ${nivelConfig.border}` }}>
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-start gap-4">
          {nivelConfig.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm" style={{ color: N.text }}>{contrato.clienteNombre}</h4>
              <span className="text-sm" style={{ color: N.textSub }}>• Vence: {diasRestantes} días</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-black" style={{ color: N.text }}>Prob: {contrato.probabilidadRenovacion}%</span>
              <span style={{ color: N.textSub }}>Valor: {formatCurrency(contrato.valorActual)}</span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandido ? 'rotate-180' : ''}`} style={{ color: N.textSub }} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: N.accent }} />
          <span className="text-sm font-bold" style={{ color: N.accent }}>🎯 Acción: {contrato.accionRecomendada}</span>
        </div>
      </button>

      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
            style={{ borderTop: `1px solid ${N.dark}30`, background: N.base }}
          >
            {/* Factores */}
            <div className="mb-4">
              <p className="text-sm font-bold mb-2" style={{ color: N.text }}>Factores analizados:</p>
              <div className="space-y-2">
                {contrato.factores.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: N.textSub }}>{f.nombre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${f.valor}%`,
                            background: f.impacto === 'positivo' ? '#6888ff' : f.impacto === 'negativo' ? '#9aa3b8' : '#6888ff'
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold w-10" style={{ color: N.text }}>{f.valor}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-all" style={{ background: `${N.accent}12`, color: N.accent, boxShadow: neuXs }}>
                <Phone className="w-4 h-4" />
                Contactar
              </button>
              <button className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-all" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', boxShadow: neuXs }}>
                <FileText className="w-4 h-4" />
                Propuesta
              </button>
              <button className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-all" style={{ background: 'rgba(34,197,94,0.12)', color: '#6888ff', boxShadow: neuXs }}>
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function RenovacionesDashboard() {
  const [contratos] = useState<ContratoRenovacion[]>(mockContratos);
  const [contratoExpandido, setContratoExpandido] = useState<string | null>(null);

  const contratosAgrupados = useMemo(() => ({
    ALTA: contratos.filter(c => c.nivelProbabilidad === 'ALTA'),
    MEDIA: contratos.filter(c => c.nivelProbabilidad === 'MEDIA'),
    BAJA: contratos.filter(c => c.nivelProbabilidad === 'BAJA'),
    CRITICA: contratos.filter(c => c.nivelProbabilidad === 'CRITICA')
  }), [contratos]);

  const valorTotal = contratos.reduce((acc, c) => acc + c.valorActual, 0);
  const valorEnRiesgo = contratos.filter(c => c.probabilidadRenovacion < 70).reduce((acc, c) => acc + c.valorActual, 0);

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
              <RefreshCw className="w-8 h-8" style={{ color: N.accent }} />
            </div>
            <div>
              <h1 className="text-3xl font-black" style={{ color: N.text }}>🔮 Motor Predictivo de Renovaciones</h1>
              <p className="text-sm" style={{ color: N.textSub }}>Cortex-Flow • Análisis en tiempo real</p>
            </div>
          </div>
          <div className="flex gap-2">
            <NeuButton variant="secondary">
              <Target className="w-4 h-4" />
              Generar Plan Acción
            </NeuButton>
            <NeuButton variant="primary">
              <Send className="w-4 h-4" />
              Alertar Ejecutivos
            </NeuButton>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid md:grid-cols-4 gap-5">
          <NeuCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                <Calendar className="w-5 h-5" style={{ color: N.accent }} />
              </div>
              <span className="text-sm" style={{ color: N.textSub }}>Próximos a vencer (30d)</span>
            </div>
            <p className="text-3xl font-black" style={{ color: N.text }}>{contratos.length}</p>
          </NeuCard>
          <NeuCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                <DollarSign className="w-5 h-5" style={{ color: '#6888ff' }} />
              </div>
              <span className="text-sm" style={{ color: N.textSub }}>Valor Total</span>
            </div>
            <p className="text-3xl font-black" style={{ color: N.text }}>{formatCurrency(valorTotal)}</p>
          </NeuCard>
          <NeuCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#6888ff' }} />
              </div>
              <span className="text-sm" style={{ color: N.textSub }}>Valor en Riesgo</span>
            </div>
            <p className="text-3xl font-black" style={{ color: '#6888ff' }}>{formatCurrency(valorEnRiesgo)}</p>
          </NeuCard>
          <NeuCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#6888ff' }} />
              </div>
              <span className="text-sm" style={{ color: N.textSub }}>Tasa Renovación Histórica</span>
            </div>
            <p className="text-3xl font-black" style={{ color: '#6888ff' }}>78%</p>
          </NeuCard>
        </div>

        {/* Panel de Análisis */}
        <NeuCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                <Brain className="w-6 h-6" style={{ color: '#6888ff' }} />
              </div>
              <h2 className="font-black" style={{ color: N.text }}>🤖 FACTORES ANALIZADOS POR IA</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {factoresIA.map((factor, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'rgba(104,136,255,0.08)' }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#6888ff' }} />
                  <span className="text-sm" style={{ color: N.text }}>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </NeuCard>

        {/* Contratos por nivel */}
        <div className="space-y-6">
          {/* Alta Probabilidad */}
          {contratosAgrupados.ALTA.length > 0 && (
            <div>
              <h3 className="text-lg font-black mb-3 flex items-center gap-2" style={{ color: '#6888ff' }}>
                <CheckCircle2 className="w-5 h-5" />
                ✅ ALTA PROBABILIDAD RENOVACIÓN (85%+)
              </h3>
              <div className="space-y-3">
                {contratosAgrupados.ALTA.map(contrato => (
                  <ContratoRenovacionCard
                    key={contrato.id}
                    contrato={contrato}
                    expandido={contratoExpandido === contrato.id}
                    onToggle={() => setContratoExpandido(contratoExpandido === contrato.id ? null : contrato.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Riesgo Medio */}
          {contratosAgrupados.MEDIA.length > 0 && (
            <div>
              <h3 className="text-lg font-black mb-3 flex items-center gap-2" style={{ color: '#6888ff' }}>
                <AlertTriangle className="w-5 h-5" />
                ⚠️ RIESGO MEDIO (50-70%)
              </h3>
              <div className="space-y-3">
                {contratosAgrupados.MEDIA.map(contrato => (
                  <ContratoRenovacionCard
                    key={contrato.id}
                    contrato={contrato}
                    expandido={contratoExpandido === contrato.id}
                    onToggle={() => setContratoExpandido(contratoExpandido === contrato.id ? null : contrato.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Riesgo Alto/Crítico */}
          {(contratosAgrupados.BAJA.length > 0 || contratosAgrupados.CRITICA.length > 0) && (
            <div>
              <h3 className="text-lg font-black mb-3 flex items-center gap-2" style={{ color: '#9aa3b8' }}>
                <XCircle className="w-5 h-5" />
                ❌ RIESGO ALTO/CRÍTICO (&lt;50%)
              </h3>
              <div className="space-y-3">
                {[...contratosAgrupados.BAJA, ...contratosAgrupados.CRITICA].map(contrato => (
                  <ContratoRenovacionCard
                    key={contrato.id}
                    contrato={contrato}
                    expandido={contratoExpandido === contrato.id}
                    onToggle={() => setContratoExpandido(contratoExpandido === contrato.id ? null : contrato.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
