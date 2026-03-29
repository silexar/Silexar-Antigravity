import React, { useState, useEffect, useCallback } from 'react';
import { 
  Send, Users, Mail, Phone, Clock, 
  CheckCircle, Server, Radio, Plus
} from 'lucide-react';
import { DistributionManager, type DisplayGroup } from '../services/DistributionManager';
import { format } from 'date-fns';
import { BroadcastExportService } from '../services/BroadcastExportService';

interface DistributionPanelProps {
  metadata?: Record<string, unknown>;
  onSend: (recipients: string[]) => void;
  onChange?: (selectedGroupIds: string[]) => void;
}

export const DistributionPanel: React.FC<DistributionPanelProps> = ({
  metadata,
  onSend,
  onChange
}) => {
  const [groups, setGroups] = useState<DisplayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    const detected = await DistributionManager.autoDetectRecipients(metadata);
    setGroups(detected);
    setLoading(false);
  }, [metadata]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const toggleGroup = (groupId: string) => {
    setGroups(prev => {
      const next = prev.map(g => 
        g.id === groupId ? { ...g, selected: !g.selected } : g
      );
      if (onChange) {
         onChange(next.filter(g => g.selected).map(g => g.id));
      }
      return next;
    });
  };

  const getAllSelectedEmails = () => {
    return groups
      .filter(g => g.selected)
      .flatMap(g => g.members.map(m => m.email));
  };

  const handleExportToSystems = async () => {
    setExporting(true);
    try {
       const results = await BroadcastExportService.exportToAllSystems({
          nombre: metadata?.spxId || 'Cuña Sin ID',
          ...metadata
       });
       alert(`📡 Exportación Completada:\n${results.map(r => `${r.status === 'success' ? '✅' : '❌'} ${r.station} (${r.system})`).join('\n')}`);
    } catch {
       alert('Error en exportación a sistemas de emisión.');
    }
    setExporting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200">
         <h3 className="font-bold text-slate-800 flex items-center gap-2">
           <Send className="w-5 h-5 text-violet-600" />
           Centro de Distribución y Envíos
         </h3>
         <p className="text-xs text-slate-500">
           Destinatarios configurados dinámicamente para: {(metadata?.spxId as string) || 'SPX-0000'}
         </p>
      </div>

      {/* Body */}
      <div className="p-4 space-y-6">
        {loading ? (
           <div className="py-8 text-center text-slate-400">Cargando grupos de distribución...</div>
        ) : (
          groups.map(group => (
            <div key={group.id} className={`rounded-xl border transition-all ${group.selected ? 'border-violet-200 bg-violet-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
              
              {/* Group Header */}
              <div 
                className="p-3 flex justify-between items-center cursor-pointer hover:bg-violet-50/50"
                onClick={() => toggleGroup(group.id)}
              >
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${group.selected ? 'bg-violet-100 text-violet-600' : 'bg-slate-200 text-slate-500'}`}>
                      {group.id.includes('ops') ? <Radio className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-700 text-sm">{group.name}</h4>
                     <p className="text-xs text-slate-500">{group.description}</p>
                   </div>
                 </div>
                 <div className="pr-2">
                   {group.selected ? <CheckCircle className="w-5 h-5 text-violet-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
                 </div>
              </div>

              {/* Members List */}
              {group.selected && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-px bg-slate-200/50 mb-3" />
                  {group.members.map((member, idx) => (
                    <div key={idx} className="flex items-start justify-between text-sm group">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {member.name ? member.name.charAt(0) : '@'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800 flex items-center gap-2">
                               {member.name || member.email}
                               <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">
                                 {member.role === 'operator' ? 'Operador' : 'Ejecutivo'}
                               </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                               <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</span>
                               {member.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {member.phone}</span>}
                            </div>
                          </div>
                       </div>
                       
                       <div className="text-right text-xs text-slate-400">
                         {member.lastContact ? (
                           <div className="flex items-center gap-1 justify-end">
                             <Clock className="w-3 h-3" /> 
                             {format(member.lastContact, "HH:mm 'Ayer'")}
                           </div>
                         ) : <span>Nunca notificado</span>}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

       <div className="bg-slate-900 mx-4 mb-4 p-4 rounded-xl text-slate-300 flex justify-between items-center shadow-inner border border-slate-800">
          <div>
             <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" /> Sistemas de Emisión (Automati.)
            </h4>
            <p className="text-xs text-slate-500 mt-1">Sincronizar con WideOrbit, Sara y Dalet</p>
         </div>
         <button 
           onClick={handleExportToSystems}
           disabled={exporting}
           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/50 flex items-center gap-2 transition-all"
         >
            {exporting ? 'Sincronizando...' : <><Radio className="w-3 h-3" /> Ingestar en Emisoras</>}
         </button>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
         <button className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
           <Plus className="w-3 h-3" /> Agregar Destinatario
         </button>
         <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 text-sm hover:bg-white">
               Gestionar
            </button>
            <button 
              onClick={() => onSend(getAllSelectedEmails())}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-bold shadow hover:bg-slate-800 flex items-center gap-2"
            >
              Enviar Ya <Send className="w-3 h-3" />
            </button>
         </div>
      </div>

    </div>
  );
};
