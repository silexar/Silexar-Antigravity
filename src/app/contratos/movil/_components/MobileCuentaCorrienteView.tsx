/**
 * 🏦 MOBILE: Cuenta Corriente View
 * 
 * Balance y movimientos de cuenta corriente del cliente.
 * Paridad con desktop: contratos/cuenta-corriente/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  ArrowUpRight, ArrowDownLeft, DollarSign,
} from 'lucide-react';
import { formatCurrency } from '../../_shared/useContratos';

interface Movimiento {
  id: string;
  fecha: string;
  concepto: string;
  tipo: 'ingreso' | 'egreso' | 'ajuste';
  monto: number;
  saldoAcumulado: number;
  contrato?: string;
  factura?: string;
}

const MOVIMIENTOS_MOCK: Movimiento[] = [
  { id: 'mv-1', fecha: '2025-02-27', concepto: 'Pago Factura F-2025-0234', tipo: 'ingreso', monto: 12500000, saldoAcumulado: 145200000, contrato: 'CTR-0045', factura: 'F-0234' },
  { id: 'mv-2', fecha: '2025-02-25', concepto: 'Nota de crédito NC-0089', tipo: 'egreso', monto: 2300000, saldoAcumulado: 132700000, factura: 'NC-0089' },
  { id: 'mv-3', fecha: '2025-02-22', concepto: 'Pago Factura F-2025-0228', tipo: 'ingreso', monto: 8900000, saldoAcumulado: 135000000, contrato: 'CTR-0067', factura: 'F-0228' },
  { id: 'mv-4', fecha: '2025-02-20', concepto: 'Ajuste por diferencia cambiaria', tipo: 'ajuste', monto: 450000, saldoAcumulado: 126100000 },
  { id: 'mv-5', fecha: '2025-02-18', concepto: 'Pago Parcial Banco Chile', tipo: 'ingreso', monto: 25000000, saldoAcumulado: 125650000, contrato: 'CTR-0034' },
  { id: 'mv-6', fecha: '2025-02-15', concepto: 'Pago Factura F-2025-0210', tipo: 'ingreso', monto: 6700000, saldoAcumulado: 100650000, contrato: 'CTR-0089', factura: 'F-0210' },
];

type FiltroMov = 'todos' | 'ingreso' | 'egreso' | 'ajuste';

export function MobileCuentaCorrienteView() {
  const [filtro, setFiltro] = useState<FiltroMov>('todos');

  const filtered = MOVIMIENTOS_MOCK.filter(m => filtro === 'todos' || m.tipo === filtro);
  const saldoActual = MOVIMIENTOS_MOCK[0]?.saldoAcumulado || 0;
  const ingresos = MOVIMIENTOS_MOCK.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  const egresos = MOVIMIENTOS_MOCK.filter(m => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);

  return (
    <div className="space-y-5">
      {/* BALANCE */}
      <div className="bg-gradient-to-br from-[#6888ff] to-teal-700 rounded-2xl p-5 text-white shadow-xl">
        <p className="text-xs font-bold text-[#6888ff] uppercase tracking-widest">Saldo Cuenta Corriente</p>
        <p className="text-3xl font-black mt-2">{formatCurrency(saldoActual)}</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#dfeaff]/10 rounded-xl p-3">
            <div className="flex items-center gap-1 text-[#6888ff]">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-[10px] font-bold">Ingresos</span>
            </div>
            <p className="text-lg font-black mt-1">{formatCurrency(ingresos)}</p>
          </div>
          <div className="bg-[#dfeaff]/10 rounded-xl p-3">
            <div className="flex items-center gap-1 text-[#9aa3b8]">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-[10px] font-bold">Egresos</span>
            </div>
            <p className="text-lg font-black mt-1">{formatCurrency(egresos)}</p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        {(['todos', 'ingreso', 'egreso', 'ajuste'] as FiltroMov[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filtro === f ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8] border border-[#bec8de30]'
            }`}>
            {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* MOVIMIENTOS */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest px-1">Movimientos</p>
        {filtered.map(mov => (
          <div key={mov.id} className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              mov.tipo === 'ingreso' ? 'bg-[#6888ff]/10 text-[#6888ff]' :
              mov.tipo === 'egreso' ? 'bg-[#dfeaff] text-[#9aa3b8]' :
              'bg-[#6888ff]/10 text-[#6888ff]'
            }`}>
              {mov.tipo === 'ingreso' ? <ArrowDownLeft className="w-5 h-5" /> :
               mov.tipo === 'egreso' ? <ArrowUpRight className="w-5 h-5" /> :
               <DollarSign className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#69738c] text-sm truncate">{mov.concepto}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#9aa3b8]">{mov.fecha}</span>
                {mov.contrato && <span className="text-[10px] text-[#6888ff] font-bold">{mov.contrato}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-black ${mov.tipo === 'ingreso' ? 'text-[#6888ff]' : mov.tipo === 'egreso' ? 'text-[#9aa3b8]' : 'text-[#6888ff]'}`}>
                {mov.tipo === 'egreso' ? '-' : '+'}{formatCurrency(mov.monto)}
              </p>
              <p className="text-[9px] text-[#9aa3b8]">Saldo: {formatCurrency(mov.saldoAcumulado)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
