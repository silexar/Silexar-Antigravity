/**
 * 🏆 COMPONENT: ResultsView
 * 
 * Vista de resultados finales con categorización forense y acciones avanzadas.
 * 
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { CheckCircle, Play, Download, AlertTriangle, RefreshCw, Mail, Share2, Music, Mic2, Radio, FileText, Clock, BarChart2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { AlertDetailsModal } from './AlertDetailsModal';
import { NotificationStatusModal } from './NotificationStatusModal';
import { ExportOptionsModal } from './ExportOptionsModal';
import { ExportSuccessModal } from './ExportSuccessModal';

export interface ResultadoVerificacion {
  materialId: string;
  nombreMaterial: string;
  tipoMaterial: 'audio_pregrabado' | 'mencion_vivo' | 'presentacion' | 'cierre' | 'display_banner';
  encontrado: boolean;
  horaEmision?: string;
  horaFin?: string;
  emisora?: string;
  accuracy?: number;
  clipUrl?: string;
  transcripcion?: string;
  locutor?: string;
  posibleCausa?: string;
}

interface ResultsViewProps {
  resultados: ResultadoVerificacion[];
  tiempoTotal: number;
  blockchainHash?: string;
  certificadoUrl?: string;
  onReset: () => void;
}

export function ResultsView({ resultados, tiempoTotal, blockchainHash, certificadoUrl, onReset }: ResultsViewProps) {
  
  // Modal States
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedAlertMaterial, setSelectedAlertMaterial] = useState<ResultadoVerificacion | null>(null);

  // Categorization Logic
  const audiosEncontrados = resultados.filter(r => r.encontrado && r.tipoMaterial === 'audio_pregrabado');
  const mencionesEncontradas = resultados.filter(r => r.encontrado && r.tipoMaterial === 'mencion_vivo');
  const presentacionesEncontradas = resultados.filter(r => r.encontrado && ['presentacion', 'cierre'].includes(r.tipoMaterial));
  const noEncontrados = resultados.filter(r => !r.encontrado);

  const accuracyPromedio = resultados.filter(r=>r.encontrado).length > 0
    ? Math.round(resultados.filter(r=>r.encontrado).reduce((sum, r) => sum + (r.accuracy || 0), 0) / resultados.filter(r=>r.encontrado).length)
    : 0;

  const openAlertModal = (material: ResultadoVerificacion) => {
      setSelectedAlertMaterial(material);
      setAlertModalOpen(true);
  };

  const handleAlertSent = () => {
      setAlertModalOpen(false);
      setNotificationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 pb-32">
       
       {/* MODALS */}
       <ExportSuccessModal 
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          onReset={() => {
              setSuccessModalOpen(false);
              onReset();
          }}
       />

       <AlertDetailsModal 
          isOpen={alertModalOpen} 
          onClose={() => setAlertModalOpen(false)} 
          material={selectedAlertMaterial}
          onSendSuccess={handleAlertSent}
       />

       <NotificationStatusModal 
           isOpen={notificationModalOpen}
           onClose={() => setNotificationModalOpen(false)}
           onNewConsultation={() => {
               setNotificationModalOpen(false);
               onReset();
           }}
       />

       <ExportOptionsModal 
           isOpen={exportModalOpen}
           onClose={() => setExportModalOpen(false)}
           onSuccess={() => {
               setExportModalOpen(false);
               setSuccessModalOpen(true);
           }}
       />

       <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
          
          {/* HEADER SUMMARY */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-600" />
             <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border-2 border-emerald-100 shadow-inner">
                         <CheckCircle className="w-10 h-10 text-emerald-500" />
                      </div>
                      <div>
                         <h1 className="text-3xl font-black text-slate-800 tracking-tight">VERIFICACIÓN COMPLETADA</h1>
                         <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                               <Clock className="w-3 h-3" /> {tiempoTotal} segundos
                            </span>
                            <span className="text-slate-400 text-sm font-medium">|</span>
                            <span className="text-slate-500 text-sm font-medium">{new Date().toLocaleDateString()} • ID: {Math.random().toString(36).substr(2,9).toUpperCase()}</span>
                         </div>
                      </div>
                   </div>

                   {/* Blockchain Badge */}
                   {blockchainHash && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col items-end">
                         <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Blockchain Certified</span>
                         <code className="text-xs font-mono text-indigo-700 mb-2 max-w-[200px] truncate block">{blockchainHash}</code>
                         <a href={certificadoUrl || '#'} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            Ver Certificado <Share2 className="w-3 h-3" />
                         </a>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <StatCard label="Total Auditado" value={resultados.length} color="slate" icon={<FileText className="w-5 h-5" />} />
                   <StatCard label="Encontrados" value={`${resultados.filter(r=>r.encontrado).length} (${Math.round(resultados.filter(r=>r.encontrado).length/resultados.length*100)}%)`} color="emerald" icon={<CheckCircle className="w-5 h-5" />} highlight />
                   <StatCard label="Accuracy Promedio" value={`${accuracyPromedio}%`} color="blue" icon={<BarChart2 className="w-5 h-5" />} />
                   <StatCard label="No Encontrados" value={noEncontrados.length} color="red" icon={<AlertCircle className="w-5 h-5" />} />
                </div>
             </div>
          </div>

          {/* SECTION: AUDIOS PREGRABADOS */}
          {audiosEncontrados.length > 0 && (
            <SectionContainer title="Audios Pregrabados Encontrados" count={audiosEncontrados.length} icon={<Music className="w-6 h-6 text-purple-500" />}>
               <div className="grid grid-cols-1 gap-4">
                  {audiosEncontrados.map(res => (
                     <ResultCard key={res.materialId} res={res} />
                  ))}
               </div>
            </SectionContainer>
          )}

          {/* SECTION: MENCIONES */}
          {mencionesEncontradas.length > 0 && (
            <SectionContainer title="Menciones en Vivo Detectadas" count={mencionesEncontradas.length} icon={<Mic2 className="w-6 h-6 text-orange-500" />}>
               <div className="grid grid-cols-1 gap-4">
                  {mencionesEncontradas.map(res => (
                     <ResultCard key={res.materialId} res={res} />
                  ))}
               </div>
            </SectionContainer>
          )}

          {/* SECTION: PRESENTACIONES */}
          {presentacionesEncontradas.length > 0 && (
            <SectionContainer title="Presentaciones & Cierres" count={presentacionesEncontradas.length} icon={<Radio className="w-6 h-6 text-blue-500" />}>
               <div className="grid grid-cols-1 gap-4">
                  {presentacionesEncontradas.map(res => (
                     <ResultCard key={res.materialId} res={res} />
                  ))}
               </div>
            </SectionContainer>
          )}

          {/* SECTION: NO ENCONTRADOS (ALERTS) */}
          {noEncontrados.length > 0 && (
             <div className="bg-red-50/50 rounded-3xl border border-red-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-red-100 flex items-center justify-between bg-red-50">
                    <h2 className="text-xl font-bold text-red-800 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600" /> Materiales No Detectados
                    </h2>
                    <span className="bg-red-200 text-red-800 text-xs font-bold px-3 py-1 rounded-full">{noEncontrados.length} ALERTAS</span>
                </div>
                <div className="p-6 space-y-4">
                    {noEncontrados.map(res => (
                        <div key={res.materialId} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-start justify-between">
                            <div>
                                <h4 className="font-bold text-slate-700 text-lg mb-1">{res.nombreMaterial}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">No Emitido</span>
                                    <span className="text-slate-400 text-xs">Posible causa: {res.posibleCausa || 'Error programación'}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => openAlertModal(res)}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-bold border border-red-200 transition-colors flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" /> Alerta Programación
                            </button>
                        </div>
                    ))}
                </div>
             </div>
          )}

       </div>

       {/* FLOATING ACTION BAR */}
       <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-2 flex gap-2 z-50 animate-in slide-in-from-bottom-10">
            <FooterAction icon={<RefreshCw className="w-5 h-5" />} label="Nueva Verificación" onClick={onReset} variant="secondary" />
            <div className="w-px bg-slate-200 mx-2" />
            <FooterAction icon={<Download className="w-5 h-5" />} label="Descargar ZIP" variant="primary" color="teal" onClick={() => setExportModalOpen(true)} />
            <FooterAction icon={<Mail className="w-5 h-5" />} label="Reporte Cliente" variant="primary" color="indigo" onClick={() => setExportModalOpen(true)} />
            <FooterAction icon={<Share2 className="w-5 h-5" />} label="Drive Cloud" variant="primary" color="purple" onClick={() => setExportModalOpen(true)} />
       </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

interface StatCardProps { label: string; value: string | number; color: 'slate' | 'emerald' | 'blue' | 'red'; icon: React.ReactNode; highlight?: boolean; }
const StatCard = ({ label, value, color, icon, highlight }: StatCardProps) => {
    const colors: Record<string, string> = {
        slate: 'bg-slate-50 text-slate-800 border-slate-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        red: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colors[color]} ${highlight ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}>
            <div className="flex justify-between items-start mb-2 opacity-80">
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-black tracking-tight">{value}</div>
        </div>
    );
};

interface SectionContainerProps { title: string; count: number; icon: React.ReactNode; children: React.ReactNode; }
const SectionContainer = ({ title, count, icon, children }: SectionContainerProps) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
            <h2 className="text-xl font-bold text-slate-700">{title}</h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{count}</span>
        </div>
        <div className="p-6 bg-slate-50/50">
            {children}
        </div>
    </div>
);

