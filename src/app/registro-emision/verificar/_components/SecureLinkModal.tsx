/**
 * 🔐 COMPONENT: SecureLinkModal
 * 
 * Modal para crear y gestionar enlaces seguros de acceso a evidencia.
 * Genera links temporales con código de acceso y seguimiento de uso.
 * 
 * @tier TIER_0_ENTERPRISE
 * @design NEUROMORPHIC + SECURITY
 */

'use client';

import { useState } from 'react';
import {
  Link2,
  Copy,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  Download,
  Share2,
  ExternalLink,
  Key,
  Lock,
  Unlock,
  Trash2,
  QrCode
} from 'lucide-react';

interface SecureLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificacionId: string;
  clipsCount: number;
  onCreateLink: (config: LinkConfig) => Promise<{ url: string; code: string }>;
}

interface LinkConfig {
  expiresInHours: number;
  maxAccessCount: number;
  includeBlockchain: boolean;
  requireCode: boolean;
}

interface GeneratedLink {
  id: string;
  url: string;
  code: string;
  expiresAt: Date;
  accessCount: number;
  maxAccess: number;
  status: 'active' | 'expired' | 'revoked';
}

export function SecureLinkModal({
  isOpen,
  onClose,
  verificacionId,
  clipsCount,
  onCreateLink
}: SecureLinkModalProps) {
  const [step, setStep] = useState<'config' | 'generating' | 'created'>('config');
  const [config, setConfig] = useState<LinkConfig>({
    expiresInHours: 24,
    maxAccessCount: 5,
    includeBlockchain: true,
    requireCode: true
  });
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  if (!isOpen) return null;

  const handleCreateLink = async () => {
    setStep('generating');
    try {
      const result = await onCreateLink(config);
      setGeneratedLink({
        id: Math.random().toString(36).slice(2),
        url: result.url,
        code: result.code,
        expiresAt: new Date(Date.now() + config.expiresInHours * 60 * 60 * 1000),
        accessCount: 0,
        maxAccess: config.maxAccessCount,
        status: 'active'
      });
      setStep('created');
    } catch (error) {
      setStep('config');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🔐 Acceso seguro a evidencia de verificación\n\n${generatedLink?.url}\n\nCódigo: ${generatedLink?.code}\n\nVence: ${generatedLink?.expiresAt.toLocaleDateString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = 'Evidencia de Verificación de Emisión';
    const body = `Accede a la evidencia de verificación mediante el siguiente enlace seguro:\n\n${generatedLink?.url}\n\nCódigo de acceso: ${generatedLink?.code}\n\n\nEste enlace expira en ${config.expiresInHours} horas.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#F0EDE8]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#e0e5ec] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/40">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#6888ff] to-[#5572ee] p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6" /> ENLACE SEGURO DE EVIDENCIA
              </h2>
              <p className="text-blue-100 text-sm font-medium mt-1 opacity-90">
                {clipsCount} clips de evidencia listos para compartir
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <Link2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {step === 'config' && (
            <>
              {/* Configuration Options */}
              <div className="space-y-4">

                {/* Expiration */}
                <div className="bg-white rounded-2xl p-5 shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff]">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock className="w-4 h-4 text-[#6888ff]" /> Expira en
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[6, 24, 72].map(hours => (
                      <button
                        key={hours}
                        onClick={() => setConfig(c => ({ ...c, expiresInHours: hours }))}
                        className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${config.expiresInHours === hours
                            ? 'bg-[#6888ff] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Access */}
                <div className="bg-white rounded-2xl p-5 shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff]">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Eye className="w-4 h-4 text-[#6888ff]" /> Veces accessible
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5, 10].map(count => (
                      <button
                        key={count}
                        onClick={() => setConfig(c => ({ ...c, maxAccessCount: count }))}
                        className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${config.maxAccessCount === count
                            ? 'bg-[#6888ff] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {count}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff] cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">Requerir código de acceso</p>
                        <p className="text-xs text-slate-400">El destinatario necesitará un código</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setConfig(c => ({ ...c, requireCode: !c.requireCode }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${config.requireCode ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${config.requireCode ? 'left-7' : 'left-1'
                        }`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff] cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">Incluir certificación blockchain</p>
                        <p className="text-xs text-slate-400">Evidencia inmutable legal</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setConfig(c => ({ ...c, includeBlockchain: !c.includeBlockchain }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${config.includeBlockchain ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${config.includeBlockchain ? 'left-7' : 'left-1'
                        }`} />
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateLink}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#6888ff] to-[#5572ee] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Generar Enlace
                </button>
              </div>
            </>
          )}

          {step === 'generating' && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#6888ff] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Generando enlace seguro...</p>
            </div>
          )}

          {step === 'created' && generatedLink && (
            <>
              {/* Success Message */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-bold text-emerald-700">¡Enlace generado exitosamente!</p>
                  <p className="text-xs text-emerald-600">Copie el enlace y compártalo con el destinatario</p>
                </div>
              </div>

              {/* Link Display */}
              <div className="bg-white rounded-2xl p-5 shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff] space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-[#888780] uppercase mb-2">🔗 Enlace de Acceso</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink.url}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-mono truncate"
                    />
                    <button
                      onClick={() => handleCopy(generatedLink.url)}
                      className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {config.requireCode && (
                  <div>
                    <p className="text-[10px] font-bold text-[#888780] uppercase mb-2">🔑 Código de Acceso</p>
                    <div className="flex items-center gap-2">
                      <input
                        type={showCode ? 'text' : 'password'}
                        readOnly
                        value={generatedLink.code}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-mono tracking-widest"
                      />
                      <button
                        onClick={() => setShowCode(!showCode)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                      >
                        {showCode ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(generatedLink.code)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Expira: {generatedLink.expiresAt.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{generatedLink.accessCount} / {generatedLink.maxAccess} accesos</span>
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-bold">WhatsApp</span>
                </button>
                <button
                  onClick={handleShareEmail}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-xs font-bold">Email</span>
                </button>
                <button
                  onClick={() => {/* QR Code modal */ }}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-bold">Código QR</span>
                </button>
              </div>

              {/* Footer */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setStep('config');
                    setGeneratedLink(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#6888ff] to-[#5572ee] shadow-lg hover:shadow-xl transition-all"
                >
                  Crear Otro
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
