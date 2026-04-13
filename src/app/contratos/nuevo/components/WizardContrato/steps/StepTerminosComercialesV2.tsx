/**
 * 💰 SILEXAR PULSE - Step 2: Términos Comerciales TIER 0
 * 
 * @description Paso 2 con análisis automático de Cortex-Risk,
 * términos inteligentes y configuración de facturación avanzada.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  CreditCard,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building2,
  Receipt,
  Percent,
  AlertCircle,
  Target,
  Users,
  BarChart3,
  RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AnalisisCortexRisk {
  clienteNombre: string;
  score: number;
  nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  recomendaciones: {
    diasPago: number;
    limiteMaximo: number;
    requiereGarantia: boolean;
    descuentoMaximo: number;
    requiereAnticipo: boolean;
    porcentajeAnticipo?: number;
  };
  factores: {
    nombre: string;
    valor: string;
    positivo: boolean;
  }[];
  alertas: string[];
  confianza: number;
}

interface TerminosComerciales {
  modalidadPago: 'contado' | 'credito' | 'cuotas' | 'canje' | 'mixto';
  diasPago: number;
  numeroCuotas?: number;
  porcentajeCanje?: number;
  descuentoGeneral: number;
  requiereAnticipo: boolean;
  porcentajeAnticipo?: number;
  facturacionEstilo: 'hitos' | 'cuotas' | 'mensual' | 'anticipada';
  direccionFacturacion: 'anunciante' | 'agencia_medios' | 'agencia_creativa';
  requiereTercero: boolean;
  datosFacturacionValidados: boolean;
}

interface StepTerminosComercialesProps {
  datos: Partial<TerminosComerciales>;
  anunciante?: {
    id: string;
    nombre: string;
    industria: string;
  };
  valorContrato?: number;
  onChange: (datos: Partial<TerminosComerciales>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockAnalisisRisk: AnalisisCortexRisk = {
  clienteNombre: 'SuperMax SpA',
  score: 750,
  nivelRiesgo: 'bajo',
  recomendaciones: {
    diasPago: 30,
    limiteMaximo: 150000000,
    requiereGarantia: false,
    descuentoMaximo: 15,
    requiereAnticipo: false
  },
  factores: [
    { nombre: 'Historial pagos', valor: '100% puntual', positivo: true },
    { nombre: 'Facturación empresa', valor: 'Creciendo +12%', positivo: true },
    { nombre: 'Industria', valor: 'Retail (estable)', positivo: true },
    { nombre: 'Contratos anteriores', valor: '8 exitosos', positivo: true },
    { nombre: 'Antigüedad relación', valor: '3 años', positivo: true }
  ],
  alertas: [],
  confianza: 92
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
};

const RiskScoreGauge: React.FC<{ score: number; nivel: AnalisisCortexRisk['nivelRiesgo'] }> = ({ score, nivel }) => {
  const porcentaje = (score / 1000) * 100;
  const config = {
    bajo: { color: 'from-green-400 to-emerald-500', textColor: 'text-green-600', label: 'BAJO RIESGO' },
    medio: { color: 'from-amber-400 to-orange-500', textColor: 'text-amber-600', label: 'RIESGO MEDIO' },
    alto: { color: 'from-orange-400 to-red-500', textColor: 'text-orange-600', label: 'RIESGO ALTO' },
    critico: { color: 'from-red-500 to-red-700', textColor: 'text-red-600', label: 'RIESGO CRÍTICO' }
  }[nivel];

  return (
    <div className="relative flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeDasharray={`${porcentaje}, 100`}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`${config.color.split(' ')[0].replace('from-', 'stop-')}`} />
              <stop offset="100%" className={`${config.color.split(' ')[1].replace('to-', 'stop-')}`} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{score}</span>
          <span className="text-xs text-slate-500">/1000</span>
        </div>
      </div>
      <div>
        <p className={`font-bold ${config.textColor}`}>{config.label}</p>
        <p className="text-sm text-slate-500">Score Cortex-Risk</p>
      </div>
    </div>
  );
};

const RecomendacionCard: React.FC<{
  icono: React.ReactNode;
  label: string;
  valor: string;
  aprobado: boolean;
  descripcion?: string;
}> = ({ icono, label, valor, aprobado, descripcion }) => (
  <div className={`p-4 rounded-xl border ${aprobado ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        {icono}
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      {aprobado ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-amber-500" />
      )}
    </div>
    <p className={`text-lg font-bold ${aprobado ? 'text-green-700' : 'text-amber-700'}`}>{valor}</p>
    {descripcion && <p className="text-xs text-slate-500 mt-1">{descripcion}</p>}
  </div>
);

const FactorItem: React.FC<{ factor: AnalisisCortexRisk['factores'][0] }> = ({ factor }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-600">{factor.nombre}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-800">{factor.valor}</span>
      {factor.positivo ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-500" />
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function StepTerminosComerciales({
  datos,
  anunciante,
  valorContrato = 100000000,
  onChange,
  onValidationChange
}: StepTerminosComercialesProps) {
  const [analisisRisk, setAnalisisRisk] = useState<AnalisisCortexRisk | null>(null);
  const [analizando, setAnalizando] = useState(true);
  const [mostrarFactores, setMostrarFactores] = useState(false);
  const [terminos, setTerminos] = useState<TerminosComerciales>({
    modalidadPago: 'credito',
    diasPago: 30,
    descuentoGeneral: 0,
    requiereAnticipo: false,
    facturacionEstilo: 'mensual',
    direccionFacturacion: 'anunciante',
    requiereTercero: false,
    datosFacturacionValidados: false,
    ...datos
  });

  // Simular análisis de Cortex-Risk
  useEffect(() => {
    setAnalizando(true);
    const timer = setTimeout(() => {
      setAnalisisRisk(mockAnalisisRisk);
      setAnalizando(false);
      
      // Aplicar recomendaciones automáticas
      setTerminos(prev => ({
        ...prev,
        diasPago: mockAnalisisRisk.recomendaciones.diasPago,
        requiereAnticipo: mockAnalisisRisk.recomendaciones.requiereAnticipo,
        porcentajeAnticipo: mockAnalisisRisk.recomendaciones.porcentajeAnticipo
      }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [anunciante?.id]);

  // Validación
  useEffect(() => {
    const isValid = terminos.diasPago > 0 && terminos.direccionFacturacion !== undefined;
    onValidationChange?.(isValid);
  }, [terminos, onValidationChange]);

  // Propagar cambios
  useEffect(() => {
    onChange(terminos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminos]);

  const handleChange = (campo: keyof TerminosComerciales, valor: unknown) => {
    setTerminos(prev => ({ ...prev, [campo]: valor }));
  };

  const excedeLimites = terminos.descuentoGeneral > (analisisRisk?.recomendaciones.descuentoMaximo || 15);
  const sugerenciaFacturacion = valorContrato > 50000000 ? 'cuotas' : 'mensual';

  return (
    <div className="space-y-8">
      {/* Panel de Análisis Cortex-Risk */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-indigo-100">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">🛡️ ANÁLISIS CORTEX-RISK AUTOMÁTICO</h3>
          {analisisRisk && (
            <span className="ml-auto px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              {analisisRisk.confianza}% confianza
            </span>
          )}
        </div>

        {analizando ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
            <p className="text-slate-600">Analizando perfil de riesgo...</p>
            <p className="text-sm text-slate-400 mt-1">Consultando historial y datos financieros</p>
          </div>
        ) : analisisRisk && (
          <div className="space-y-6">
            {/* Header con score */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Cliente</p>
                <p className="text-xl font-bold text-slate-800">{analisisRisk.clienteNombre}</p>
              </div>
              <RiskScoreGauge score={analisisRisk.score} nivel={analisisRisk.nivelRiesgo} />
            </div>

            {/* Recomendaciones */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Recomendaciones automáticas:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <RecomendacionCard
                  icono={<Calendar className="w-4 h-4 text-slate-500" />}
                  label="Términos de pago"
                  valor={`${analisisRisk.recomendaciones.diasPago} días`}
                  aprobado={terminos.diasPago <= analisisRisk.recomendaciones.diasPago}
                />
                <RecomendacionCard
                  icono={<DollarSign className="w-4 h-4 text-slate-500" />}
                  label="Límite sugerido"
                  valor={formatCurrency(analisisRisk.recomendaciones.limiteMaximo)}
                  aprobado={valorContrato <= analisisRisk.recomendaciones.limiteMaximo}
                />
                <RecomendacionCard
                  icono={<Shield className="w-4 h-4 text-slate-500" />}
                  label="Garantías"
                  valor={analisisRisk.recomendaciones.requiereGarantia ? 'Requeridas' : 'No requeridas'}
                  aprobado={!analisisRisk.recomendaciones.requiereGarantia}
                />
                <RecomendacionCard
                  icono={<Percent className="w-4 h-4 text-slate-500" />}
                  label="Descuento máximo"
                  valor={`${analisisRisk.recomendaciones.descuentoMaximo}%`}
                  aprobado={terminos.descuentoGeneral <= analisisRisk.recomendaciones.descuentoMaximo}
                />
              </div>
            </div>

            {/* Factores expandibles */}
            <div>
              <button
                onClick={() => setMostrarFactores(!mostrarFactores)}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <BarChart3 className="w-4 h-4" />
                📊 Factores considerados
                {mostrarFactores ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {mostrarFactores && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 rounded-xl bg-white border border-slate-200"
                  >
                    {analisisRisk.factores.map((factor, idx) => (
                      <FactorItem key={idx} factor={factor} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Alertas */}
            {analisisRisk.alertas.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                {analisisRisk.alertas.map((alerta, idx) => (
                  <p key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {alerta}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Configuración de Términos de Pago */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-slate-800">Términos de Pago</h3>
          {analisisRisk && (
            <span className="ml-auto px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Pre-llenado por IA
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Modalidad de pago */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Modalidad de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'contado', label: 'Contado', icon: '💵' },
                { id: 'credito', label: 'Crédito', icon: '💳' },
                { id: 'cuotas', label: 'Cuotas', icon: '📅' },
                { id: 'mixto', label: 'Mixto', icon: '🔀' }
              ].map(opcion => (
                <button
                  key={opcion.id}
                  onClick={() => handleChange('modalidadPago', opcion.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    terminos.modalidadPago === opcion.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg">{opcion.icon}</span>
                  <p className="font-medium text-slate-700">{opcion.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Días de pago */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Días de Pago
              {analisisRisk && terminos.diasPago > analisisRisk.recomendaciones.diasPago && (
                <span className="ml-2 text-amber-600 text-xs">⚠️ Excede recomendación</span>
              )}
            </label>
            <div className="flex gap-2">
              {[0, 15, 30, 45, 60, 90].map(dias => (
                <button
                  key={dias}
                  onClick={() => handleChange('diasPago', dias)}
                  className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                    terminos.diasPago === dias
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {dias === 0 ? 'Hoy' : `${dias}d`}
                </button>
              ))}
            </div>
          </div>

          {/* Cuotas (si aplica) */}
          {terminos.modalidadPago === 'cuotas' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Número de Cuotas</label>
              <select
                value={terminos.numeroCuotas || 2}
                onChange={(e) => handleChange('numeroCuotas', parseInt(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50"
              >
                {[2, 3, 4, 6, 12].map(n => (
                  <option key={n} value={n}>{n} cuotas</option>
                ))}
              </select>
            </div>
          )}

          {/* Descuento general */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descuento General
              {excedeLimites && (
                <span className="ml-2 text-red-600 text-xs">🚨 Requiere aprobación especial</span>
              )}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="30"
                value={terminos.descuentoGeneral}
                onChange={(e) => handleChange('descuentoGeneral', parseInt(e.target.value))}
                aria-label="Descuento General"
                className="flex-1"
              />
              <span className={`text-xl font-bold ${excedeLimites ? 'text-red-600' : 'text-slate-800'}`}>
                {terminos.descuentoGeneral}%
              </span>
            </div>
            {analisisRisk && (
              <p className="text-xs text-slate-500 mt-1">
                Máximo recomendado: {analisisRisk.recomendaciones.descuentoMaximo}%
              </p>
            )}
          </div>
        </div>

        {/* Alerta de aprobación */}
        {excedeLimites && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">
                Descuento excede límite autorizado - Se solicitará aprobación de Gerente Comercial
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Configuración de Facturación */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <Receipt className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-slate-800">Configuración de Facturación</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Estilo de facturación */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estilo de Facturación
              {sugerenciaFacturacion !== terminos.facturacionEstilo && (
                <span className="ml-2 text-indigo-600 text-xs flex items-center gap-1 inline-flex">
                  <Sparkles className="w-3 h-3" />
                  IA sugiere: {sugerenciaFacturacion}
                </span>
              )}
            </label>
            <div className="space-y-2">
              {[
                { id: 'mensual', label: 'Facturación Mensual', desc: 'Factura al final de cada mes de campaña' },
                { id: 'cuotas', label: 'Por Cuotas', desc: 'Facturación según plan de cuotas acordado' },
                { id: 'hitos', label: 'Por Hitos', desc: 'Factura al completar objetivos específicos' },
                { id: 'anticipada', label: 'Anticipada', desc: 'Factura completa antes de iniciar' }
              ].map(opcion => (
                <button
                  key={opcion.id}
                  onClick={() => handleChange('facturacionEstilo', opcion.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    terminos.facturacionEstilo === opcion.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-700">{opcion.label}</p>
                  <p className="text-xs text-slate-500">{opcion.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dirección de facturación */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dirección de Facturación</label>
            <div className="space-y-2">
              {[
                { id: 'anunciante', label: 'Al Anunciante', icon: <Building2 className="w-4 h-4" />, desc: 'Factura directa al cliente' },
                { id: 'agencia_medios', label: 'Agencia de Medios', icon: <Users className="w-4 h-4" />, desc: 'Requiere carta de tercerización' },
                { id: 'agencia_creativa', label: 'Agencia Creativa', icon: <Target className="w-4 h-4" />, desc: 'Requiere carta de tercerización' }
              ].map(opcion => (
                <button
                  key={opcion.id}
                  onClick={() => {
                    handleChange('direccionFacturacion', opcion.id);
                    handleChange('requiereTercero', opcion.id !== 'anunciante');
                  }}
                  className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                    terminos.direccionFacturacion === opcion.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100">{opcion.icon}</div>
                  <div>
                    <p className="font-medium text-slate-700">{opcion.label}</p>
                    <p className="text-xs text-slate-500">{opcion.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Alerta de tercerización */}
            {terminos.requiereTercero && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200"
              >
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Se requerirá carta de tercerización antes de activar el contrato
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Validación fiscal */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700">Validación Fiscal</p>
                <p className="text-sm text-slate-500">Datos del SII verificados automáticamente</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              Re-validar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
