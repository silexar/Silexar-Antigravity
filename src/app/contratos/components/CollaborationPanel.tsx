/**
 * 👥 SILEXAR PULSE - Collaboration Panel TIER 0
 * 
 * @description Panel de colaboración en tiempo real que muestra:
 * - Usuarios conectados
 * - Actividad en vivo
 * - Comentarios
 * - Cambios en tiempo real
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Send,
  Smile,
  AtSign,
  Check,
  ChevronRight,
  Circle
} from 'lucide-react';
import {
  useCollaboration,
  type UsuarioConectado,
  type Comentario,
  type CollaborationEvent
} from '../nuevo/components/WizardContrato/services/CollaborationService';

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    border border-slate-200/30
  `,
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-lg
    shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    px-3 py-2 text-sm
  `,
  btn: `
    bg-gradient-to-br from-slate-50 to-slate-100
    text-slate-700 font-medium rounded-lg
    shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]
    hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-2 py-0.5 rounded-md
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getActividadLabel = (actividad: UsuarioConectado['actividad']) => {
  switch (actividad) {
    case 'viewing': return 'Viendo';
    case 'editing': return 'Editando';
    case 'commenting': return 'Comentando';
    case 'approving': return 'Aprobando';
    default: return 'Inactivo';
  }
};

const getActividadIcon = (actividad: UsuarioConectado['actividad']) => {
  switch (actividad) {
    case 'viewing': return <Eye className="w-3 h-3" />;
    case 'editing': return <Edit className="w-3 h-3" />;
    case 'commenting': return <MessageSquare className="w-3 h-3" />;
    case 'approving': return <CheckCircle className="w-3 h-3" />;
    default: return <Clock className="w-3 h-3" />;
  }
};

const tiempoRelativo = (fecha: Date) => {
  const ahora = new Date();
  const diff = ahora.getTime() - fecha.getTime();
  const minutos = Math.floor(diff / 60000);
  
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos}m`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas}h`;
  return fecha.toLocaleDateString();
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CollaborationPanel({
  contratoId,
  usuarioActual,
  seccionActual = 'general',
  minimizado = false,
  onMinimizar
}: {
  contratoId: string;
  usuarioActual: { id: string; nombre: string; email: string };
  seccionActual?: string;
  minimizado?: boolean;
  onMinimizar?: (min: boolean) => void;
}) {
  const collab = useCollaboration(contratoId);
  
  const [usuarios, setUsuarios] = useState<UsuarioConectado[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [tab, setTab] = useState<'usuarios' | 'comentarios'>('usuarios');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_eventos, setEventos] = useState<CollaborationEvent[]>([]);

  // Conectar al montar
  useEffect(() => {
    collab.conectar(usuarioActual);
    
    const unsub = collab.suscribir((evento) => {
      setEventos(prev => [...prev.slice(-20), evento]);
      
      // Actualizar estado según evento
      if (evento.tipo === 'usuario_conectado' || evento.tipo === 'usuario_desconectado') {
        setUsuarios(collab.getUsuarios());
      }
      if (evento.tipo === 'comentario_agregado' || evento.tipo === 'comentario_resuelto') {
        setComentarios(collab.getComentarios());
      }
    });

    // Cargar estado inicial
    setUsuarios(collab.getUsuarios());
    setComentarios(collab.getComentarios());

    return () => {
      unsub();
      collab.desconectar(usuarioActual.id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contratoId]);

  const handleEnviarComentario = () => {
    if (!nuevoComentario.trim()) return;
    
    collab.agregarComentario(seccionActual, nuevoComentario, usuarioActual);
    setNuevoComentario('');
    setComentarios(collab.getComentarios());
  };

  if (minimizado) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => onMinimizar?.(false)}
        className={`${neuro.panel} p-3 fixed bottom-6 left-6 z-40`}
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <div className="flex -space-x-2">
            {usuarios.slice(0, 3).map(u => (
              <div
                key={u.id}
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: u.color }}
              >
                {u.nombre.charAt(0)}
              </div>
            ))}
          </div>
          {comentarios.filter(c => !c.resuelto).length > 0 && (
            <span className={`${neuro.badge} bg-red-100 text-red-700`}>
              {comentarios.filter(c => !c.resuelto).length}
            </span>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${neuro.panel} w-72 flex flex-col max-h-[70vh]`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-sm text-slate-800">Colaboración</span>
            <span className={`${neuro.badge} bg-green-100 text-green-700`}>
              {usuarios.length} online
            </span>
          </div>
          <button 
            onClick={() => onMinimizar?.(true)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTab('usuarios')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === 'usuarios' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setTab('comentarios')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all relative ${
              tab === 'comentarios' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Comentarios
            {comentarios.filter(c => !c.resuelto).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {comentarios.filter(c => !c.resuelto).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {tab === 'usuarios' ? (
            <motion.div
              key="usuarios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {usuarios.map(usuario => (
                <div key={usuario.id} className={`${neuro.card} p-3`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: usuario.color }}
                      >
                        {usuario.nombre.charAt(0)}
                      </div>
                      <Circle 
                        className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-green-500 fill-green-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">{usuario.nombre}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        {getActividadIcon(usuario.actividad)}
                        <span>{getActividadLabel(usuario.actividad)}</span>
                        {usuario.seccionActual && (
                          <span className="text-slate-400">• {usuario.seccionActual}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {usuarios.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Solo tú conectado</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="comentarios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {comentarios.map(com => (
                <div 
                  key={com.id} 
                  className={`${neuro.card} p-3 ${com.resuelto ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: '#6366f1' }}
                    >
                      {com.autorNombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800">
                          {com.autorNombre}
                        </span>
                        <span className="text-xs text-slate-400">
                          {tiempoRelativo(com.fechaCreacion)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {com.texto.split(/(@\w+)/g).map((part, i) => 
                          part.startsWith('@') ? (
                            <span key={i} className="text-indigo-600 font-medium">{part}</span>
                          ) : part
                        )}
                      </p>
                      
                      {/* Reacciones */}
                      {com.reacciones.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {Object.entries(
                            com.reacciones.reduce((acc, r) => {
                              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([emoji, count]) => (
                            <span key={emoji} className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {emoji} {count}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex items-center gap-2 mt-2">
                        <button className="text-xs text-slate-400 hover:text-slate-600">
                          Responder
                        </button>
                        {!com.resuelto && (
                          <button className="text-xs text-green-500 hover:text-green-600 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Resolver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {comentarios.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin comentarios</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input de comentario */}
      {tab === 'comentarios' && (
        <div className="p-4 border-t border-slate-200/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoComentario}
              onChange={e => setNuevoComentario(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnviarComentario()}
              placeholder="Escribe un comentario..."
              className={`${neuro.input} flex-1`}
            />
            <button
              onClick={handleEnviarComentario}
              disabled={!nuevoComentario.trim()}
              className={`${neuro.btn} p-2 disabled:opacity-50`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button className="text-slate-400 hover:text-slate-600">
              <Smile className="w-4 h-4" />
            </button>
            <button className="text-slate-400 hover:text-indigo-600">
              <AtSign className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
