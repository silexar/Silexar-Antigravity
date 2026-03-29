/**
 * 📅 Grid Distribución Semanal - Cuñas por Día TIER0
 * 
 * Tabla interactiva L-M-M-J-V-S-D para configurar:
 * - Cuñas por día de la semana
 * - Cuñas bonificadas por día
 * - Totales automáticos
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, Gift, Calendar, Calculator, RotateCcw, Copy, Zap } from 'lucide-react';

// ==================== INTERFACES ====================

interface DistribucionSemanal {
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  domingo: number;
}

interface GridDistribucionProps {
  cunasPorDia: DistribucionSemanal;
  cunasBonificadas: DistribucionSemanal;
  onChange: (tipo: 'cunas' | 'bonificadas', data: DistribucionSemanal) => void;
  fechaInicio?: string;
  fechaFin?: string;
  valorPorCuna?: number;
}

const DIAS = [
  { key: 'lunes', label: 'L', fullLabel: 'Lunes' },
  { key: 'martes', label: 'M', fullLabel: 'Martes' },
  { key: 'miercoles', label: 'M', fullLabel: 'Miércoles' },
  { key: 'jueves', label: 'J', fullLabel: 'Jueves' },
  { key: 'viernes', label: 'V', fullLabel: 'Viernes' },
  { key: 'sabado', label: 'S', fullLabel: 'Sábado' },
  { key: 'domingo', label: 'D', fullLabel: 'Domingo' },
] as const;

// ==================== COMPONENTE PRINCIPAL ====================

export function GridDistribucionSemanal({
  cunasPorDia: initialCunas,
  cunasBonificadas: initialBonificadas,
  onChange,
  fechaInicio = '11/08/2025',
  fechaFin = '26/08/2025',
  valorPorCuna = 85000,
}: GridDistribucionProps) {
  const [cunas, setCunas] = useState<DistribucionSemanal>(initialCunas || {
    lunes: 5, martes: 5, miercoles: 5, jueves: 5, viernes: 5, sabado: 0, domingo: 0
  });

  const [bonificadas, setBonificadas] = useState<DistribucionSemanal>(initialBonificadas || {
    lunes: 1, martes: 1, miercoles: 1, jueves: 1, viernes: 1, sabado: 0, domingo: 0
  });

  const handleCunaChange = (dia: keyof DistribucionSemanal, delta: number) => {
    const newValue = Math.max(0, Math.min(99, cunas[dia] + delta));
    const newCunas = { ...cunas, [dia]: newValue };
    setCunas(newCunas);
    onChange('cunas', newCunas);
  };

  const handleBonificadaChange = (dia: keyof DistribucionSemanal, delta: number) => {
    const newValue = Math.max(0, Math.min(99, bonificadas[dia] + delta));
    const newBonificadas = { ...bonificadas, [dia]: newValue };
    setBonificadas(newBonificadas);
    onChange('bonificadas', newBonificadas);
  };

  const handleInputChange = (tipo: 'cunas' | 'bonificadas', dia: keyof DistribucionSemanal, value: string) => {
    const numValue = Math.max(0, Math.min(99, parseInt(value) || 0));
    if (tipo === 'cunas') {
      const newCunas = { ...cunas, [dia]: numValue };
      setCunas(newCunas);
      onChange('cunas', newCunas);
    } else {
      const newBonificadas = { ...bonificadas, [dia]: numValue };
      setBonificadas(newBonificadas);
      onChange('bonificadas', newBonificadas);
    }
  };

  // Calcular totales
  const totals = useMemo(() => {
    const totalCunas = Object.values(cunas).reduce((a, b) => a + b, 0);
    const totalBonificadas = Object.values(bonificadas).reduce((a, b) => a + b, 0);
    return {
      cunasSemana: totalCunas,
      bonificadasSemana: totalBonificadas,
      totalSpots: totalCunas + totalBonificadas,
      valorTotal: totalCunas * valorPorCuna,
    };
  }, [cunas, bonificadas, valorPorCuna]);

  // Acciones rápidas
  const aplicarEntreSemana = (valor: number, tipo: 'cunas' | 'bonificadas') => {
    const newData = {
      lunes: valor, martes: valor, miercoles: valor, jueves: valor, viernes: valor,
      sabado: 0, domingo: 0
    };
    if (tipo === 'cunas') {
      setCunas(newData);
      onChange('cunas', newData);
    } else {
      setBonificadas(newData);
      onChange('bonificadas', newData);
    }
  };

  const aplicarTodosLosDias = (valor: number, tipo: 'cunas' | 'bonificadas') => {
    const newData = {
      lunes: valor, martes: valor, miercoles: valor, jueves: valor, 
      viernes: valor, sabado: valor, domingo: valor
    };
    if (tipo === 'cunas') {
      setCunas(newData);
      onChange('cunas', newData);
    } else {
      setBonificadas(newData);
      onChange('bonificadas', newData);
    }
  };

  const resetear = () => {
    const zeroes = { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0, sabado: 0, domingo: 0 };
    setCunas(zeroes);
    setBonificadas(zeroes);
    onChange('cunas', zeroes);
    onChange('bonificadas', zeroes);
  };

  return (
    <div className="space-y-4">
      {/* Header con período */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            📊 DISTRIBUCIÓN SEMANAL DE CUÑAS
          </h4>
          <p className="text-sm text-gray-500">Período: {fechaInicio} - {fechaFin}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => aplicarEntreSemana(5, 'cunas')} className="text-xs gap-1">
            <Copy className="w-3 h-3" />
            L-V: 5
          </Button>
          <Button variant="outline" size="sm" onClick={resetear} className="text-xs gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Grid Principal: Cuñas por día */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-100 text-blue-700">📊 Cuñas por día</Badge>
          <span className="text-xs text-gray-500">🔢 ↑↓ para ajustar</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DIAS.map(({ key, label, fullLabel }) => (
            <div key={key} className="text-center">
              <div className="text-xs font-bold text-gray-500 mb-1" title={fullLabel}>
                {label}
              </div>
              <div className="bg-slate-50 rounded-lg p-2 border hover:border-blue-300 transition-colors">
                <button
                  onClick={() => handleCunaChange(key, 1)}
                  className="w-full text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 mx-auto" />
                </button>
                <Input
                  type="text"
                  value={cunas[key]}
                  onChange={(e) => handleInputChange('cunas', key, e.target.value)}
                  className="w-full text-center font-bold text-lg h-10 border-0 bg-transparent p-0"
                />
                <button
                  onClick={() => handleCunaChange(key, -1)}
                  className="w-full text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total cuñas */}
        <div className="mt-3 flex justify-end">
          <Badge variant="outline" className="text-blue-600">
            Total: {totals.cunasSemana} cuñas/semana
          </Badge>
        </div>
      </Card>

      {/* Grid Bonificadas */}
      <Card className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-100">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-green-100 text-green-700 gap-1">
            <Gift className="w-3 h-3" />
            🎁 Cuñas Bonificadas
          </Badge>
          <span className="text-xs text-gray-500">Spots gratis por día</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DIAS.map(({ key, label, fullLabel }) => (
            <div key={key} className="text-center">
              <div className="text-xs font-bold text-gray-500 mb-1" title={fullLabel}>
                {label}
              </div>
              <div className="bg-white/80 rounded-lg p-2 border border-green-100 hover:border-green-300 transition-colors">
                <button
                  onClick={() => handleBonificadaChange(key, 1)}
                  className="w-full text-gray-400 hover:text-green-600 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 mx-auto" />
                </button>
                <Input
                  type="text"
                  value={bonificadas[key]}
                  onChange={(e) => handleInputChange('bonificadas', key, e.target.value)}
                  className="w-full text-center font-bold text-lg h-10 border-0 bg-transparent p-0 text-green-700"
                />
                <button
                  onClick={() => handleBonificadaChange(key, -1)}
                  className="w-full text-gray-400 hover:text-green-600 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total bonificadas */}
        <div className="mt-3 flex justify-end">
          <Badge variant="outline" className="text-green-600 border-green-200">
            🎁 Total: {totals.bonificadasSemana} bonificadas/semana
          </Badge>
        </div>
      </Card>

      {/* Resumen Financiero */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
        <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-600" />
          🧮 RESUMEN LÍNEA
        </h5>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{totals.cunasSemana}</p>
            <p className="text-xs text-gray-500">Cuñas/Semana</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{totals.bonificadasSemana}</p>
            <p className="text-xs text-gray-500">Bonificadas/Semana</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{totals.totalSpots}</p>
            <p className="text-xs text-gray-500">Total Spots</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">
              ${(totals.valorTotal / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500">Valor Línea</p>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          └─ 🧮 Valor por cuña: ${valorPorCuna.toLocaleString()} × {totals.cunasSemana} = ${totals.valorTotal.toLocaleString()}
        </div>
      </Card>

      {/* Acciones rápidas adicionales */}
      <div className="flex gap-2 justify-center">
        <Button variant="ghost" size="sm" onClick={() => aplicarEntreSemana(3, 'cunas')} className="text-xs">
          <Zap className="w-3 h-3 mr-1" />
          L-V: 3 cuñas
        </Button>
        <Button variant="ghost" size="sm" onClick={() => aplicarTodosLosDias(2, 'cunas')} className="text-xs">
          <Zap className="w-3 h-3 mr-1" />
          Todos: 2 cuñas
        </Button>
        <Button variant="ghost" size="sm" onClick={() => aplicarEntreSemana(1, 'bonificadas')} className="text-xs text-green-600">
          <Gift className="w-3 h-3 mr-1" />
          L-V: 1 bonif
        </Button>
      </div>
    </div>
  );
}

export default GridDistribucionSemanal;
