/**
 * ?? SILEXAR PULSE - Smart Contract Calculator TIER 0
 * 
 * @description Calculadora inteligente para contratos que permite:
 * - Simular descuentos y comisiones
 * - Comparar escenarios
 * - Calcular m�rgenes
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

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

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
    px-4 py-3 text-right font-semibold
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
  `,
  slider: `
    w-full h-2 bg-[#dfeaff] rounded-full appearance-none cursor-pointer
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:h-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-[#6888ff]
    [&::-webkit-slider-thumb]:shadow-lg
    [&::-webkit-slider-thumb]:cursor-pointer
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

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

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

  // L�mites del usuario (simular)
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
      <div className="px-6 py-4 border-b border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#6888ff]">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#69738c]">Calculadora Inteligente</h3>
              <p className="text-sm text-[#9aa3b8]">Simula descuentos, comisiones y m�rgenes</p>
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
                className={`${neuro.btnSecondary} p-2 ${showComparacion ? 'ring-2 ring-[#6888ff]' : ''}`}
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
              <label className="block text-sm text-[#69738c] mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor Bruto
              </label>
              <input
                type="number"
                aria-label="Valor Bruto"
                value={datos.valorBruto}
                onChange={e => setDatos({ ...datos, valorBruto: Number(e.target.value) })}
                className={`${neuro.input} w-full text-xl`}
              />
            </div>

            {/* Descuento */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-[#69738c]">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Descuento
                </label>
                <div className="flex items-center gap-2">
                  {excedeLimite && (
                    <span className={`${neuro.badge} bg-[#dfeaff] text-[#9aa3b8]`}>
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Excede l�mite ({limiteDescuento}%)
                    </span>
                  )}
                  <span className={`font-bold text-lg ${excedeLimite ? 'text-[#9aa3b8]' : 'text-[#69738c]'}`}>
                    {datos.descuentoPorcentaje}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                aria-label="Descuento en porcentaje"
                value={datos.descuentoPorcentaje}
                onChange={e => setDatos({ ...datos, descuentoPorcentaje: Number(e.target.value) })}
                className={neuro.slider}
              />
              <div className="flex justify-between text-xs text-[#9aa3b8] mt-1">
                <span>0%</span>
                <span className="text-[#6888ff]">L�mite: {limiteDescuento}%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Comisi�n Agencia */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-[#69738c]">
                  <TrendingDown className="w-4 h-4 inline mr-1" />
                  Comisi�n Agencia
                </label>
                <span className="font-bold text-lg text-[#69738c]">
                  {datos.comisionAgenciaPorcentaje}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                aria-label="Comisi�n agencia en porcentaje"
                value={datos.comisionAgenciaPorcentaje}
                onChange={e => setDatos({ ...datos, comisionAgenciaPorcentaje: Number(e.target.value) })}
                className={neuro.slider}
              />
            </div>

            {/* IVA */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#69738c]">IVA</label>
              <select
                value={datos.iva}
                onChange={e => setDatos({ ...datos, iva: Number(e.target.value) })}
                className={`${neuro.btnSecondary} px-3 py-2 text-sm`}
              >
                <option value={19}>19% (Chile)</option>
                <option value={21}>21% (Argentina)</option>
                <option value={18}>18% (Per�)</option>
                <option value={0}>0% (Exento)</option>
              </select>
            </div>

            {/* Costo Operacional */}
            <div>
              <label className="block text-sm text-[#69738c] mb-2">
                Costo Operacional (opcional)
              </label>
              <input
                type="number"
                aria-label="Costo Operacional"
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
                <span className="text-sm text-[#9aa3b8]">Monto Descuento</span>
                <span className="font-semibold text-[#9aa3b8]">
                  -{formatCurrency(resultado.montoDescuento)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9aa3b8]">Despu�s descuento</span>
                <span className="font-semibold">{formatCurrency(resultado.valorConDescuento)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9aa3b8]">Comisi�n Agencia</span>
                <span className="font-semibold text-[#6888ff]">
                  -{formatCurrency(resultado.montoComision)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#9aa3b8]">IVA ({datos.iva}%)</span>
                <span className="font-semibold text-[#69738c]">
                  +{formatCurrency(resultado.montoIva)}
                </span>
              </div>
              <hr className="my-3 border-[#bec8de30]" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#69738c]">VALOR NETO</span>
                <span className="text-xl font-bold text-[#69738c]">
                  {formatCurrency(resultado.valorNeto)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-[#69738c]">VALOR TOTAL (con IVA)</span>
                <span className="text-2xl font-bold text-[#6888ff]">
                  {formatCurrency(resultado.valorTotal)}
                </span>
              </div>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`${neuro.card} p-4 text-center`}>
                <TrendingUp className={`w-6 h-6 mx-auto mb-1 ${
                  resultado.rentabilidad > 50 ? 'text-[#6888ff]' :
                  resultado.rentabilidad > 30 ? 'text-[#6888ff]' :
                  'text-[#9aa3b8]'
                }`} />
                <p className="text-2xl font-bold text-[#69738c]">
                  {resultado.rentabilidad.toFixed(1)}%
                </p>
                <p className="text-xs text-[#9aa3b8]">Rentabilidad</p>
              </div>
              <div className={`${neuro.card} p-4 text-center`}>
                <DollarSign className="w-6 h-6 mx-auto mb-1 text-[#6888ff]" />
                <p className="text-2xl font-bold text-[#69738c]">
                  {formatCurrency(resultado.margenNeto)}
                </p>
                <p className="text-xs text-[#9aa3b8]">Margen Neto</p>
              </div>
            </div>

            {/* Bot�n aplicar */}
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
            className="mt-4 p-4 bg-[#6888ff]/5 border border-[#bec8de30] rounded-2xl flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-[#6888ff] mt-0.5" />
            <div>
              <p className="text-sm text-[#6888ff] font-semibold">
                Sugerencia de Cortex-Flow
              </p>
              <p className="text-sm text-[#6888ff] mt-1">
                El descuento del {datos.descuentoPorcentaje}% excede tu l�mite autorizado ({limiteDescuento}%). 
                Necesitar�s aprobaci�n de tu supervisor. Considera ofrecer {limiteDescuento}% 
                con valor agregado adicional.
              </p>
            </div>
          </motion.div>
        )}

        {/* Comparaci�n de escenarios */}
        {showComparacion && escenarios.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-[#69738c] mb-4">Comparaci�n de escenarios</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9aa3b8] border-b border-[#bec8de30]">
                    <th className="pb-2">Escenario</th>
                    <th className="pb-2 text-right">Descuento</th>
                    <th className="pb-2 text-right">Comisi�n</th>
                    <th className="pb-2 text-right">Valor Neto</th>
                    <th className="pb-2 text-right">Rentabilidad</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {escenarios.map(esc => (
                    <tr key={esc.id} className="border-b border-[#bec8de30]">
                      <td className="py-3 font-medium">{esc.nombre}</td>
                      <td className="py-3 text-right">{esc.datos.descuentoPorcentaje}%</td>
                      <td className="py-3 text-right">{esc.datos.comisionAgenciaPorcentaje}%</td>
                      <td className="py-3 text-right font-semibold">{formatCurrency(esc.resultado.valorNeto)}</td>
                      <td className="py-3 text-right">
                        <span className={`${neuro.badge} ${
                          esc.resultado.rentabilidad > 50 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                          esc.resultado.rentabilidad > 30 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                          'bg-[#dfeaff] text-[#9aa3b8]'
                        }`}>
                          {esc.resultado.rentabilidad.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => setDatos(esc.datos)}
                          className="text-[#6888ff] hover:underline text-xs"
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
