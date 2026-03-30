import React, { useState, useEffect } from 'react';
import { 
  X, Send, Calendar, 
  CheckCircle, Mail,
  Loader2, User
} from 'lucide-react';
import { DistributionTrackingService, type DeliveryRecord } from '../services/DistributionTrackingService';
import { format } from 'date-fns';

interface MassDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Record<string, unknown>[];
  contentData: Record<string, unknown>; // Audio, scripts info
}

export const MassDistributionModal: React.FC<MassDistributionModalProps> = ({
  isOpen,
  onClose,
  recipients,
  contentData
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'tracking'>('config');
  const [isSending, setIsSending] = useState(false);
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<DeliveryRecord | null>(null);

  // Poll tracking updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'tracking' && deliveryId) {
       interval = setInterval(() => {
          const status = DistributionTrackingService.getDeliveryStatus(deliveryId);
          if (status) setTrackingData({ ...status }); // Force re-render
       }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, deliveryId]);

  const handleSend = async () => {
    setIsSending(true);
    // Simular delay inicial
    await new Promise(r => setTimeout(r, 1000));
    
    const record = await DistributionTrackingService.createDelivery(
      (contentData as { spxId?: string }).spxId || 'SPX-000',
      recipients as unknown as Parameters<typeof DistributionTrackingService.createDelivery>[1],
      `Nueva Cuña: ${contentData.client} - ${contentData.campaign}`
    );
    
    setDeliveryId(record.id);
    setActiveTab('tracking');
    setIsSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-violet-600" />
              {activeTab === 'config' ? 'Configuración de Envío Masivo' : 'Monitor de Entrega en Tiempo Real'}
            </h3>
            <p className="text-sm text-slate-500">
              {activeTab === 'config' 
                 ? `Preparando envío para ${recipients.length} destinatarios calificados.`
                 : `Tracking ID: ${deliveryId}`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          
          {activeTab === 'config' && (
             <div className="space-y-6">
                {/* 1. Contenido a Enviar */}
                <Section title="📦 Contenido del Paquete">
                   <div className="space-y-2">
                      <CheckItem label={`Archivo de Audio Master (.wav) - ${contentData.duration || 30}s`} checked />
                      <CheckItem label="Ficha Técnica y Script (PDF)" checked />
                      <CheckItem label="Instrucciones de Programación" checked />
                      <CheckItem label="Certificado de Compliance (Legal)" checked />
                   </div>
                </Section>

                {/* 2. Programación */}
                <Section title="📅 Programación">
                   <div className="flex gap-4">
                      <OptionCard 
                        icon={Send} title="Enviar Ahora" 
                        desc="Distribución inmediata" 
                        selected={true} 
                      />
                      <OptionCard 
                        icon={Calendar} title="Programar" 
                        desc="Definir fecha y hora" 
                        selected={false} 
                      />
                   </div>
                </Section>

                {/* 3. Opciones Avanzadas */}
                <Section title="🔔 Confirmaciones y Tracking">
                   <div className="space-y-2">
                      <CheckItem label="Solicitar confirmación de lectura" checked />
                      <CheckItem label="Notificar descarga de archivos" checked />
                      <CheckItem label="Alerta si no confirma en 2 horas" checked />
                   </div>
                </Section>
             </div>
          )}

          {activeTab === 'tracking' && trackingData && (
             <div className="space-y-6">
                
                {/* Progress Bar */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-700">Estado General del Envío</span>
                      <span className="font-mono font-bold text-violet-600">{trackingData.progress}% completado</span>
                   </div>
                   <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-600 transition-all duration-500 ease-out" 
                        style={{ width: `${trackingData.progress}%` }}
                      />
                   </div>
                   <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200" /> Enviado</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> Abierto</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmado</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Fallido</div>
                   </div>
                </div>

                {/* Recipients List */}
                <div className="space-y-3">
                   {trackingData.recipients.map(rcp => (
                      <div key={rcp.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`
                               w-10 h-10 rounded-full flex items-center justify-center
                               ${rcp.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 
                                 rcp.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}
                            `}>
                               <User className="w-5 h-5" />
                            </div>
                            <div>
                               <div className="font-bold text-slate-800">{rcp.name}</div>
                               <div className="text-xs text-slate-500 flex items-center gap-2">
                                  <span>{rcp.email}</span>
                                  {rcp.status === 'confirmed' && <span className="text-emerald-600 font-bold">• Confirmado {format(rcp.timeline.confirmedAt!, 'HH:mm')}</span>}
                                  {rcp.status === 'opened' && <span className="text-blue-500 font-bold">• Leído {format(rcp.timeline.openedAt!, 'HH:mm')}</span>}
                                  {rcp.status === 'delivered' && <span className="text-slate-400">• Entregado</span>}
                                  {rcp.status === 'failed' && <span className="text-red-500 font-bold">• Error: {rcp.timeline.failReason}</span>}
                               </div>
                            </div>
                         </div>
                         
                         {/* Status Icon */}
                         <div className="flex items-center gap-2">
                            {rcp.status === 'sending' && <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />}
                            {rcp.status === 'failed' && (
                               <button className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold hover:bg-red-100 transition-colors">
                                  Reintentar
                               </button>
                            )}
                         </div>
                      </div>
                   ))}
                </div>

             </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 checkbox-none">
           {activeTab === 'config' ? (
              <>
                 <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Cancelar</button>
                 <button 
                   onClick={handleSend}
                   disabled={isSending}
                   className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl shadow-lg hover:bg-violet-700 transition-all flex items-center gap-2"
                 >
                   {isSending ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
                   {isSending ? 'Iniciando...' : 'Enviar Masivo'}
                 </button>
              </>
           ) : (
              <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl shadow hover:bg-slate-800">
                Cerrar Monitor
              </button>
           )}
        </div>

      </div>
    </div>
  );
};

// Subcomponents
interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section = ({ title, children }: SectionProps) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200">
     <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">{title}</h4>
     {children}
  </div>
);

interface CheckItemProps {
  label: string;
  checked: boolean;
}
const CheckItem = ({ label, checked }: CheckItemProps) => (
  <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
     <div className={`w-5 h-5 rounded border flex items-center justify-center ${checked ? 'bg-violet-600 border-violet-600' : 'border-slate-300'}`}>
        {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
     </div>
     <span className="text-sm text-slate-700">{label}</span>
  </div>
);

interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  selected: boolean;
}
const OptionCard = ({ icon: Icon, title, desc, selected }: OptionCardProps) => (
  <div className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-violet-600 bg-violet-50' : 'border-slate-200 hover:border-violet-200'}`}>
     <Icon className={`w-6 h-6 mb-2 ${selected ? 'text-violet-600' : 'text-slate-400'}`} />
     <div className={`font-bold text-sm ${selected ? 'text-violet-900' : 'text-slate-700'}`}>{title}</div>
     <div className="text-xs text-slate-500">{desc}</div>
  </div>
);
