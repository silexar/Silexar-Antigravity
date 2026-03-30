/**
 * 🧙 COMPONENT: VerificationWizard v2 (Precision Flow)
 * 
 * Flujo quirúrgico para operadores expertos.
 * ID Campaña -> Día -> Horario Visual -> Código SPX.
 * Maximiza eficiencia y reduce uso de recursos computacionales.
 * 
 * @tier TIER_0_PRECISION
 */

'use client';

import { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  Barcode, // Para SPX Code
  Play, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

// Tipos Mock
export interface Material { 
  id: string; 
  nombre: string; 
  tipo: 'audio_pregrabado' | 'mencion_vivo' | 'display_banner'; 
  selected: boolean; 
  duracion?: number; 
  spxCode?: string; 
  horaProgramada?: string; // Nuevo para visualización horaria
  texto?: string;
}

// Datos Mock Optimizados
const SCHEDULE_MOCK: Record<string, Material[]> = {
    '2024-12-14': [
        { id: '1', nombre: 'Spot Navidad A', tipo: 'audio_pregrabado', selected: true, duracion: 30, spxCode: 'SPX-901', horaProgramada: '08:15' },
        { id: '2', nombre: 'Mención Oferta', tipo: 'mencion_vivo', selected: true, duracion: 15, spxCode: 'SPX-LIVE-01', horaProgramada: '08:45' },
        { id: '3', nombre: 'Spot Navidad B', tipo: 'audio_pregrabado', selected: true, duracion: 30, spxCode: 'SPX-902', horaProgramada: '10:30' },
    ],
    '2024-12-15': [
        { id: '4', nombre: 'Spot Navidad A', tipo: 'audio_pregrabado', selected: true, duracion: 30, spxCode: 'SPX-901', horaProgramada: '14:20' },
        { id: '5', nombre: 'Banner App', tipo: 'display_banner', selected: true, duracion: 0, spxCode: 'DIG-BAN-01', horaProgramada: '14:20' },
        { id: '6', nombre: 'Cierre Programa', tipo: 'audio_pregrabado', selected: true, duracion: 10, spxCode: 'SPX-END', horaProgramada: '14:55' },
    ]
};

interface WizardProps {
  onStartVerification: (materials: Material[]) => void;
}

export function VerificationWizard({ onStartVerification }: WizardProps) {
  const [paso, setPaso] = useState(1);
  
  // Step 1: ID Search
  const [searchQuery, setSearchQuery] = useState('');
  const [contextFound, setContextFound] = useState<{ type: 'campana' | 'contrato', title: string, id: string } | null>(null);

  // Step 2: Date
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Step 3: Time & Schedule
  // const [selectedTimeBlock, setSelectedTimeBlock] = useState<string | null>(null); // 'morning', 'afternoon', 'evening' - Desactivado por optimización
  const [materialsInDay, setMaterialsInDay] = useState<Material[]>([]);

  // Step 4: SPX Filter
  const [spxQuery, setSpxQuery] = useState('');

  // --- LOGIC ---

  const handleSearch = () => {
      // Simulación de búsqueda inteligente
      if (searchQuery.includes('123') || searchQuery.toLowerCase().includes('navidad')) {
          setContextFound({ type: 'campana', title: 'Campaña Navidad Premium 2024', id: 'CAMP-2024-X' });
      } else if (searchQuery.includes('CON') || searchQuery.toLowerCase().includes('falabella')) {
          setContextFound({ type: 'contrato', title: 'Contrato Marco Falabella Q4', id: 'CON-9988' });
      } else {
          alert("No se encontraron resultados. Intente con '123' o 'Falabella'.");
      }
  };

  const selectDate = (date: string) => {
      setSelectedDate(date);
      setMaterialsInDay(SCHEDULE_MOCK[date] || []);
      setPaso(3);
  };

  // const avanzar = () => setPaso(p => Math.min(4, p + 1));
  const retroceder = () => setPaso(p => Math.max(1, p - 1));

  return (
    <div className="max-w-5xl mx-auto">
      {/* Precision Stepper */}
      <PrecisionStepper currentStep={paso} />

      <div className="bg-[#e0e5ec] rounded-3xl shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)] p-10 min-h-[500px] relative animate-in fade-in duration-500">
        
        {/* --- PASO 1: BÚSQUEDA PRECISA (ID/CONTRATO) --- */}
        {paso === 1 && (
            <div className="flex flex-col items-center justify-center h-full py-10">
                <div className="w-full max-w-xl text-center space-y-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-700 mb-2">Identificación de Pauta</h2>
                        <p className="text-slate-500 font-medium">Ingrese ID de Campaña o Número de Contrato para carga directa.</p>
                    </div>

                    <div className="relative">
                        <input 
                           type="text" 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Ej: CAM-2024-001 o Contrato 9876..."
                           className="w-full pl-6 pr-16 py-5 bg-[#e0e5ec] text-slate-800 font-bold text-lg rounded-2xl outline-none shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] focus:shadow-[inset_9px_9px_18px_#b8b9be,inset_-9px_-9px_18px_#ffffff] transition-all placeholder:font-normal"
                           onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button 
                           onClick={handleSearch}
                           className="absolute right-3 top-3 bottom-3 aspect-square bg-teal-500 rounded-xl text-white shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Context Result */}
                    {contextFound && (
                        <div className="bg-white/50 border border-white p-6 rounded-2xl shadow-sm text-left animate-in zoom-in slide-in-from-bottom-4 flex items-center justify-between">
                            <div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block ${contextFound.type === 'campana' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {contextFound.type === 'campana' ? 'CAMPAÑA DETECTADA' : 'CONTRATO MARCO'}
                                </span>
                                <h3 className="text-xl font-black text-slate-700">{contextFound.title}</h3>
                                <p className="text-slate-500 font-mono text-sm">ID: {contextFound.id}</p>
                            </div>
                            <button onClick={()=>setPaso(2)} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg">
                                Confirmar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- PASO 2: SELECCIÓN DÍA --- */}
        {paso === 2 && (
            <div className="h-full">
                <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-black text-slate-700"><span className="text-slate-400 font-medium">Buscar en:</span> {contextFound?.title}</h2>
                     <button onClick={retroceder} className="text-sm font-bold text-slate-500 hover:text-slate-800">Cambiar Campaña</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Calendar className="w-4 h-4"/> Seleccionar Día Operativo</h3>
                        <div className="grid grid-cols-7 gap-2 text-center">
                            {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => <span key={d} className="text-xs font-bold text-slate-400 py-2">{d}</span>)}
                            
                            {/* Mock Calendar Grid */}
                            {Array.from({length: 31}).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `2024-12-${day.toString().padStart(2, '0')}`;
                                const hasEvents = SCHEDULE_MOCK[dateStr];
                                
                                return (
                                    <button 
                                        key={i}
                                        onClick={() => hasEvents && selectDate(dateStr)}
                                        disabled={!hasEvents}
                                        className={`
                                            aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                                            ${hasEvents 
                                                ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-slate-700 font-bold cursor-pointer' 
                                                : 'text-slate-300 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {day}
                                        {hasEvents && <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-white/60">
                         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Resumen de Carga</h3>
                         <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <span className="text-slate-600 font-medium">Días con Pauta</span>
                                 <span className="font-bold text-slate-800">12</span>
                             </div>
                             <div className="flex items-center justify-between">
                                 <span className="text-slate-600 font-medium">Materiales Totales</span>
                                 <span className="font-bold text-slate-800">48</span>
                             </div>
                             <div className="p-4 bg-teal-50 rounded-xl mt-4 border border-teal-100">
                                 <p className="text-xs text-teal-700 font-medium text-center">
                                     💡 <strong>Tip Operativo:</strong> El día 15 tiene mayor concentración en horario PM.
                                 </p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- PASO 3: GRILLA HORARIA & TARGET --- */}
        {paso === 3 && (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                     <div>
                        <h2 className="text-2xl font-black text-slate-700">Grilla: {selectedDate}</h2>
                        <p className="text-slate-500 text-sm font-medium">Seleccione bloques o filtre por código SPX</p>
                     </div>
                     <button onClick={()=>setPaso(2)} className="text-sm font-bold text-slate-500 hover:text-slate-800">Volver al Calendario</button>
                </div>

                <div className="flex gap-6 flex-1 min-h-0">
                    
                    {/* VISUAL SCHEDULE TIMELINE */}
                    <div className="w-1/3 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 h-[400px]">
                        {materialsInDay.map((m) => (
                            <div key={m.id} className="flex gap-4 group cursor-pointer hover:bg-white/40 p-2 rounded-xl transition-colors">
                                <div className="w-16 pt-2 text-right">
                                    <span className="text-sm font-black text-slate-400 block">{m.horaProgramada}</span>
                                </div>
                                <div className="flex-1 relative">
                                    <div className="absolute left-[-9px] top-3 w-4 h-4 rounded-full bg-[#e0e5ec] border-4 border-teal-500" />
                                    <div className="border-l-2 border-slate-200 pl-6 pb-6 last:border-0">
                                        <div className="bg-[#e0e5ec] p-3 rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{m.spxCode}</p>
                                            <p className="font-bold text-slate-700 text-sm">{m.nombre}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 rounded text-[10px] font-bold text-slate-500">{m.tipo}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SPX FILTER & ACTION */}
                    <div className="w-2/3 bg-slate-50/50 rounded-2xl p-6 border border-white/60 flex flex-col">
                        <div className="mb-6">
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2 pl-1">🎯 Objetivo Específico (Opcional)</label>
                            <div className="relative">
                                <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                   type="text" 
                                   value={spxQuery}
                                   onChange={(e) => setSpxQuery(e.target.value)}
                                   placeholder="Escanear o digitar Código SPX..."
                                   className="w-full pl-12 pr-4 py-4 bg-white text-slate-800 font-bold text-lg rounded-xl outline-none shadow-sm border border-slate-200 focus:border-teal-500 transition-all font-mono"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                * Si se deja vacío, se verificará <strong>toda la grilla del día</strong> ({materialsInDay.length} items).
                            </p>
                        </div>

                        <div className="mt-auto">
                            <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl mb-6 flex gap-4 items-center">
                                <AlertCircle className="w-6 h-6 text-teal-600" />
                                <div>
                                    <p className="text-sm font-bold text-teal-800">Modo Quirúrgico Activo</p>
                                    <p className="text-xs text-teal-600">Se analizarán {spxQuery ? '1' : materialsInDay.length} elementos específicos usando índices de búsqueda directos.</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => onStartVerification(spxQuery ? materialsInDay.filter(m => m.spxCode?.includes(spxQuery)) : materialsInDay)}
                                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black text-lg rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-5 h-5 fill-current" /> EJECUTAR VERIFICACIÓN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS UI ---

function PrecisionStepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, icon: Search, label: 'Identidad' },
    { id: 2, icon: Calendar, label: 'Día' },
    { id: 3, icon: Clock, label: 'Target' },
  ];

  return (
    <div className="flex items-center justify-center mb-8 gap-4">
      {steps.map((s, i) => (
         <div key={s.id} className="flex items-center">
             <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500
                ${s.id === currentStep ? 'bg-teal-500 text-white shadow-lg scale-105' : s.id < currentStep ? 'bg-[#e0e5ec] text-teal-600 shadow-inner opacity-60' : 'bg-[#e0e5ec] text-slate-300'}
             `}>
                 <s.icon className="w-4 h-4" />
                 <span className="text-xs font-black uppercase tracking-wider">{s.label}</span>
             </div>
             {i < steps.length - 1 && <div className="w-8 h-0.5 bg-slate-300 mx-2" />}
         </div>
      ))}
    </div>
  );
}
