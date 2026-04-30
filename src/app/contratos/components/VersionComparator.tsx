/**
 * 🔄 SILEXAR PULSE - Contract Version Comparator TIER 0
 * 
 * @description Comparador lado a lado de versiones de contrato.
 * Muestra cambios entre versiones con diff visual.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitCompare,
  ArrowRight,
  Plus,
  Minus,
  Edit,
  ChevronDown,
  Calendar,
  User,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface VersionContrato {
  id: string;
  version: number;
  fechaCreacion: Date;
  creadoPor: string;
  motivoCambio?: string;
  datos: DatosContrato;
}

interface DatosContrato {
  estado: string;
  valorBruto: number;
  valorNeto: number;
  descuento: number;
  condicionesPago: string;
  diasCredito: number;
  fechaInicio: string;
  fechaFin: string;
  lineas: LineaContrato[];
  clausulas: string[];
  observaciones?: string;
}

interface LineaContrato {
  id: string;
  medio: string;
  programa?: string;
  unidades: number;
  valorUnitario: number;
  valorTotal: number;
}

interface CambioDiff {
  campo: string;
  label: string;
  tipo: 'agregado' | 'eliminado' | 'modificado' | 'sin_cambio';
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  importancia: 'baja' | 'media' | 'alta' | 'critica';
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockVersiones: VersionContrato[] = [
  {
    id: 'v-003',
    version: 3,
    fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    creadoPor: 'Carlos Mendoza',
    motivoCambio: 'Ajuste de descuento aprobado por gerencia',
    datos: {
      estado: 'APROBADO',
      valorBruto: 100000000,
      valorNeto: 82000000,
      descuento: 18,
      condicionesPago: 'CREDITO',
      diasCredito: 30,
      fechaInicio: '2025-01-01',
      fechaFin: '2025-12-31',
      lineas: [
        { id: 'l-1', medio: 'Radio FM', programa: 'Mañanas Felices', unidades: 100, valorUnitario: 500000, valorTotal: 50000000 },
        { id: 'l-2', medio: 'Digital', programa: 'Banner Home', unidades: 30, valorUnitario: 1000000, valorTotal: 30000000 },
        { id: 'l-3', medio: 'TV', programa: 'Noticiero Central', unidades: 10, valorUnitario: 2000000, valorTotal: 20000000 }
      ],
      clausulas: ['EXCLUSIVIDAD', 'RENOVACION_AUTOMATICA', 'PENALIDAD_CANCELACION'],
      observaciones: 'Cliente estratégico, descuento especial autorizado'
    }
  },
  {
    id: 'v-002',
    version: 2,
    fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    creadoPor: 'Carlos Mendoza',
    motivoCambio: 'Agregada línea de TV según solicitud cliente',
    datos: {
      estado: 'EN_REVISION',
      valorBruto: 80000000,
      valorNeto: 72000000,
      descuento: 10,
      condicionesPago: 'CREDITO',
      diasCredito: 30,
      fechaInicio: '2025-01-01',
      fechaFin: '2025-12-31',
      lineas: [
        { id: 'l-1', medio: 'Radio FM', programa: 'Mañanas Felices', unidades: 100, valorUnitario: 500000, valorTotal: 50000000 },
        { id: 'l-2', medio: 'Digital', programa: 'Banner Home', unidades: 30, valorUnitario: 1000000, valorTotal: 30000000 }
      ],
      clausulas: ['EXCLUSIVIDAD', 'RENOVACION_AUTOMATICA'],
      observaciones: ''
    }
  },
  {
    id: 'v-001',
    version: 1,
    fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    creadoPor: 'Carlos Mendoza',
    motivoCambio: 'Versión inicial',
    datos: {
      estado: 'BORRADOR',
      valorBruto: 50000000,
      valorNeto: 50000000,
      descuento: 0,
      condicionesPago: 'CREDITO',
      diasCredito: 30,
      fechaInicio: '2025-01-01',
      fechaFin: '2025-06-30',
      lineas: [
        { id: 'l-1', medio: 'Radio FM', programa: 'Mañanas Felices', unidades: 100, valorUnitario: 500000, valorTotal: 50000000 }
      ],
      clausulas: ['EXCLUSIVIDAD'],
      observaciones: ''
    }
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
};

const compararVersiones = (antigua: DatosContrato, nueva: DatosContrato): CambioDiff[] => {
  const cambios: CambioDiff[] = [];

  // Estado
  if (antigua.estado !== nueva.estado) {
    cambios.push({
      campo: 'estado',
      label: 'Estado',
      tipo: 'modificado',
      valorAnterior: antigua.estado,
      valorNuevo: nueva.estado,
      importancia: 'alta'
    });
  }

  // Valores
  if (antigua.valorBruto !== nueva.valorBruto) {
    cambios.push({
      campo: 'valorBruto',
      label: 'Valor Bruto',
      tipo: 'modificado',
      valorAnterior: antigua.valorBruto,
      valorNuevo: nueva.valorBruto,
      importancia: 'critica'
    });
  }

  if (antigua.descuento !== nueva.descuento) {
    cambios.push({
      campo: 'descuento',
      label: 'Descuento',
      tipo: 'modificado',
      valorAnterior: `${antigua.descuento}%`,
      valorNuevo: `${nueva.descuento}%`,
      importancia: 'critica'
    });
  }

  if (antigua.valorNeto !== nueva.valorNeto) {
    cambios.push({
      campo: 'valorNeto',
      label: 'Valor Neto',
      tipo: 'modificado',
      valorAnterior: antigua.valorNeto,
      valorNuevo: nueva.valorNeto,
      importancia: 'critica'
    });
  }

  // Fechas
  if (antigua.fechaFin !== nueva.fechaFin) {
    cambios.push({
      campo: 'fechaFin',
      label: 'Fecha Fin',
      tipo: 'modificado',
      valorAnterior: antigua.fechaFin,
      valorNuevo: nueva.fechaFin,
      importancia: 'alta'
    });
  }

  // Líneas
  const lineasNuevas = nueva.lineas.filter(nl => !antigua.lineas.some(al => al.id === nl.id));
  const lineasEliminadas = antigua.lineas.filter(al => !nueva.lineas.some(nl => nl.id === al.id));

  lineasNuevas.forEach(l => {
    cambios.push({
      campo: `linea_${l.id}`,
      label: `Línea: ${l.medio}`,
      tipo: 'agregado',
      valorNuevo: `${l.unidades} unidades - ${formatCurrency(l.valorTotal)}`,
      importancia: 'alta'
    });
  });

  lineasEliminadas.forEach(l => {
    cambios.push({
      campo: `linea_${l.id}`,
      label: `Línea: ${l.medio}`,
      tipo: 'eliminado',
      valorAnterior: `${l.unidades} unidades - ${formatCurrency(l.valorTotal)}`,
      importancia: 'alta'
    });
  });

  // Cláusulas
  const clausulasNuevas = nueva.clausulas.filter(c => !antigua.clausulas.includes(c));
  const clausulasEliminadas = antigua.clausulas.filter(c => !nueva.clausulas.includes(c));

  clausulasNuevas.forEach(c => {
    cambios.push({
      campo: `clausula_${c}`,
      label: 'Cláusula agregada',
      tipo: 'agregado',
      valorNuevo: c,
      importancia: 'media'
    });
  });

  clausulasEliminadas.forEach(c => {
    cambios.push({
      campo: `clausula_${c}`,
      label: 'Cláusula eliminada',
      tipo: 'eliminado',
      valorAnterior: c,
      importancia: 'media'
    });
  });

  return cambios;
};

const getTipoBadge = (tipo: CambioDiff['tipo']) => {
  switch (tipo) {
    case 'agregado': return 'bg-[#6888ff]/10 text-[#6888ff]';
    case 'eliminado': return 'bg-[#dfeaff] text-[#9aa3b8]';
    case 'modificado': return 'bg-[#6888ff]/10 text-[#6888ff]';
    default: return 'bg-[#dfeaff] text-[#69738c]';
  }
};

const getTipoIcon = (tipo: CambioDiff['tipo']) => {
  switch (tipo) {
    case 'agregado': return <Plus className="w-4 h-4" />;
    case 'eliminado': return <Minus className="w-4 h-4" />;
    case 'modificado': return <Edit className="w-4 h-4" />;
    default: return <CheckCircle className="w-4 h-4" />;
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function VersionComparator({
  contratoId
}: {
  contratoId: string;
}) {
  const [versiones] = useState<VersionContrato[]>(mockVersiones);
  const [versionIzq, setVersionIzq] = useState<number>(2);
  const [versionDer, setVersionDer] = useState<number>(3);

  const versionAntigua = versiones.find(v => v.version === versionIzq);
  const versionNueva = versiones.find(v => v.version === versionDer);

  const cambios = versionAntigua && versionNueva 
    ? compararVersiones(versionAntigua.datos, versionNueva.datos)
    : [];

  const cambiosCriticos = cambios.filter(c => c.importancia === 'critica').length;
  const cambiosAltos = cambios.filter(c => c.importancia === 'alta').length;

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#6888ff]">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#69738c]">Comparador de Versiones</h3>
              <p className="text-sm text-[#9aa3b8]">
                {cambios.length} cambios detectados
                {cambiosCriticos > 0 && ` • ${cambiosCriticos} críticos`}
                {cambiosAltos > 0 && ` • ${cambiosAltos} importantes`}
              </p>
            </div>
          </div>

          {/* Selectores de versión */}
          <div className="flex items-center gap-4">
            <select
              value={versionIzq}
              onChange={e => setVersionIzq(Number(e.target.value))}
              className={`${neuro.btnSecondary} px-4 py-2`}
            >
              {versiones.map(v => (
                <option key={v.id} value={v.version}>
                  v{v.version} - {v.fechaCreacion.toLocaleDateString()}
                </option>
              ))}
            </select>
            
            <ArrowRight className="w-5 h-5 text-[#9aa3b8]" />
            
            <select
              value={versionDer}
              onChange={e => setVersionDer(Number(e.target.value))}
              className={`${neuro.btnSecondary} px-4 py-2`}
            >
              {versiones.map(v => (
                <option key={v.id} value={v.version}>
                  v{v.version} - {v.fechaCreacion.toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparación lado a lado */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Versión antigua */}
          <div className={`${neuro.card} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`${neuro.badge} bg-[#dfeaff] text-[#69738c]`}>
                Versión {versionIzq}
              </span>
              <div className="text-sm text-[#9aa3b8]">
                <User className="w-4 h-4 inline mr-1" />
                {versionAntigua?.creadoPor}
              </div>
            </div>
            
            {versionAntigua && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Estado</span>
                  <span className="font-semibold">{versionAntigua.datos.estado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Valor Bruto</span>
                  <span className="font-semibold">{formatCurrency(versionAntigua.datos.valorBruto)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Descuento</span>
                  <span className="font-semibold">{versionAntigua.datos.descuento}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Valor Neto</span>
                  <span className="font-semibold">{formatCurrency(versionAntigua.datos.valorNeto)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Líneas</span>
                  <span className="font-semibold">{versionAntigua.datos.lineas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Cláusulas</span>
                  <span className="font-semibold">{versionAntigua.datos.clausulas.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Versión nueva */}
          <div className={`${neuro.card} p-4 ring-2 ring-[#6888ff]`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`${neuro.badge} bg-[#dfeaff] text-[#6888ff]`}>
                Versión {versionDer} (Actual)
              </span>
              <div className="text-sm text-[#9aa3b8]">
                <User className="w-4 h-4 inline mr-1" />
                {versionNueva?.creadoPor}
              </div>
            </div>
            
            {versionNueva && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Estado</span>
                  <span className={`font-semibold ${versionAntigua?.datos.estado !== versionNueva.datos.estado ? 'text-[#6888ff]' : ''}`}>
                    {versionNueva.datos.estado}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Valor Bruto</span>
                  <span className={`font-semibold ${versionAntigua?.datos.valorBruto !== versionNueva.datos.valorBruto ? 'text-[#6888ff]' : ''}`}>
                    {formatCurrency(versionNueva.datos.valorBruto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Descuento</span>
                  <span className={`font-semibold ${versionAntigua?.datos.descuento !== versionNueva.datos.descuento ? 'text-[#9aa3b8]' : ''}`}>
                    {versionNueva.datos.descuento}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Valor Neto</span>
                  <span className={`font-semibold ${versionAntigua?.datos.valorNeto !== versionNueva.datos.valorNeto ? 'text-[#6888ff]' : ''}`}>
                    {formatCurrency(versionNueva.datos.valorNeto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Líneas</span>
                  <span className={`font-semibold ${versionAntigua?.datos.lineas.length !== versionNueva.datos.lineas.length ? 'text-[#6888ff]' : ''}`}>
                    {versionNueva.datos.lineas.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa3b8]">Cláusulas</span>
                  <span className={`font-semibold ${versionAntigua?.datos.clausulas.length !== versionNueva.datos.clausulas.length ? 'text-[#6888ff]' : ''}`}>
                    {versionNueva.datos.clausulas.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de cambios */}
        <div className="mt-6">
          <h4 className="font-bold text-[#69738c] mb-4">Cambios detectados</h4>
          
          <div className="space-y-3">
            {cambios.map((cambio, idx) => (
              <motion.div
                key={cambio.campo}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`${neuro.card} p-4 flex items-center gap-4 ${
                  cambio.importancia === 'critica' ? 'ring-2 ring-red-300' : ''
                }`}
              >
                <div className={`p-2 rounded-xl ${getTipoBadge(cambio.tipo)}`}>
                  {getTipoIcon(cambio.tipo)}
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-[#69738c]">{cambio.label}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    {!!cambio.valorAnterior && (
                      <span className="text-[#9aa3b8] line-through">
                        {typeof cambio.valorAnterior === 'number'
                          ? formatCurrency(cambio.valorAnterior)
                          : String(cambio.valorAnterior)}
                      </span>
                    )}
                    {!!cambio.valorAnterior && !!cambio.valorNuevo && (
                      <ArrowRight className="w-4 h-4 text-[#9aa3b8]" />
                    )}
                    {!!cambio.valorNuevo && (
                      <span className="text-[#6888ff] font-semibold">
                        {typeof cambio.valorNuevo === 'number'
                          ? formatCurrency(cambio.valorNuevo)
                          : String(cambio.valorNuevo)}
                      </span>
                    )}
                  </div>
                </div>

                <span className={`${neuro.badge} ${
                  cambio.importancia === 'critica' ? 'bg-[#dfeaff] text-[#9aa3b8]' :
                  cambio.importancia === 'alta' ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                  cambio.importancia === 'media' ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                  'bg-[#dfeaff] text-[#69738c]'
                }`}>
                  {cambio.importancia}
                </span>
              </motion.div>
            ))}
          </div>

          {cambios.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-[#6888ff] mx-auto mb-3" />
              <p className="text-[#69738c]">No hay cambios entre estas versiones</p>
            </div>
          )}
        </div>

        {/* Motivo del cambio */}
        {versionNueva?.motivoCambio && (
          <div className="mt-6 p-4 bg-[#dfeaff] rounded-2xl">
            <p className="text-sm text-[#6888ff]">
              <strong>Motivo del cambio:</strong> {versionNueva.motivoCambio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
