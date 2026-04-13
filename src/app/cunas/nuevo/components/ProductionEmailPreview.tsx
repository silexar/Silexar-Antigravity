import React, { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { 
  Mail, Send, X, Clock, 
  MapPin, User, FileText 
} from 'lucide-react';
import { DiffEngine, type DiffResult } from '../services/DiffEngine';

interface ProductionEmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: Record<string, unknown>) => Promise<void>;
  data: {
    program: string;
    client: string;
    startDate: Date;
    endDate: Date;
    oldScript?: string;
    newScript: string;
    type: 'new' | 'update' | 'kill';
  };
}

// Formatear fecha sin dependencia externa
function formatDate(date: Date): string {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const d = date.getDate().toString().padStart(2, '0');
  const m = months[date.getMonth()];
  return `${d} ${m}`;
}

function formatDateSlash(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}`;
}

export const ProductionEmailPreview: React.FC<ProductionEmailPreviewProps> = ({
  isOpen,
  onClose,
  onSend,
  data
}) => {
  const [isSending, setIsSending] = useState(false);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [emailRecipients, setEmailRecipients] = useState('produccion@radio.cl; trafico@radio.cl');

  // Calcular diff al abrir
  useEffect(() => {
    if (data.oldScript && data.newScript) {
      setDiff(DiffEngine.compare(data.oldScript, data.newScript));
    }
  }, [data]);

  const handleSend = async () => {
    setIsSending(true);
    // Simular envío
    await new Promise(r => setTimeout(r, 1500));
    await onSend({ ...data, recipients: emailRecipients });
    setIsSending(false);
    onClose();
  };

  if (!isOpen) return null;

  const subject = `[${data.type.toUpperCase()}] ${data.program} - ${data.client} - ${formatDateSlash(new Date())}`;
  const urgencyColor = data.type === 'kill' ? 'red' : data.type === 'update' ? 'amber' : 'blue';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0EDE8]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header Correo */}
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg bg-${urgencyColor}-100 text-${urgencyColor}-600`}>
                 <Mail className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-800">Notificación a Producción</h3>
                 <p className="text-sm text-[#888780]">Vista previa del correo operativo</p>
               </div>
             </div>
             <button onClick={onClose} className="text-[#888780] hover:text-slate-600">
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="space-y-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-sm">
            <div className="flex gap-2">
              <span className="text-[#888780] w-16 text-right font-medium">Para:</span>
              <input
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                aria-label="Destinatarios del email"
                className="flex-1 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-violet-500 text-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <span className="text-[#888780] w-16 text-right font-medium">Asunto:</span>
              <span className="font-bold text-slate-800">{subject}</span>
            </div>
          </div>
        </div>

        {/* Body (Preview del contenido HTML) */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto space-y-6">
            
            {/* Header del Template */}
            <div className="border-b pb-4 mb-4">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Orden de {data.type === 'new' ? 'Grabación' : data.type === 'update' ? 'Modificación' : 'Baja'}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {data.program}</div>
                <div className="flex items-center gap-1"><User className="w-4 h-4"/> {data.client}</div>
                <div className="flex items-center gap-1 bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                  <Clock className="w-4 h-4"/> Al aire: {formatDate(data.startDate)}
                </div>
              </div>
            </div>

            {/* Contenido Script */}
            <div>
              <h2 className="text-sm font-bold text-[#888780] uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 
                {data.type === 'update' ? 'Control de Cambios' : 'Guión'}
              </h2>
              
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
                {data.type === 'update' && diff ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(DiffEngine.generateEmailHtml(diff)) }} />
                ) : (
                  data.newScript
                )}
              </div>
            </div>

            {/* Footer Template */}
            <div className="border-t pt-4 text-xs text-[#888780] text-center">
              <p>Generado automáticamente por Silexar Pulse Antygravity</p>
              <p>{new Date().toISOString()}</p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
          <div className="text-xs text-[#888780] px-4">
             Validación Operativa: <strong className="text-emerald-600">OK 24/7</strong>
          </div>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">
               Editar
             </button>
             <button 
               onClick={handleSend}
               disabled={isSending}
               className="px-6 py-2 bg-violet-600 text-[#2C2C2A] font-bold rounded-lg shadow-lg hover:bg-violet-700 active:scale-95 transition-all flex items-center gap-2"
             >
               {isSending ? (
                 <>Enviando... <Clock className="w-4 h-4 animate-spin"/></>
               ) : (
                 <>Enviar Orden <Send className="w-4 h-4"/></>
               )}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};
