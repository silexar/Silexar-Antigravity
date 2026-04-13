/**
 * 🔗 COMPONENT: SecureLinkModal
 * 
 * Modal para envío de registros por Link Seguro.
 * Genera: Link único + Clave de acceso + Email borrador.
 * El operador revisa y aprueba antes de enviar.
 * Link expira en 24 horas.
 * 
 * @tier TIER_0_PREMIUM
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Link2, 
  Key, 
  Mail, 
  Clock, 
  Copy, 
  CheckCircle, 
  Send, 
  X,
  RefreshCw,
  Eye,
  Shield,
  MessageCircle // WhatsApp icon
} from 'lucide-react';

interface SecureLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { email: string; link: string; code: string }) => void;
  // Data to send
  materialName: string;
  spxCode: string;
  clipUrl?: string; // Kept for interface compatibility even if not used in modal logic
  clienteName?: string;
  campanaName?: string;
}

export function SecureLinkModal({
  isOpen,
  onClose,
  onSend,
  materialName,
  spxCode,
  clienteName = 'Cliente',
  campanaName = 'Campaña'
}: SecureLinkModalProps) {
  
  // Auto-generated data
  const [secureLink, setSecureLink] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  
  // User input
  const [clientEmail, setClientEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  // Generate secure data function wrapped in useCallback
  const generateSecureData = useCallback(() => {
    // Generate unique link
    const uuid = crypto.randomUUID().split('-').slice(0, 2).join('');
    const link = `https://silexar.pulse/registro/${uuid}`;
    setSecureLink(link);
    
    // Generate 6-digit access code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAccessCode(code);
    
    // Calculate expiration (24 hours from now)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    setExpiresAt(expires.toLocaleString('es-CL', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    }));
    
    // Generate email draft
    const draft = `Estimado/a ${clienteName},

Adjuntamos el registro de emisión correspondiente a la campaña "${campanaName}".

📋 DETALLE DEL REGISTRO
• Material: ${materialName}
• Código SPX: ${spxCode}
• Fecha de verificación: ${new Date().toLocaleDateString('es-CL')}

🔐 ACCESO SEGURO
Para descargar su registro, ingrese al siguiente enlace:
${link}

Clave de acceso: ${code}

⚠️ IMPORTANTE: Este enlace expira en 24 horas (${expires.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}).

Si tiene consultas, no dude en contactarnos.

Atentamente,
Equipo de Verificación
Silexar Pulse`;

    setEmailDraft(draft);
  }, [materialName, spxCode, clienteName, campanaName]);

  // Generate secure data on open
  useEffect(() => {
    if (isOpen) {
      generateSecureData();
    }
  }, [isOpen, generateSecureData]);

  const handleCopy = (type: 'link' | 'code') => {
    const text = type === 'link' ? secureLink : accessCode;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSend = async () => {
    if (!clientEmail || !clientEmail.includes('@')) {
      alert('Por favor ingrese un email válido');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    
    onSend({ email: clientEmail, link: secureLink, code: accessCode });
    setIsProcessing(false);
    setShowSuccess(true);
  };

  if (!isOpen) return null;

  // Success State
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl animate-in zoom-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">¡Enviado con Éxito!</h2>
          <p className="text-slate-500 mb-2">El link seguro ha sido enviado a:</p>
          <p className="text-lg font-bold text-slate-800 mb-6">{clientEmail}</p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-amber-700 text-sm font-bold mb-1">
              <Clock className="w-4 h-4" /> Recordatorio
            </div>
            <p className="text-amber-600 text-xs">
              El link expirará automáticamente en 24 horas ({expiresAt}).
            </p>
          </div>
          
          <button 
            onClick={() => { setShowSuccess(false); onClose(); }}
            className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Main Modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-4">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
          <button aria-label="Cerrar" onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Link2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black">ENVIAR POR LINK SEGURO</h2>
              <p className="text-indigo-200 text-sm font-medium">{spxCode} • {materialName}</p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* SECURITY INFO BAR */}
          <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Shield className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-800">Entrega Segura Activada</p>
              <p className="text-xs text-emerald-600">Link único • Clave de acceso • Auto-expira en 24h</p>
            </div>
          </div>

          {/* GENERATED DATA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* LINK */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> Link Único
                </span>
                <button onClick={() => handleCopy('link')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  {copied === 'link' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'link' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="font-mono text-sm text-slate-700 break-all">{secureLink}</p>
            </div>

            {/* CODE */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Key className="w-3 h-3" /> Clave de Acceso
                </span>
                <button onClick={() => handleCopy('code')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  {copied === 'code' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'code' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="font-mono text-3xl font-black text-slate-800 tracking-[0.5em]">{accessCode}</p>
            </div>

          </div>

          {/* EXPIRATION WARNING */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              <strong>Expira:</strong> {expiresAt} (24 horas desde ahora)
            </p>
            <button onClick={generateSecureData} className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Regenerar
            </button>
          </div>

          {/* EMAIL PREVIEW */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-4 h-4" /> Vista Previa del Email
              </h3>
            </div>
            <div className="bg-[#F0EDE8] rounded-xl p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{emailDraft}</pre>
            </div>
          </div>

          {/* CLIENT EMAIL INPUT */}
          <div>
            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
              <Mail className="w-4 h-4 inline mr-2" /> Email del Cliente
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="cliente@empresa.com"
              aria-label="Email del Cliente"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          
          {/* WHATSAPP BUTTON */}
          <button 
            onClick={() => {
                const message = `Hola, aquí tienes tu registro de emisión de *${materialName}*.\n\nLink Seguro: ${secureLink}\nClave: *${accessCode}*\n\nExpira en 24 horas.`;
                const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
                // handleAction removed, not defined here
                onClose();
            }}
            disabled={isProcessing}
            className="flex-1 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" /> WhatsApp Web
          </button>

          <button 
            onClick={handleSend}
            disabled={!clientEmail || isProcessing}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="w-5 h-5" /> Enviar Email</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
