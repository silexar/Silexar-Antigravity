/**
 * 🧮 SILEXAR PULSE - Smart Contract Calculator TIER 0
 * 
 * @description Calculadora inteligente para contratos que permite:
 * - Simular descuentos y comisiones
 * - Comparar escenarios
 * - Calcular márgenes
 * - Analizar rentabilidad
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Copy,
  Save,
  Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface DatosCalculadora {
  valorBruto: number;
  descuentoPorcentaje: number;
  comisionAgenciaPorcentaje: number;
  iva: number;
  costoOperacional?: number;
}

interface ResultadoCalculo {
  valorBruto: number;
  montoDescuento: number;
  valorConDescuento: number;
  montoComision: number;
  valorDespuesComision: number;
  montoIva: number;
  valorTotal: number;
  valorNeto: number;
  margenBruto: number;
  margenNeto: number;
  rentabilidad: number;
}

interface Escenario {
  id: string;
  nombre: string;
  datos: DatosCalculadora;
  resultado: ResultadoCalculo;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
  `,
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    px-4 py-3 text-right font-semibold
  `,
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-gradient-to-br from-slate-50 to-slate-100
    text-slate-700 font-medium rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `,
  slider: `
    w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:h-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-indigo-500
    [&::-webkit-slider-thumb]:shadow-lg
    [&::-webkit-slider-thumb]:cursor-pointer
  `
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP', 
    maximumFractionDigits: 0 
  }).format(value);
};

const calcular = (datos: DatosCalculadora): ResultadoCalculo => {
  const valorBruto = datos.valorBruto;
  const montoDescuento = valorBruto * (datos.descuentoPorcentaje / 100);
  const valorConDescuento = valorBruto - montoDescuento;
  const montoComision = valorConDescuento * (datos.comisionAgenciaPorcentaje / 100);
  const valorDespuesComision = valorConDescuento - montoComision;
  const montoIva = valorDespuesComision * (datos.iva / 100);
  const valorNeto = valorDespuesComision;
  const valorTotal = valorDespuesComision + montoIva;
  
  const costoOp = datos.costoOperacional || 0;
  const margenBruto = valorConDescuento - costoOp;
  const margenNeto = valorNeto - costoOp;
  const rentabilidad = valorBruto > 0 ? (margenNeto / valorBruto) * 100 : 0;

  return {
    valorBruto,
    montoDescuento,
    valorConDescuento,
    montoComision,
    valorDespuesComision,
    montoIva,
    valorTotal,
    valorNeto,
    margenBruto,
    margenNeto,
    rentabilidad
  };
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function SmartCalculator({
  valorInicial = 50000000,
  descuentoInicial = 10,
  comisionInicial = 15,
  onAplicar
}: {
  valorInicial?: number;
  descuentoInicial?: number;
  comisionInicial?: number;
  onAplicar?: (resultado: ResultadoCalculo) => void;
}) {
  const [datos, setDatos] = useState<DatosCalculadora>({
    valorBruto: valorInicial,
    descuentoPorcentaje: descuentoInicial,
    comisionAgenciaPorcentaje: comisionInicial,
    iva: 19,
    costoOperacional: 0
  });

  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [showComparacion, setShowComparacion] = useState(false);

  const resultado = useMemo(() => calcular(datos), [datos]);

  // Límites del usuario (simular)
  const limiteDescuento = 20;
  const excedeLimite = datos.descuentoPorcentaje > limiteDescuento;

  const handleGuardarEscenario = () => {
    const nuevo: Escenario = {
      id: `esc-${Date.now()}`,
      nombre: `Escenario ${escenarios.length + 1}`,
      datos: { ...datos },
      resultado: { ...resultado }
    };
    setEscenarios([...escenarios, nuevo]);
  };

  const handleResetear = () => {
    setDatos({
      valorBruto: valorInicial,
      descuentoPorcentaje: descuentoInicial,
      comisionAgenciaPorcentaje: comisionInicial,
      iva: 19,
      costoOperacional: 0
    });
  };

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Calculadora Inteligente</h3>
              <p className="text-sm text-slate-500">Simula descuentos, comisiones y márgenes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetear}
              className={`${neuro.btnSecondary} p-2`}
              title="Resetear"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleGuardarEscenario}
              className={`${neuro.btnSecondary} p-2`}
              title="Guardar escenario"
            >
              <Save className="w-4 h-4" />
            </button>
            {escenarios.length > 0 && (
              <button
                onClick={() => setShowComparacion(!showComparacion)}
                className={`${neuro.btnSecondary} p-2 ${showComparacion ? 'ring-2 ring-indigo-400' : ''}`}
                title="Comparar escenarios"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            {/* Valor Bruto */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor Bruto
              </label>
              <input
                type="number"
                value={datos.valorBruto}
                onChange={e => setDatos({ ...datos, valorBruto: Number(e.target.value) })}
                className={`${neuro.input} w-full text-xl`}
              />
            </div>

            {/* Descuento */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-600">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Descuento
                </label>
                <div className="flex items-center gap-2">
                  {excedeLimite && (
                    <span className={`${neuro.badge} bg-red-100 text-red-700`}>
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Excede límite ({limiteDescuento}%)
                    </span>
                  )}
                  <span className={`font-bold text-lg ${excedeLimite ? 'text-red-600' : 'text-slate-800'}`}>
                    {datos.descuentoPorcentaje}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={datos.descuentoPorcentaje}
                onChange={e => setDatos({ ...datos, descuentoPorcentaje: Number(e.target.value) })}
                className={neuro.slider}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0%</span>
                <span className="text-amber-500">Límite: {limiteDescuento}%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Comisión Agencia */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-600">
                  <TrendingDown className="w-4 h-4 inline mr-1" />
                  Comisión Agencia
                </label>
                <span className="font-bold text-lg text-slate-800">
                  {datos.comisionAgenciaPorcentaje}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={datos.comisionAgenciaPorcentaje}
                onChange={e => setDatos({ ...datos, comisionAgenciaPorcentaje: Number(e.target.value) })}
                className={neuro.slider}
              />
            </div>

            {/* IVA */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-600">IVA</label>
              <select
                value={datos.iva}
                onChange={e => setDatos({ ...datos, iva: Number(e.target.value) })}
                className={`${neuro.btnSecondary} px-3 py-2 text-sm`}
              >
                <option value={19}>19% (Chile)</option>
                <option value={21}>21% (Argentina)</option>
                <option value={18}>18% (Perú)</option>
                <option value={0}>0% (Exento)</option>
              </select>
            </div>

            {/* Costo Operacional */}
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Costo Operacional (opcional)
              </label>
              <input
                type="number"
                value={datos.costoOperacional || ''}
                onChange={e => setDatos({ ...datos, costoOperacional: Number(e.target.value) || 0 })}
                placeholder="Para calcular margen real"
                className={`${neuro.input} w-full text-base`}
              />
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-3">
            <div className={`${neuro.card} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Monto Descuento</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(resultado.montoDescuento)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Después descuento</span>
                <span className="font-semibold">{formatCurrency(resultado.valorConDescuento)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Comisión Agencia</span>
                <span className="font-semibold text-orange-600">
                  -{formatCurrency(resultado.montoComision)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">IVA ({datos.iva}%)</span>
                <span className="font-semibold text-slate-600">
                  +{formatCurrency(resultado.montoIva)}
                </span>
              </div>
              <hr className="my-3 border-slate-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">VALOR NETO</span>
                <span className="text-xl font-bold text-slate-800">
                  {formatCurrency(resultado.valorNeto)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-slate-700">VALOR TOTAL (con IVA)</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(resultado.valorTotal)}
                </span>
              </div>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`${neuro.card} p-4 text-center`}>
                <TrendingUp className={`w-6 h-6 mx-auto mb-1 ${
                  resultado.rentabilidad > 50 ? 'text-green-500' :
                  resultado.rentabilidad > 30 ? 'text-amber-500' :
                  'text-red-500'
                }`} />
                <p className="text-2xl font-bold text-slate-800">
                  {resultado.rentabilidad.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">Rentabilidad</p>
              </div>
              <div className={`${neuro.card} p-4 text-center`}>
                <DollarSign className="w-6 h-6 mx-auto mb-1 text-indigo-500" />
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(resultado.margenNeto)}
                </p>
                <p className="text-xs text-slate-500">Margen Neto</p>
              </div>
            </div>

            {/* Botón aplicar */}
            <button
              onClick={() => onAplicar?.(resultado)}
              className={`${neuro.btnPrimary} w-full py-3 flex items-center justify-center gap-2`}
            >
              <CheckCircle className="w-5 h-5" />
              Aplicar valores al contrato
            </button>
          </div>
        </div>

        {/* Sugerencia IA */}
        {excedeLimite && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-semibold">
                Sugerencia de Cortex-Flow
              </p>
              <p className="text-sm text-amber-700 mt-1">
                El descuento del {datos.descuentoPorcentaje}% excede tu límite autorizado ({limiteDescuento}%). 
                Necesitarás aprobación de tu supervisor. Considera ofrecer {limiteDescuento}% 
                con valor agregado adicional.
              </p>
            </div>
          </motion.div>
        )}

        {/* Comparación de escenarios */}
        {showComparacion && escenarios.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-slate-800 mb-4">Comparación de escenarios</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-2">Escenario</th>
                    <th className="pb-2 text-right">Descuento</th>
                    <th className="pb-2 text-right">Comisión</th>
                    <th className="pb-2 text-right">Valor Neto</th>
                    <th className="pb-2 text-right">Rentabilidad</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {escenarios.map(esc => (
                    <tr key={esc.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium">{esc.nombre}</td>
                      <td className="py-3 text-right">{esc.datos.descuentoPorcentaje}%</td>
                      <td className="py-3 text-right">{esc.datos.comisionAgenciaPorcentaje}%</td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(esc.resultado.valorNeto)}</td>
                      <td className="py-3 text-right">
                        <span className={`${neuro.badge} ${
                          esc.resultado.rentabilidad > 50 ? 'bg-green-100 text-green-700' :
                          esc.resultado.rentabilidad > 30 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {esc.resultado.rentabilidad.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => setDatos(esc.datos)}
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          Cargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
