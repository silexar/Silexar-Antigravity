/**
 * 📥 SILEXAR PULSE - Inbox de Cuñas TIER 0
 * 
 * Centro de recepción de cuñas desde email,
 * WhatsApp y FTP con detección automática
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Inbox, Mail, MessageCircle, Upload, Server, RefreshCw, Search,
  Check, Play, Building, Plus,
  FileAudio, FileText, ArrowLeft, Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ItemInbox {
  id: string;
  origen: 'email' | 'whatsapp' | 'upload_manual' | 'api' | 'ftp';
  origenDetalle: string;
  asunto: string | null;
  cuerpoMensaje: string | null;
  remitente: string;
  fechaRecepcion: string;
  adjuntos: {
    nombre: string;
    tipo: string;
    tamano: number;
    url: string;
    esAudio: boolean;
  }[];
  anuncianteDetectadoId: string | null;
  anuncianteDetectadoNombre: string | null;
  confianzaDeteccion: number;
  procesado: boolean;
  cunaCreada: boolean;
  asignadoANombre: string | null;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const OrigenIcon = ({ origen }: { origen: string }) => {
  switch (origen) {
    case 'email': return <Mail className="w-5 h-5 text-blue-500" />;
    case 'whatsapp': return <MessageCircle className="w-5 h-5 text-green-500" />;
    case 'ftp': return <Server className="w-5 h-5 text-purple-500" />;
    default: return <Upload className="w-5 h-5 text-slate-500" />;
  }
};

const OrigenBadge = ({ origen }: { origen: string }) => {
  const colors: Record<string, string> = {
    email: 'bg-blue-100 text-blue-700',
    whatsapp: 'bg-green-100 text-green-700',
    ftp: 'bg-purple-100 text-purple-700',
    upload_manual: 'bg-slate-100 text-slate-700'
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[origen] || colors.upload_manual}`}>
      {origen.toUpperCase().replace('_', ' ')}
    </span>
  );
};

const ConfianzaBadge = ({ confianza }: { confianza: number }) => {
  if (confianza === 0) return null;
  
  const color = confianza >= 90 
    ? 'bg-emerald-100 text-emerald-700' 
    : confianza >= 70 
      ? 'bg-amber-100 text-amber-700' 
      : 'bg-red-100 text-red-700';
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${color}`}>
      <Sparkles className="w-3 h-3" />
      {confianza}% match
    </span>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${diffDays} días`;
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function InboxPage() {
  const router = useRouter();
  const [items, setItems] = useState<ItemInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'procesados'>('pendientes');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemInbox | null>(null);
  const [meta, setMeta] = useState({ total: 0, pendientes: 0, procesados: 0 });

  const cargarInbox = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtro === 'pendientes') params.set('procesado', 'false');
      if (filtro === 'procesados') params.set('procesado', 'true');
      if (search) params.set('search', search);
      
      const res = await fetch(`/api/cunas/inbox?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      /* */;
    }
    setLoading(false);
  }, [filtro, search]);

  useEffect(() => {
    cargarInbox();
  }, [cargarInbox]);

  const handleCrearCuna = async (item: ItemInbox) => {
    try {
      const res = await fetch('/api/cunas/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboxId: item.id,
          anuncianteId: item.anuncianteDetectadoId,
          nombre: item.asunto || `Cuña desde ${item.origen}`
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ Cuña ${data.data.codigo} creada exitosamente`);
        cargarInbox();
        setSelectedItem(null);
      }
    } catch (error) {
      /* */;
    }
  };

  const handleDescartar = async (itemId: string) => {
    if (!confirm('¿Descartar este item?')) return;
    
    try {
      await fetch('/api/cunas/inbox', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inboxId: itemId, accion: 'descartar' })
      });
      cargarInbox();
      setSelectedItem(null);
    } catch (error) {
      /* */;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="flex h-screen">
        {/* Lista de items */}
        <div className="w-1/2 border-r bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push('/cunas')}
                aria-label="Volver a cuñas"
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Inbox className="w-7 h-7 text-blue-500" />
                  Inbox de Cuñas
                </h1>
                <p className="text-sm text-slate-500">
                  {meta.pendientes} pendientes de {meta.total} total
                </p>
              </div>
              <button
                onClick={cargarInbox}
                aria-label="Actualizar inbox"
                className="ml-auto p-2 hover:bg-slate-100 rounded-lg"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2 mb-3">
              {(['todos', 'pendientes', 'procesados'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filtro === f 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'pendientes' && meta.pendientes > 0 && (
                    <span className="ml-1 px-1.5 bg-white/20 rounded">{meta.pendientes}</span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por remitente, asunto..."
                aria-label="Buscar por remitente, asunto"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          
          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`
                  w-full p-4 text-left border-b hover:bg-slate-50 transition-colors
                  ${selectedItem?.id === item.id ? 'bg-blue-50' : ''}
                  ${item.procesado ? 'opacity-60' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <OrigenIcon origen={item.origen} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800 truncate">
                        {item.asunto || item.remitente}
                      </p>
                      {item.procesado && <Check className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{item.remitente}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <OrigenBadge origen={item.origen} />
                      {item.anuncianteDetectadoNombre && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          {item.anuncianteDetectadoNombre}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {formatTimeAgo(item.fechaRecepcion)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {items.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-400">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay items en el inbox</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Detalle del item */}
        <div className="w-1/2 flex flex-col bg-slate-50">
          {selectedItem ? (
            <>
              {/* Header detalle */}
              <div className="p-6 bg-white border-b">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {selectedItem.asunto || 'Sin asunto'}
                    </h2>
                    <p className="text-slate-500">{selectedItem.remitente}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrigenBadge origen={selectedItem.origen} />
                    <ConfianzaBadge confianza={selectedItem.confianzaDeteccion} />
                  </div>
                </div>
                
                {selectedItem.anuncianteDetectadoNombre && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                    <Building className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-purple-700">Anunciante detectado</p>
                      <p className="text-purple-600">{selectedItem.anuncianteDetectadoNombre}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Mensaje */}
                {selectedItem.cuerpoMensaje && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Mensaje</h3>
                    <div className="p-4 bg-white rounded-xl border">
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedItem.cuerpoMensaje}</p>
                    </div>
                  </div>
                )}
                
                {/* Adjuntos */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">
                    Adjuntos ({selectedItem.adjuntos.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedItem.adjuntos.map((adj, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:border-blue-300 transition-colors"
                      >
                        {adj.esAudio ? (
                          <FileAudio className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <FileText className="w-8 h-8 text-blue-500" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{adj.nombre}</p>
                          <p className="text-sm text-slate-500">{formatFileSize(adj.tamano)}</p>
                        </div>
                        {adj.esAudio && (
                          <button aria-label="Reproducir audio" className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Acciones */}
              {!selectedItem.procesado && (
                <div className="p-4 bg-white border-t flex gap-3">
                  <button
                    onClick={() => handleDescartar(selectedItem.id)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => handleCrearCuna(selectedItem)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Cuña
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Selecciona un item para ver los detalles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
