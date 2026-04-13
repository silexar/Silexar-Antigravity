"use client";

import React from 'react';

export default function VistaOperativaTable({ onSelectRow }: { onSelectRow?: (id: string) => void }) {
  const mockData = [
    {
      id: "1",
      fecha: "20/08/2025",
      hora: "14:23:45",
      estado: "COMPLETADO",
      cumplimiento: 98.7,
      emisora: "Radio Corazón (T13 Radio)",
      archivo: "radio_corazon_20250820.csv",
      registros: "2,847",
      sync: "AUTOMÁTICO",
      emitidos: "2,824 (99.2%)",
      noEmitidos: "23 (0.8%)",
      recuperadosAuto: "20",
      pendientesManual: "3",
      fallaTecnica: "15",
      errorTiming: "5",
      cambioProg: "3",
      proximaVal: "16:00",
      clientesAfectados: "8",
      valorRecuperado: "$450K",
      riesgo: "BAJO",
      notificados: true
    },
    {
        id: "2",
        fecha: "19/08/2025",
        hora: "23:55:12",
        estado: "COMPLETADO",
        cumplimiento: 99.1,
        emisora: "Play FM",
        archivo: "play_fm_20250819.xml",
        registros: "1,542",
        sync: "AUTOMÁTICO",
        emitidos: "1,530 (99.5%)",
        noEmitidos: "12 (0.5%)",
        recuperadosAuto: "12",
        pendientesManual: "0",
        fallaTecnica: "2",
        errorTiming: "8",
        cambioProg: "2",
        proximaVal: "FINALIZADO",
        clientesAfectados: "4",
        valorRecuperado: "$120K",
        riesgo: "NULO",
        notificados: true
      }
  ];

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[160px]">Fecha / Estado</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[180px]">Emisoras / Archivos</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[200px]">Resultados</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[220px]">Discrepancias</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[180px]">Impacto Comercial</th>
            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[160px]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((row) => (
            <tr 
              key={row.id} 
              onClick={() => onSelectRow?.(row.id)}
              className="border-b border-slate-100/50 hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              {/* COL 1: FECHA / ESTADO */}
              <td className="p-4 align-top">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>📅</span> {row.fecha}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium">🕐 {row.hora}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-200 shadow-sm">✅ {row.estado}</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">🎯 {row.cumplimiento}%</span>
                  </div>
                </div>
              </td>

              {/* COL 2: EMISORAS / ARCHIVOS */}
              <td className="p-4 align-top">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>📻</span> {row.emisora}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[160px] font-medium">📁 {row.archivo}</div>
                  <div className="text-[10px] text-slate-400 mt-1">📊 {row.registros} reg. • 14:20</div>
                  <div className="text-[9px] font-bold text-indigo-600 mt-1 uppercase">🔄 Auto-sync: ON</div>
                </div>
              </td>

              {/* COL 3: RESULTADOS */}
              <td className="p-4 align-top">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">✅ Emitidos:</span>
                    <span className="text-emerald-600 font-bold">{row.emitidos}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">❌ No emitidos:</span>
                    <span className="text-rose-500 font-bold">{row.noEmitidos}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">🔄 Recuperados auto:</span>
                    <span className="text-indigo-600 font-bold">{row.recuperadosAuto}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">👤 Pendientes:</span>
                    <span className="text-amber-500 font-bold">{row.pendientesManual}</span>
                  </div>
                </div>
              </td>

              {/* COL 4: DISCREPANCIAS */}
              <td className="p-4 align-top">
                <div className="space-y-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-inner">
                  <div className="text-[10px] flex justify-between">
                    <span className="text-slate-500 font-medium">🔧 Falla técnica:</span>
                    <span className="text-slate-700 font-bold">{row.fallaTecnica}</span>
                  </div>
                  <div className="text-[10px] flex justify-between">
                    <span className="text-slate-500 font-medium">⏰ Timing:</span>
                    <span className="text-slate-700 font-bold">{row.errorTiming}</span>
                  </div>
                  <div className="text-[10px] flex justify-between">
                    <span className="text-slate-500 font-medium">📻 Cambio Prog:</span>
                    <span className="text-slate-700 font-bold">{row.cambioProg}</span>
                  </div>
                  <div className="pt-1 mt-1 border-t border-slate-200 text-[9px] text-indigo-600 font-black italic">
                    🎯 Próx. validación: {row.proximaVal}
                  </div>
                </div>
              </td>

              {/* COL 5: IMPACTO COMERCIAL */}
              <td className="p-4 align-top">
                <div className="space-y-1.5">
                  <div className="text-[10px] flex justify-between">
                    <span className="text-slate-500 font-medium">🏢 Clientes:</span>
                    <span className="text-slate-700 font-bold">{row.clientesAfectados}</span>
                  </div>
                  <div className="text-[10px] flex justify-between items-center">
                    <span className="text-slate-500 font-medium">💰 Recuperado:</span>
                    <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-100 px-1.5 rounded shadow-sm">{row.valorRecuperado}</span>
                  </div>
                  <div className="text-[10px] flex justify-between">
                    <span className="text-slate-500 font-medium">⚠️ Riesgo:</span>
                    <span className={`font-bold ${row.riesgo === 'BAJO' || row.riesgo === 'NULO' ? 'text-emerald-600' : 'text-amber-500'}`}>{row.riesgo}</span>
                  </div>
                  <div className="text-[9px] flex items-center gap-1 mt-1">
                    <span className="text-slate-500 font-medium">📧 Notif:</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded-sm border border-emerald-100">✅ Ejecutivos</span>
                  </div>
                </div>
              </td>

              {/* COL 6: ACCIONES (GRILLA 3x3) */}
              <td className="p-4 align-top">
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { icon: '👁️', label: 'Ver Detalle', color: 'slate' },
                    { icon: '🔄', label: 'Re-procesar', color: 'blue' },
                    { icon: '📊', label: 'Analytics', color: 'indigo' },
                    { icon: '📧', label: 'Notificar', color: 'amber' },
                    { icon: '📄', label: 'Exportar', color: 'emerald' },
                    { icon: '⚙️', label: 'Configurar', color: 'slate' },
                    { icon: '🚨', label: 'Alertar', color: 'red' },
                    { icon: '📈', label: 'Tendencias', color: 'cyan' },
                    { icon: '🔧', label: 'Diagnosticar', color: 'orange' }
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      title={btn.label}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-xs transition-all hover:scale-110 active:scale-90"
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
