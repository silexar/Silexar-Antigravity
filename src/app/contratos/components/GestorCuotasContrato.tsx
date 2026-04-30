/**
 * ?? SILEXAR PULSE - Gesti�n de Cuotas TIER 0
 * 
 * @description Componente para gesti�n inteligente de cuotas con:
 * - Generador de cuotas con IA
 * - Visualizaci�n de plan de pagos
 * - Modificaci�n de fechas y montos
 * - Predicci�n de cumplimiento
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  Edit,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings,
  Save
} from 'lucide-react';

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

interface Cuota {
  numero: number;
  monto: number;
  fechaVencimientos: Date;
  estado: 'pendiente' | 'programada' | 'emitida' | 'pagada' | 'vencida';
  prediccionPago: number; // 0-100
  riesgo: 'bajo' | 'medio' | 'alto';
  nota?: string;
}

interface PlanCuotas {
  valorTotal: number;
  cuotas: Cuota[];
  distribucion: 'uniforme' | 'progresiva' | 'decreciente' | 'personalizada';
  probabilidadCumplimiento: number;
  fechaInicio: Date;
  fechaFin: Date;
}

// ---------------------------------------------------------------
// ESTILOS NEUROMORPHIC
// ---------------------------------------------------------------

const neuro = {
  panel: `
    bg-[#dfeaff]
    rounded-3xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]

  `,
  card: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]

  `,
  input: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-[#6888ff]/50 focus:outline-none
    px-4 py-3
  `,
  btnPrimary: `
    bg-[#6888ff]
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-[#dfeaff]
    text-[#69738c] font-medium rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ---------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP', 
    maximumFractionDigits: 0 
  }).format(value);
};

const formatFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

const generarCuotasIA = (valorTotal: number, numeroCuotas: number, fechaInicio: Date, distribucion: PlanCuotas['distribucion']): Cuota[] => {
  const cuotas: Cuota[] = [];
  const fechaCuota = new Date(fechaInicio);
  
  for (let i = 1; i <= numeroCuotas; i++) {
    let monto: number;
    
    switch (distribucion) {
      case 'progresiva':
        // Las cuotas van creciendo (m�s f�cil al inicio)
        monto = (valorTotal / numeroCuotas) * (0.7 + (i / numeroCuotas) * 0.6);
        break;
      case 'decreciente':
        // Las cuotas van decreciendo (m�s peso al inicio)
        monto = (valorTotal / numeroCuotas) * (1.3 - (i / numeroCuotas) * 0.6);
        break;
      default:
        monto = valorTotal / numeroCuotas;
    }
    
    // Ajustar �ltima cuota para completar el total exacto
    if (i === numeroCuotas) {
      const sumaPrevias = cuotas.reduce((acc, c) => acc + c.monto, 0);
      monto = valorTotal - sumaPrevias;
    }
    
    // Calcular predicci�n basada en n�mero de cuota y monto
    const prediccion = Math.max(50, Math.min(98, 95 - (i * 3) - (monto / valorTotal) * 10));
    
    cuotas.push({
      numero: i,
      monto: Math.round(monto),
      fechaVencimientos: new Date(fechaCuota),
      estado: 'programada',
      prediccionPago: Math.round(prediccion),
      riesgo: prediccion > 80 ? 'bajo' : prediccion > 60 ? 'medio' : 'alto'
    });
    
    // Siguiente mes
    fechaCuota.setMonth(fechaCuota.getMonth() + 1);
  }
  
  return cuotas;
};

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export default function GestorCuotasContrato({
  valorContrato = 100000000,
  fechaInicio = new Date(),
  fechaFin = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  scoreCliente = 780,
  onGuardar
}: {
  valorContrato?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  scoreCliente?: number;
  onGuardar?: (plan: PlanCuotas) => void;
}) {
  const [numeroCuotas, setNumeroCuotas] = useState(3);
  const [distribucion, setDistribucion] = useState<PlanCuotas['distribucion']>('uniforme');
  const [cuotas, setCuotas] = useState<Cuota[]>(() => 
    generarCuotasIA(valorContrato, 3, fechaInicio, 'uniforme')
  );
  const [editandoCuota, setEditandoCuota] = useState<number | null>(null);
  const [showOpciones, setShowOpciones] = useState(false);

  // Recalcular cuotas
  const regenerarCuotas = () => {
    setCuotas(generarCuotasIA(valorContrato, numeroCuotas, fechaInicio, distribucion));
  };

  // Estad�sticas
  const stats = useMemo(() => {
    const total = cuotas.reduce((acc, c) => acc + c.monto, 0);
    const promPrediccion = cuotas.reduce((acc, c) => acc + c.prediccionPago, 0) / cuotas.length;
    const cuotasRiesgo = cuotas.filter(c => c.riesgo === 'alto').length;
    
    return { total, promPrediccion, cuotasRiesgo };
  }, [cuotas]);

  // Sugerencia IA
  const sugerenciaIA = useMemo(() => {
    if (scoreCliente > 800) {
      return {
        texto: 'Cliente excelente. Puedes ofrecer hasta 6 cuotas sin riesgo adicional.',
        color: 'text-[#6888ff]',
        bgColor: 'bg-[#6888ff]/5'
      };
    }
    if (scoreCliente > 600) {
      return {
        texto: 'Cliente bueno. Recomendamos m�ximo 4 cuotas con distribuci�n uniforme.',
        color: 'text-[#6888ff]',
        bgColor: 'bg-[#6888ff]/5'
      };
    }
    return {
      texto: 'Cliente de riesgo. Minimizar cuotas o exigir garant�a adicional.',
      color: 'text-[#6888ff]',
      bgColor: 'bg-[#6888ff]/5'
    };
  }, [scoreCliente]);

  const handleModificarCuota = (index: number, campo: 'monto' | 'fecha', valor: number | Date) => {
    const nuevas = [...cuotas];
    if (campo === 'monto') {
      nuevas[index].monto = valor as number;
    } else {
      nuevas[index].fechaVencimientos = valor as Date;
    }
    setCuotas(nuevas);
    setEditandoCuota(null);
  };

  const handleGuardar = () => {
    const plan: PlanCuotas = {
      valorTotal: valorContrato,
      cuotas,
      distribucion,
      probabilidadCumplimiento: stats.promPrediccion,
      fechaInicio,
      fechaFin
    };
    onGuardar?.(plan);
  };

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#6888ff]">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#69738c]">Plan de Cuotas</h3>
              <p className="text-sm text-[#9aa3b8]">Valor total: {formatCurrency(valorContrato)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOpciones(!showOpciones)}
              className={`${neuro.btnSecondary} p-2`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={regenerarCuotas}
              className={`${neuro.btnSecondary} px-4 py-2 flex items-center gap-2`}
            >
              <Sparkles className="w-4 h-4" />
              Regenerar IA
            </button>
          </div>
        </div>

        {/* Opciones */}
        <AnimatePresence>
          {showOpciones && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-[#bec8de30] overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-4">
                {/* N�mero de cuotas */}
                <div>
                  <label className="block text-sm text-[#69738c] mb-2">N�mero de cuotas</label>
                  <select
                    value={numeroCuotas}
                    onChange={e => {
                      setNumeroCuotas(Number(e.target.value));
                    }}
                    className={`${neuro.input} w-full`}
                  >
                    {[1, 2, 3, 4, 5, 6, 9, 12].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'cuota' : 'cuotas'}</option>
                    ))}
                  </select>
                </div>

                {/* Distribuci�n */}
                <div>
                  <label className="block text-sm text-[#69738c] mb-2">Distribuci�n</label>
                  <select
                    value={distribucion}
                    onChange={e => setDistribucion(e.target.value as PlanCuotas['distribucion'])}
                    className={`${neuro.input} w-full`}
                  >
                    <option value="uniforme">Uniforme (iguales)</option>
                    <option value="progresiva">Progresiva (creciente)</option>
                    <option value="decreciente">Decreciente</option>
                    <option value="personalizada">Personalizada</option>
                  </select>
                </div>

                {/* Score cliente */}
                <div>
                  <label className="block text-sm text-[#69738c] mb-2">Score Cliente</label>
                  <div className={`${neuro.card} px-4 py-3 flex items-center gap-2`}>
                    <TrendingUp className={`w-5 h-5 ${
                      scoreCliente > 800 ? 'text-[#6888ff]' :
                      scoreCliente > 600 ? 'text-[#6888ff]' :
                      'text-[#6888ff]'
                    }`} />
                    <span className="font-bold text-[#69738c]">{scoreCliente}/1000</span>
                    <span className={`${neuro.badge} ${
                      scoreCliente > 800 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                      scoreCliente > 600 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                      'bg-[#6888ff]/10 text-[#6888ff]'
                    }`}>
                      {scoreCliente > 800 ? 'Excelente' : scoreCliente > 600 ? 'Bueno' : 'Riesgo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sugerencia IA */}
              <div className={`mt-4 p-3 rounded-xl ${sugerenciaIA.bgColor} flex items-center gap-2`}>
                <Sparkles className={`w-5 h-5 ${sugerenciaIA.color}`} />
                <p className={`text-sm ${sugerenciaIA.color}`}>{sugerenciaIA.texto}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline de cuotas */}
      <div className="p-6">
        <div className="relative">
          {/* L�nea de tiempo */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#dfeaff]" />

          <div className="space-y-4">
            {cuotas.map((cuota, idx) => (
              <motion.div
                key={cuota.numero}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Indicador */}
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  cuota.estado === 'pagada' ? 'bg-[#6888ff]/50' :
                  cuota.riesgo === 'alto' ? 'bg-[#dfeaff]0' :
                  cuota.riesgo === 'medio' ? 'bg-[#6888ff]/50' :
                  'bg-[#6888ff]'
                }`}>
                  {cuota.estado === 'pagada' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    cuota.numero
                  )}
                </div>

                {/* Card de cuota */}
                <div className={`${neuro.card} flex-1 p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg text-[#69738c]">
                        Cuota {cuota.numero} - {formatCurrency(cuota.monto)}
                      </p>
                      <p className="text-sm text-[#9aa3b8] flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Vence: {formatFecha(cuota.fechaVencimientos)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Predicci�n */}
                      <div className="text-center">
                        <div className={`flex items-center gap-1 ${
                          cuota.prediccionPago > 80 ? 'text-[#6888ff]' :
                          cuota.prediccionPago > 60 ? 'text-[#6888ff]' :
                          'text-[#9aa3b8]'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                          <span className="font-bold">{cuota.prediccionPago}%</span>
                        </div>
                        <p className="text-xs text-[#9aa3b8]">Prob. pago</p>
                      </div>

                      {/* Acciones */}
                      <button
                        onClick={() => setEditandoCuota(editandoCuota === idx ? null : idx)}
                        className={`${neuro.btnSecondary} p-2`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Editor de cuota */}
                  <AnimatePresence>
                    {editandoCuota === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-[#bec8de30] grid grid-cols-2 gap-4 overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs text-[#9aa3b8] mb-1">Monto</label>
                          <input
                            type="number"
                            aria-label="Monto de cuota"
                            defaultValue={cuota.monto}
                            onBlur={e => handleModificarCuota(idx, 'monto', Number(e.target.value))}
                            className={`${neuro.input} w-full text-right`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#9aa3b8] mb-1">Fecha vencimientos</label>
                          <input
                            type="date"
                            aria-label="Fecha de vencimientos"
                            defaultValue={cuota.fechaVencimientos.toISOString().split('T')[0]}
                            onBlur={e => handleModificarCuota(idx, 'fecha', new Date(e.target.value))}
                            className={`${neuro.input} w-full`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer con resumen */}
      <div className="px-6 py-4 bg-[#dfeaff]/50 border-t border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-[#9aa3b8]">Total cuotas</p>
              <p className="font-bold text-lg text-[#69738c]">{formatCurrency(stats.total)}</p>
            </div>
            <div>
              <p className="text-sm text-[#9aa3b8]">Prob. cumplimiento</p>
              <p className={`font-bold text-lg ${
                stats.promPrediccion > 80 ? 'text-[#6888ff]' :
                stats.promPrediccion > 60 ? 'text-[#6888ff]' :
                'text-[#9aa3b8]'
              }`}>
                {Math.round(stats.promPrediccion)}%
              </p>
            </div>
            {stats.cuotasRiesgo > 0 && (
              <div className={`${neuro.badge} bg-[#dfeaff] text-[#9aa3b8] flex items-center gap-1`}>
                <AlertTriangle className="w-3 h-3" />
                {stats.cuotasRiesgo} cuota(s) en riesgo
              </div>
            )}
          </div>

          <button
            onClick={handleGuardar}
            className={`${neuro.btnPrimary} px-6 py-2 flex items-center gap-2`}
          >
            <Save className="w-5 h-5" />
            Guardar Plan
          </button>
        </div>
      </div>
    </div>
  );
}
