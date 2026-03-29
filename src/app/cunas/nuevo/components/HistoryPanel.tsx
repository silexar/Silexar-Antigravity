import React, { useState, useEffect } from 'react';
import { 
  Clock, FileText, Send, Music, 
  User, ShieldCheck, Search, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditService, type AuditEntry } from '../services/AuditService';

interface HistoryPanelProps {
  cunaId: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ cunaId }) => {
  const [timeline, setTimeline] = useState<AuditEntry[]>([]);

  useEffect(() => {
    // Cargar historial (Mock)
    setTimeline(AuditService.getTimeline(cunaId));
  }, [cunaId]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Clock className="w-5 h-5 text-violet-600" /> Historial y Trazabilidad
           </h3>
           <p className="text-sm text-slate-500">Auditoría completa de acciones para ID: {cunaId}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-500 transition-all">
             <Search className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
             <Download className="w-3 h-3" /> Exportar Log
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 relative">
        <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-slate-200" /> {/* Vertical Line */}

        <div className="space-y-8 relative z-10">
          {timeline.map((entry, idx) => {
             const dateLabel = format(entry.timestamp, "EEEE d 'de' MMMM", { locale: es });
             const showDateHeader = idx === 0 || format(timeline[idx-1].timestamp, 'd') !== format(entry.timestamp, 'd');

             return (
               <div key={entry.id}>
                 {showDateHeader && (
                    <div className="mb-6 ml-12 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {idx === 0 ? `HOY - ${dateLabel}` : dateLabel}
                    </div>
                 )}

                 <div className="flex gap-4 group">
                    {/* Icon Bubble */}
                    <div className={`
                       w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0
                       ${entry.action === 'distribute' ? 'bg-indigo-100 text-indigo-600' :
                         entry.action === 'validate' ? 'bg-emerald-100 text-emerald-600' :
                         entry.action === 'process' ? 'bg-violet-100 text-violet-600' :
                         entry.action === 'create' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}
                    `}>
                       {getIconForAction(entry.action)}
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 shadow-sm group-hover:border-slate-300 transition-colors">
                       <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 text-sm uppercase">{entry.title}</h4>
                          <span className="text-xs font-mono text-slate-400">{format(entry.timestamp, 'HH:mm')}</span>
                       </div>
                       
                       <p className="text-slate-600 text-sm mb-3">
                         {renderDescription(entry.description)}
                       </p>

                       <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-50 pt-2">
                          <User className="w-3 h-3" />
                          <span className="font-medium">{entry.userName}</span>
                          {entry.metadata && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">Metadata</span>}
                       </div>
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

// Helpers
const getIconForAction = (action: string) => {
   switch (action) {
     case 'create': return <FileText className="w-5 h-5" />;
     case 'process': return <Music className="w-5 h-5" />;
     case 'validate': return <ShieldCheck className="w-5 h-5" />;
     case 'distribute': return <Send className="w-5 h-5" />;
     default: return <Clock className="w-5 h-5" />;
   }
};

const renderDescription = (text: string) => {
  // Simple highlighter for key terms can be re-added later
  return <>{text}</>; 
};
