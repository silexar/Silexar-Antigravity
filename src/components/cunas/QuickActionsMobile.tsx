/**
 * 📱 SILEXAR PULSE - Quick Actions Mobile TIER 0
 * 
 * Panel de acciones rápidas optimizado para móvil
 * con grabación de voz y aprobación rápida
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Plus, CheckCircle, XCircle, Volume2, Camera,
  Clock, X
} from 'lucide-react';

interface PendingApproval {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  anunciante: string;
  audioUrl?: string;
}

interface QuickActionsMobileProps {
  pendingApprovals: PendingApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onNewCuna: () => void;
  onNewDigital: () => void;
}

export function QuickActionsMobile({
  pendingApprovals,
  onApprove,
  onReject,
  onNewCuna,
  onNewDigital
}: QuickActionsMobileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentApproval, setCurrentApproval] = useState<PendingApproval | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Grabación de audio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        
        // Aquí se enviaría el audio al servidor
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleApprove = (approval: PendingApproval) => {
    onApprove(approval.id);
    if (pendingApprovals.length === 1) {
      setIsExpanded(false);
    }
  };

  const handleStartReject = (approval: PendingApproval) => {
    setCurrentApproval(approval);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (currentApproval && rejectReason) {
      onReject(currentApproval.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setCurrentApproval(null);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center relative"
          >
            <Plus className="w-6 h-6" />
            {pendingApprovals.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingApprovals.length}
              </span>
            )}
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-80">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 flex items-center justify-between">
              <h3 className="text-white font-semibold">Acciones Rápidas</h3>
              <button onClick={() => setIsExpanded(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="p-4 space-y-3">
              {/* Crear nuevo */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onNewCuna}
                  className="p-3 bg-blue-50 rounded-xl flex flex-col items-center gap-1 hover:bg-blue-100 transition-colors"
                >
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Nueva Cuña</span>
                </button>
                <button
                  onClick={onNewDigital}
                  className="p-3 bg-purple-50 rounded-xl flex flex-col items-center gap-1 hover:bg-purple-100 transition-colors"
                >
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Digital</span>
                </button>
              </div>

              {/* Grabar audio */}
              <div className="border-t pt-3">
                <p className="text-xs text-slate-500 mb-2">Grabar mención rápida</p>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      <span className="font-medium">{formatTime(recordingTime)} - Tap para detener</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span className="font-medium">Grabar Audio</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pending approvals */}
              {pendingApprovals.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pendientes de aprobación ({pendingApprovals.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {pendingApprovals.map(approval => (
                      <div key={approval.id} className="bg-amber-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-mono text-xs text-amber-600">{approval.codigo}</p>
                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{approval.nombre}</p>
                            <p className="text-xs text-slate-500">{approval.anunciante}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(approval)}
                            className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleStartReject(approval)}
                            className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-md">
            <div className="p-4 border-b">
              <h4 className="font-semibold text-slate-800">Motivo del rechazo</h4>
              <p className="text-sm text-slate-500">{currentApproval?.codigo} - {currentApproval?.nombre}</p>
            </div>
            <div className="p-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ingresa el motivo del rechazo..."
                className="w-full h-32 p-3 rounded-xl bg-slate-50 border-none resize-none text-sm"
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickActionsMobile;
