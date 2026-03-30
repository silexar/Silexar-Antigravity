import React from 'react';
import { 
  BarChart4, ArrowUpRight, TrendingDown, Minus, Target,
  X, Download, Share2, Lightbulb, Users, FileText, AlertTriangle
} from 'lucide-react';

export function AnalyticsUtilizacionModal({ onClose }: { onClose: () => void }) {
  const matrizUtilizacion = [
    { prop: 'Tipo Pedido', cont: '98.7%', camp: '94.2%', cli: 'N/A', rep: '89.1%', glob: '94.0%' },
    { prop: 'Industria Cliente', cont: '89.3%', camp: '87.1%', cli: '92.4%', rep: '91.3%', glob: '90.0%' },
    { prop: 'Tipo Cliente', cont: '76.4%', camp: '78.9%', cli: '98.1%', rep: '82.3%', glob: '83.9%' },
    { prop: 'Estado Proyecto', cont: '23.1%', camp: '45.7%', cli: 'N/A', rep: '34.2%', glob: '34.3%', alert: true },
    { prop: 'Prioridad Comercial', cont: '18.7%', camp: '52.3%', cli: '12.1%', rep: '28.9%', glob: '28.0%', alert: true },
    { prop: 'Centro Costo', cont: '67.8%', camp: '23.4%', cli: 'N/A', rep: '89.7%', glob: '60.3%' },
    { prop: 'Formato Duración', cont: 'N/A', camp: '91.2%', cli: 'N/A', rep: '76.8%', glob: '84.0%' },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl shadow-sm">
              <BarChart4 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analytics de Utilización Inteligente</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Dashboard consolidado de uso de propiedades cross-módulo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="px-3 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Cards */}
          <div className="grid grid-cols-3 gap-6">
            
            <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                <span className="text-xl">🥇</span> Top 1 Uso
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Tipo Pedido Campaña</h3>
                <div className="flex gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Uso Total</div>
                    <div className="font-black text-xl text-emerald-600">98.7%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Asignaciones</div>
                    <div className="font-bold text-xl text-slate-700">2,847</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Top: "01 PUBLICIDAD"</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"><ArrowUpRight className="w-3 h-3"/> +12%</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                <span className="text-xl">🥈</span> Top 2 Uso
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Industria Cliente</h3>
                <div className="flex gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Uso Total</div>
                    <div className="font-black text-xl text-emerald-600">89.3%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Asignaciones</div>
                    <div className="font-bold text-xl text-slate-700">1,234</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Top: "FINANCIERO"</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"><ArrowUpRight className="w-3 h-3"/> +8%</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                <span className="text-xl">🥉</span> Top 3 Uso
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Tipo Cliente</h3>
                <div className="flex gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Uso Total</div>
                    <div className="font-black text-xl text-indigo-600">76.4%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Asignaciones</div>
                    <div className="font-bold text-xl text-slate-700">987</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Top: "DIRECTO"</span>
                  <span className="flex items-center gap-1 font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded"><Minus className="w-3 h-3"/> 0%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Segunda Fila: Tabla + Alerts */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Matriz de Uso */}
            <div className="col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">Matriz de Utilización por Módulo</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold border-r border-slate-100">Propiedad</th>
                      <th className="px-4 py-3 font-bold text-center"><div className="flex items-center justify-center gap-1"><FileText className="w-3 h-3"/> Contratos</div></th>
                      <th className="px-4 py-3 font-bold text-center"><div className="flex items-center justify-center gap-1"><Target className="w-3 h-3"/> Campañas</div></th>
                      <th className="px-4 py-3 font-bold text-center"><div className="flex items-center justify-center gap-1"><Users className="w-3 h-3"/> Clientes</div></th>
                      <th className="px-4 py-3 font-bold text-center"><div className="flex items-center justify-center gap-1"><BarChart4 className="w-3 h-3"/> Reportes</div></th>
                      <th className="px-4 py-3 font-bold text-center border-l border-slate-100 bg-indigo-50/30 text-indigo-700">GLOBAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {matrizUtilizacion.map((row, i) => (
                      <tr key={i} className={`hover:bg-slate-50 ${row.alert ? 'bg-amber-50/20' : ''}`}>
                        <td className="px-4 py-2.5 font-bold flex items-center gap-2 border-r border-slate-100">
                          {row.prop} {row.alert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500"/>}
                        </td>
                        <td className="px-4 py-2.5 text-center font-mono text-xs">{row.cont === 'N/A' ? <span className="text-slate-300">-</span> : row.cont}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-xs">{row.camp === 'N/A' ? <span className="text-slate-300">-</span> : row.camp}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-xs">{row.cli === 'N/A' ? <span className="text-slate-300">-</span> : row.cli}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-xs">{row.rep === 'N/A' ? <span className="text-slate-300">-</span> : row.rep}</td>
                        <td className={`px-4 py-2.5 text-center font-mono text-xs font-bold border-l border-slate-100 bg-indigo-50/30 ${parseFloat(row.glob) > 80 ? 'text-emerald-600' : parseFloat(row.glob) < 40 ? 'text-rose-600' : 'text-slate-700'}`}>{row.glob}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-800 text-white font-bold text-xs uppercase tracking-wider">
                      <td className="px-4 py-3 border-r border-slate-700">PROMEDIO POR MÓDULO</td>
                      <td className="px-4 py-3 text-center">62.1%</td>
                      <td className="px-4 py-3 text-center">67.4%</td>
                      <td className="px-4 py-3 text-center">67.5%</td>
                      <td className="px-4 py-3 text-center">70.3%</td>
                      <td className="px-4 py-3 text-center border-l border-slate-700 bg-indigo-900">66.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Alerts */}
            <div className="col-span-1 space-y-6">
              
              <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingDown className="w-16 h-16 text-rose-500"/></div>
                <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider relative z-10">Sub-Utilizadas</h3>
                
                <div className="space-y-3 relative z-10">
                  <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-sm">Estado Proyecto</span>
                      <span className="font-bold text-rose-600 text-sm">23.1%</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Usuarios reportan no entender cuándo aplicarlo vs Estado Comercial.</p>
                    <button className="text-[10px] font-bold uppercase tracking-wide bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:bg-slate-50 w-full">Configurar Training / Simplificar</button>
                  </div>
                  
                  <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-sm">Prioridad Comercial</span>
                      <span className="font-bold text-rose-600 text-sm">18.7%</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Percibido como opcional. Muchos registros lo dejan en blanco.</p>
                    <button className="text-[10px] font-bold uppercase tracking-wide bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:bg-slate-50 w-full">Hacer Obligatorio o Eliminar</button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4" /> Insights Automáticos
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <span className="text-emerald-500 mt-0.5">🔹</span>
                    <span className="text-xs text-slate-700 font-medium">Los usuarios prefieren listas cortas ({'<10'} valores), aumentando adopción un 40%.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 mt-0.5">🔹</span>
                    <span className="text-xs text-slate-700 font-medium">Propiedades marcadas como <strong>Obligatorias</strong> mantienen un 95%+ de coherencia en reportes.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 mt-0.5">🔹</span>
                    <span className="text-xs text-slate-700 font-medium">Configuración contable autogenerada reduce errores humanos en 78%.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
