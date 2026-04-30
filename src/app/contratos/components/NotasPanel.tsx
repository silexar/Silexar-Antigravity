/**
 * ?? SILEXAR PULSE - Notes Panel Component TIER 0
 * 
 * @description Panel de notas y comentarios para contratos con:
 * - Notas internas y p�blicas
 * - Menciones a usuarios (@usuario)
 * - Hilos de respuestas
 * - Adjuntos
 * - Filtros y b�squeda
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Pin,
  Reply,
  MoreHorizontal,
  Paperclip,
  AtSign,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  X,
  Search,
  ChevronDown,
  User
} from 'lucide-react';

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

export type TipoNota = 'COMENTARIO' | 'INSTRUCCION' | 'ALERTA' | 'RECORDATORIO' | 'DECISION' | 'NEGOCIACION';
export type Visibilidad = 'INTERNA' | 'PUBLICA' | 'SOLO_APROBADORES';
export type Prioridad = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export interface NotaContrato {
  id: string;
  contratoId: string;
  contenido: string;
  tipoNota: TipoNota;
  visibilidad: Visibilidad;
  prioridad: Prioridad;
  usuariosMencionados?: string[];
  notaPadreId?: string;
  cantidadRespuestas: number;
  tieneAdjuntos: boolean;
  adjuntos?: { nombre: string; url: string }[];
  autor: {
    id: string;
    nombre: string;
    rol?: string;
    avatar?: string;
  };
  editado: boolean;
  fijado: boolean;
  fechaCreacion: Date;
  respuestas?: NotaContrato[];
}

export interface UsuarioMencionable {
  id: string;
  nombre: string;
  rol: string;
  avatar?: string;
}

// ---------------------------------------------------------------
// ESTILOS NEUROMORPHIC
// ---------------------------------------------------------------

const neuro = {
  panel: `
    bg-[#dfeaff]
    rounded-3xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]

    overflow-hidden
  `,
  input: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-[#6888ff]/50 focus:outline-none
    transition-all duration-200
  `,
  card: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]

  `,
  btnPrimary: `
    bg-[#6888ff]
    text-white font-semibold rounded-xl
    shadow-[3px_3px_6px_#bec8de,-3px_-3px_6px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-[#dfeaff]
    text-[#69738c] font-medium rounded-xl
    shadow-[3px_3px_6px_#bec8de,-3px_-3px_6px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-2.5 py-1 rounded-lg
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ---------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------

const mockNotas: NotaContrato[] = [
  {
    id: 'n-001',
    contratoId: 'ctr-001',
    contenido: 'Confirmar con el cliente el horario prime de 20:00 a 22:00 hrs antes de continuar con la aprobaci�n. @Ana.Garcia',
    tipoNota: 'INSTRUCCION',
    visibilidad: 'INTERNA',
    prioridad: 'ALTA',
    usuariosMencionados: ['u-003'],
    cantidadRespuestas: 2,
    tieneAdjuntos: false,
    autor: { id: 'u-004', nombre: 'Roberto Silva', rol: 'Gerente Comercial' },
    editado: false,
    fijado: true,
    fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
    respuestas: [
      {
        id: 'n-002',
        contratoId: 'ctr-001',
        contenido: 'Cliente confirm� el horario. Se puede proceder.',
        tipoNota: 'COMENTARIO',
        visibilidad: 'INTERNA',
        prioridad: 'NORMAL',
        notaPadreId: 'n-001',
        cantidadRespuestas: 0,
        tieneAdjuntos: false,
        autor: { id: 'u-003', nombre: 'Ana Garc�a', rol: 'Supervisora' },
        editado: false,
        fijado: false,
        fechaCreacion: new Date(Date.now() - 1 * 60 * 60 * 1000),
      }
    ]
  },
  {
    id: 'n-003',
    contratoId: 'ctr-001',
    contenido: '?? El cliente pidi� revisar el descuento aplicado. Adjunto email de solicitud.',
    tipoNota: 'NEGOCIACION',
    visibilidad: 'INTERNA',
    prioridad: 'URGENTE',
    cantidadRespuestas: 0,
    tieneAdjuntos: true,
    adjuntos: [{ nombre: 'email_cliente.pdf', url: '#' }],
    autor: { id: 'u-002', nombre: 'Carlos Mendoza', rol: 'Ejecutivo Senior' },
    editado: false,
    fijado: false,
    fechaCreacion: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'n-004',
    contratoId: 'ctr-001',
    contenido: 'Se aprob� el descuento adicional del 5% por decisi�n del Gerente General.',
    tipoNota: 'DECISION',
    visibilidad: 'SOLO_APROBADORES',
    prioridad: 'NORMAL',
    cantidadRespuestas: 0,
    tieneAdjuntos: false,
    autor: { id: 'u-005', nombre: 'Patricia Mu�oz', rol: 'Gerente General' },
    editado: false,
    fijado: false,
    fechaCreacion: new Date(Date.now() - 10 * 60 * 1000),
  }
];

const mockUsuarios: UsuarioMencionable[] = [
  { id: 'u-001', nombre: 'Mar�a L�pez', rol: 'Ejecutivo Junior' },
  { id: 'u-002', nombre: 'Carlos Mendoza', rol: 'Ejecutivo Senior' },
  { id: 'u-003', nombre: 'Ana Garc�a', rol: 'Supervisora' },
  { id: 'u-004', nombre: 'Roberto Silva', rol: 'Gerente Comercial' },
  { id: 'u-005', nombre: 'Patricia Mu�oz', rol: 'Gerente General' }
];

// ---------------------------------------------------------------
// COMPONENTES AUXILIARES
// ---------------------------------------------------------------

const getTipoColor = (tipo: TipoNota) => {
  switch (tipo) {
    case 'COMENTARIO': return 'bg-[#dfeaff] text-[#69738c]';
    case 'INSTRUCCION': return 'bg-[#6888ff]/10 text-[#6888ff]';
    case 'ALERTA': return 'bg-[#dfeaff] text-[#9aa3b8]';
    case 'RECORDATORIO': return 'bg-[#6888ff]/10 text-[#6888ff]';
    case 'DECISION': return 'bg-[#6888ff]/10 text-[#6888ff]';
    case 'NEGOCIACION': return 'bg-[#6888ff]/10 text-[#6888ff]';
    default: return 'bg-[#dfeaff] text-[#69738c]';
  }
};

const getPrioridadColor = (prioridad: Prioridad) => {
  switch (prioridad) {
    case 'URGENTE': return 'bg-[#dfeaff]0';
    case 'ALTA': return 'bg-[#6888ff]/50';
    case 'NORMAL': return 'bg-[#6888ff]/50';
    case 'BAJA': return 'bg-[#9aa3b8]';
    default: return 'bg-[#9aa3b8]';
  }
};

const getVisibilidadIcon = (visibilidad: Visibilidad) => {
  switch (visibilidad) {
    case 'PUBLICA': return <Eye className="w-3.5 h-3.5" />;
    case 'INTERNA': return <EyeOff className="w-3.5 h-3.5" />;
    case 'SOLO_APROBADORES': return <AlertCircle className="w-3.5 h-3.5" />;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CL');
};

// ---------------------------------------------------------------
// COMPONENTE DE NOTA INDIVIDUAL
// ---------------------------------------------------------------

const NotaCard: React.FC<{
  nota: NotaContrato;
  onReply: (notaId: string) => void;
  isReply?: boolean;
}> = ({ nota, onReply, isReply = false }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? '' : neuro.card} ${isReply ? 'ml-8 border-l-2 border-[#6888ff30] pl-4' : 'p-4'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-[#6888ff] flex items-center justify-center text-white text-sm font-bold">
            {nota.autor.nombre.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#69738c] text-sm">{nota.autor.nombre}</span>
              {nota.autor.rol && (
                <span className="text-xs text-[#9aa3b8]">{nota.autor.rol}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9aa3b8]">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(nota.fechaCreacion)}</span>
              {nota.editado && <span>(editado)</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Prioridad indicator */}
          <div className={`w-2 h-2 rounded-full ${getPrioridadColor(nota.prioridad)}`} />
          
          {/* Tipo badge */}
          <span className={`${neuro.badge} ${getTipoColor(nota.tipoNota)} text-xs`}>
            {nota.tipoNota.toLowerCase()}
          </span>
          
          {/* Visibilidad */}
          <span className="text-[#9aa3b8]" title={nota.visibilidad}>
            {getVisibilidadIcon(nota.visibilidad)}
          </span>
          
          {/* Pin */}
          {nota.fijado && (
            <Pin className="w-4 h-4 text-[#6888ff] rotate-45" />
          )}
          
          {/* Menu */}
          <div className="relative">
            <button
              aria-label="M�s opciones"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-[#dfeaff]"
            >
              <MoreHorizontal className="w-4 h-4 text-[#9aa3b8]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 text-sm text-[#69738c] leading-relaxed">
        {nota.contenido}
      </div>

      {/* Attachments */}
      {nota.tieneAdjuntos && nota.adjuntos && (
        <div className="mt-3 flex flex-wrap gap-2">
          {nota.adjuntos.map((adj) => (
            <a
              key={adj.nombre}
              href={adj.url}
              className={`${neuro.btnSecondary} px-3 py-1.5 text-xs flex items-center gap-2`}
            >
              <Paperclip className="w-3 h-3" />
              {adj.nombre}
            </a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 pt-2 border-t border-[#bec8de30]">
        <button 
          onClick={() => onReply(nota.id)}
          className="flex items-center gap-1.5 text-xs text-[#9aa3b8] hover:text-[#6888ff] transition-colors"
        >
          <Reply className="w-4 h-4" />
          Responder
        </button>
        
        {nota.cantidadRespuestas > 0 && (
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1.5 text-xs text-[#6888ff]"
          >
            <MessageSquare className="w-4 h-4" />
            {nota.cantidadRespuestas} respuesta{nota.cantidadRespuestas > 1 ? 's' : ''}
            <ChevronDown className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && nota.respuestas && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {nota.respuestas.map(respuesta => (
              <NotaCard 
                key={respuesta.id} 
                nota={respuesta} 
                onReply={onReply}
                isReply 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export default function NotasPanel({ 
  contratoId 
}: { 
  contratoId: string;
}) {
  const [notas, setNotas] = useState<NotaContrato[]>(mockNotas);
  const [nuevaNota, setNuevaNota] = useState('');
  const [tipoNota, setTipoNota] = useState<TipoNota>('COMENTARIO');
  const [visibilidad, setVisibilidad] = useState<Visibilidad>('INTERNA');
  const [prioridad, setPrioridad] = useState<Prioridad>('NORMAL');
  const [respondiendo, setRespondiendo] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoNota | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!nuevaNota.trim()) return;

    const nota: NotaContrato = {
      id: `n-${Date.now()}`,
      contratoId,
      contenido: nuevaNota,
      tipoNota,
      visibilidad,
      prioridad,
      notaPadreId: respondiendo || undefined,
      cantidadRespuestas: 0,
      tieneAdjuntos: false,
      autor: { id: 'u-current', nombre: 'Usuario Actual', rol: 'Ejecutivo' },
      editado: false,
      fijado: false,
      fechaCreacion: new Date()
    };

    setNotas(prev => [nota, ...prev]);
    setNuevaNota('');
    setRespondiendo(null);
  };

  const handleReply = (notaId: string) => {
    setRespondiendo(notaId);
    inputRef.current?.focus();
  };

  const handleMention = (usuario: UsuarioMencionable) => {
    setNuevaNota(prev => prev + `@${usuario.nombre.replace(' ', '.')} `);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const notasFiltradas = notas.filter(nota => {
    if (filtroTipo !== 'TODOS' && nota.tipoNota !== filtroTipo) return false;
    if (busqueda && !nota.contenido.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  // Ordenar: fijadas primero, luego por fecha
  const notasOrdenadas = [...notasFiltradas].sort((a, b) => {
    if (a.fijado && !b.fijado) return -1;
    if (!a.fijado && b.fijado) return 1;
    return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
  });

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-[#69738c] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#6888ff]" />
            Notas del Contrato
            <span className={`${neuro.badge} bg-[#dfeaff] text-[#6888ff]`}>
              {notas.length}
            </span>
          </h3>
          
          <div className="flex items-center gap-2">
            {/* B�squeda */}
            <div className={`${neuro.input} px-3 py-1.5 flex items-center gap-2`}>
              <Search className="w-4 h-4 text-[#9aa3b8]" />
              <input
                type="text"
                placeholder="Buscar..."
                aria-label="Buscar notas"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="bg-transparent text-sm focus:outline-none w-32"
              />
            </div>
            
            {/* Filtro tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoNota | 'TODOS')}
              className={`${neuro.input} px-3 py-1.5 text-sm`}
            >
              <option value="TODOS">Todos</option>
              <option value="COMENTARIO">Comentarios</option>
              <option value="INSTRUCCION">Instrucciones</option>
              <option value="NEGOCIACION">Negociaci�n</option>
              <option value="DECISION">Decisiones</option>
              <option value="ALERTA">Alertas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nueva nota */}
      <div className="p-6 border-b border-[#bec8de30]">
        <div className={`${neuro.input} p-4`}>
          {respondiendo && (
            <div className="mb-2 flex items-center gap-2 text-xs text-[#6888ff]">
              <Reply className="w-3 h-3" />
              Respondiendo a nota
              <button
                aria-label="Cerrar"
                onClick={() => setRespondiendo(null)}
                className="ml-auto p-0.5 hover:bg-[#dfeaff] rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <textarea
            ref={inputRef}
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Escribe una nota... (usa @ para mencionar)"
            className="w-full bg-transparent resize-none focus:outline-none text-sm"
            rows={3}
          />
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Tipo */}
              <select 
                value={tipoNota}
                onChange={(e) => setTipoNota(e.target.value as TipoNota)}
                className={`${neuro.input} px-2 py-1 text-xs`}
              >
                <option value="COMENTARIO">?? Comentario</option>
                <option value="INSTRUCCION">?? Instrucci�n</option>
                <option value="NEGOCIACION">?? Negociaci�n</option>
                <option value="DECISION">? Decisi�n</option>
                <option value="ALERTA">?? Alerta</option>
                <option value="RECORDATORIO">? Recordatorio</option>
              </select>
              
              {/* Visibilidad */}
              <select 
                value={visibilidad}
                onChange={(e) => setVisibilidad(e.target.value as Visibilidad)}
                className={`${neuro.input} px-2 py-1 text-xs`}
              >
                <option value="INTERNA">?? Interna</option>
                <option value="PUBLICA">??? P�blica</option>
                <option value="SOLO_APROBADORES">??? Solo aprobadores</option>
              </select>
              
              {/* Prioridad */}
              <select 
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as Prioridad)}
                className={`${neuro.input} px-2 py-1 text-xs`}
              >
                <option value="BAJA">?? Baja</option>
                <option value="NORMAL">?? Normal</option>
                <option value="ALTA">?? Alta</option>
                <option value="URGENTE">?? Urgente</option>
              </select>
              
              {/* Mencionar */}
              <div className="relative">
                <button
                  aria-label="Mencionar usuario"
                  onClick={() => setShowMentions(!showMentions)}
                  className={`${neuro.btnSecondary} p-1.5`}
                >
                  <AtSign className="w-4 h-4" />
                </button>
                
                {showMentions && (
                  <div className={`absolute bottom-full mb-2 left-0 ${neuro.panel} p-2 min-w-48 z-10`}>
                    {mockUsuarios.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleMention(u)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-[#dfeaff] rounded-lg flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-[#9aa3b8]" />
                        <div>
                          <p className="font-medium text-[#69738c]">{u.nombre}</p>
                          <p className="text-xs text-[#9aa3b8]">{u.rol}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Adjuntar */}
              <button aria-label="Adjuntar archivo" className={`${neuro.btnSecondary} p-1.5`}>
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!nuevaNota.trim()}
              className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50`}
            >
              <Send className="w-4 h-4" />
              Publicar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de notas */}
      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {notasOrdenadas.map(nota => (
          <NotaCard 
            key={nota.id} 
            nota={nota} 
            onReply={handleReply}
          />
        ))}
        
        {notasOrdenadas.length === 0 && (
          <div className="text-center py-12 text-[#9aa3b8]">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay notas a�n</p>
            <p className="text-sm">S� el primero en agregar una nota</p>
          </div>
        )}
      </div>
    </div>
  );
}
