/**
 * ⚡ MOBILE: Acciones Bottom Sheet
 * 
 * Bottom sheet para ejecutar acciones sobre contratos: aprobar, rechazar,
 * firmar, comentar. Conectado al POST /api/mobile/contratos.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  X, CheckCircle2, XCircle, Star, MessageSquare,
  Phone, Mail, Loader2, AlertTriangle, Shield
} from 'lucide-react';
import { useContratosAcciones } from '../../_shared/useContratos';

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

interface MobileAccionesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contratoId: string;
  contratoNumero: string;
  clienteNombre: string;
  accionesDisponibles: string[];
  onSuccess?: () => void;
}

type AccionActiva = 'aprobar' | 'rechazar' | 'firmar' | 'comentar' | null;

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileAccionesSheet({
  isOpen, onClose, contratoId, contratoNumero, clienteNombre,
  accionesDisponibles, onSuccess,
}: MobileAccionesSheetProps) {
  const { aprobar, rechazar, firmar, comentar, processing } = useContratosAcciones();
  const [accionActiva, setAccionActiva] = useState<AccionActiva>(null);
  const [comentarioText, setComentarioText] = useState('');
  const [motivoText, setMotivoText] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAccion = async () => {
    let result: { success: boolean };

    switch (accionActiva) {
      case 'aprobar':
        result = await aprobar(contratoId, comentarioText || undefined);
        if (result.success) setSuccessMessage('Contrato aprobado exitosamente');
        break;
      case 'rechazar':
        if (!motivoText) return;
        result = await rechazar(contratoId, motivoText);
        if (result.success) setSuccessMessage('Contrato rechazado');
        break;
      case 'firmar':
        result = await firmar(contratoId);
        if (result.success) setSuccessMessage('Firma digital registrada');
        break;
      case 'comentar':
        if (!comentarioText) return;
        result = await comentar(contratoId, comentarioText);
        if (result.success) setSuccessMessage('Comentario agregado');
        break;
      default:
        return;
    }

    if (result.success) {
      setSuccess(true);
      onSuccess?.();
    }
  };

  const handleClose = () => {
    setAccionActiva(null);
    setComentarioText('');
    setMotivoText('');
    setSuccess(false);
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={handleClose} />

      {/* SHEET */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl">
        {/* HANDLE */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {success ? 'Acción Completada' : accionActiva ? `${accionActiva.charAt(0).toUpperCase() + accionActiva.slice(1)} Contrato` : 'Acciones'}
            </h2>
            <p className="text-xs text-slate-400">{contratoNumero} · {clienteNombre}</p>
          </div>
          <button onClick={handleClose} aria-label="Cerrar" className="p-2 rounded-full bg-slate-100 active:scale-90">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-5 pb-10">
          {/* SUCCESS */}
          {success ? (
            <div className="flex flex-col items-center text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="font-bold text-slate-700">{successMessage}</p>
              <button onClick={handleClose} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl active:scale-95">
                Cerrar
              </button>
            </div>
          ) : accionActiva ? (
            /* ACTION FORM */
            <div className="space-y-4">
              {accionActiva === 'aprobar' && (
                <>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-700">Al aprobar, este contrato avanzará a la siguiente etapa del pipeline.</p>
                  </div>
                  <textarea
                    value={comentarioText}
                    onChange={(e) => setComentarioText(e.target.value)}
                    placeholder="Comentario de aprobación (opcional)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                  />
                </>
              )}

              {accionActiva === 'rechazar' && (
                <>
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700">El contrato será devuelto al ejecutivo con el motivo de rechazo.</p>
                  </div>
                  <textarea
                    value={motivoText}
                    onChange={(e) => setMotivoText(e.target.value)}
                    placeholder="Motivo del rechazo (requerido)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-red-200 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                  />
                </>
              )}

              {accionActiva === 'firmar' && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                  <Star className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-purple-700">Se aplicará tu firma digital certificada al contrato. Esta acción es irreversible.</p>
                </div>
              )}

              {accionActiva === 'comentar' && (
                <textarea
                  value={comentarioText}
                  onChange={(e) => setComentarioText(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setAccionActiva(null)}
                  className="flex-1 py-3.5 border border-slate-200 rounded-xl font-bold text-slate-600 active:scale-95"
                >
                  Volver
                </button>
                <button
                  onClick={handleAccion}
                  disabled={processing || (accionActiva === 'rechazar' && !motivoText) || (accionActiva === 'comentar' && !comentarioText)}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                    accionActiva === 'rechazar' ? 'bg-red-600' :
                    accionActiva === 'firmar' ? 'bg-purple-600' :
                    'bg-emerald-600'
                  }`}
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </div>
          ) : (
            /* ACTION LIST */
            <div className="space-y-2">
              {accionesDisponibles.includes('aprobar') && (
                <ActionRow icon={<CheckCircle2 className="w-5 h-5" />} label="Aprobar Contrato" desc="Avanzar a siguiente etapa" color="bg-emerald-100 text-emerald-600" onClick={() => setAccionActiva('aprobar')} />
              )}
              {accionesDisponibles.includes('rechazar') && (
                <ActionRow icon={<XCircle className="w-5 h-5" />} label="Rechazar" desc="Devolver con motivo" color="bg-red-100 text-red-600" onClick={() => setAccionActiva('rechazar')} />
              )}
              {accionesDisponibles.includes('firmar') && (
                <ActionRow icon={<Star className="w-5 h-5" />} label="Firmar Digital" desc="Aplicar firma certificada" color="bg-purple-100 text-purple-600" onClick={() => setAccionActiva('firmar')} />
              )}
              {accionesDisponibles.includes('comentar') && (
                <ActionRow icon={<MessageSquare className="w-5 h-5" />} label="Comentar" desc="Agregar nota al contrato" color="bg-blue-100 text-blue-600" onClick={() => setAccionActiva('comentar')} />
              )}
              <ActionRow icon={<Phone className="w-5 h-5" />} label="Llamar Cliente" desc="Contacto directo" color="bg-cyan-100 text-cyan-600" />
              <ActionRow icon={<Mail className="w-5 h-5" />} label="Email" desc="Enviar comunicación" color="bg-amber-100 text-amber-600" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT
// ═══════════════════════════════════════════════════════════════

function ActionRow({ icon, label, desc, color, onClick }: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform bg-white"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="text-left flex-1">
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-slate-200" />
    </button>
  );
}