const ResultCard = ({ res }: { res: ResultadoVerificacion }) => (
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group">
         <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
             
             {/* Info Principal */}
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100 text-teal-600 shrink-0">
                    <Play className="w-5 h-5 ml-0.5" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{res.nombreMaterial}</h4>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-1.5 rounded"><Clock className="w-3 h-3" /> {res.horaEmision} - {res.horaFin}</span>
                        <span>•</span>
                        <span className="font-medium">{res.emisora || 'Emisora Local'}</span>
                        {res.locutor && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Mic2 className="w-3 h-3" /> {res.locutor}</span>
                            </>
                        )}
                    </div>
                </div>
             </div>

             {/* Métricas y Acciones */}
             <div className="flex items-center gap-4 self-end md:self-center">
                 <div className="text-right mr-4">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Coincidencia</div>
                     <div className="text-xl font-black text-emerald-600">{res.accuracy}%</div>
                 </div>
                 
                 <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                     <button title="Reproducir Clip" className="p-2.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"><Play className="w-4 h-4" /></button>
                     <button title="Descargar" className="p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><Download className="w-4 h-4" /></button>
                     <button title="Enviar Email" className="p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><Mail className="w-4 h-4" /></button>
                 </div>
             </div>

         </div>
         
         {/* Transcript Preview for Mentions */}
         {res.transcripcion && (
             <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-sm text-indigo-800 italic flex gap-3">
                 <FileText className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                 "{res.transcripcion}"
             </div>
         )}
    </div>
);

interface FooterActionProps { icon: React.ReactNode; label: string; onClick: () => void; variant: 'primary' | 'secondary'; color?: 'teal' | 'indigo' | 'purple'; }
const FooterAction = ({ icon, label, onClick, variant, color = 'teal' }: FooterActionProps) => {
    const base = "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:-translate-y-1 shadow-sm text-sm";
    const colors: Record<string, string> = {
        teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200",
        indigo: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
        purple: "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200",
    };
    
    return (
        <button 
           onClick={onClick}
           className={`${base} ${variant === 'secondary' ? 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200' : colors[color]}`}
        >
            {icon}
            {label}
        </button>
    );
};

