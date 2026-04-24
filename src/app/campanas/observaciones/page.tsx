'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, Trash2, User, Clock, AlertCircle } from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, NeoInput, NeoSelect, NeoTextarea, NeoBadge, N } from '../_lib/neumorphic';

interface Observacion {
  id: string;
  autor: string;
  rol: string;
  campanaId: string;
  texto: string;
  fecha: string;
  tipo: 'general' | 'urgente' | 'tecnico' | 'comercial';
}

const MOCK_OBS: Observacion[] = [
  { id: '1', autor: 'Ana García', rol: 'Ejecutiva', campanaId: 'CAM-2025-0015', texto: 'Cliente solicita cambio de horario en bloque Prime Tarde. Pendiente confirmación de traffic.', fecha: new Date(Date.now() - 3600000).toISOString(), tipo: 'urgente' },
  { id: '2', autor: 'Carlos Mendoza', rol: 'Traffic', campanaId: 'CAM-2025-0012', texto: 'Material recibido y validado. Listo para programación.', fecha: new Date(Date.now() - 86400000).toISOString(), tipo: 'tecnico' },
  { id: '3', autor: 'María López', rol: 'Gerente', campanaId: 'CAM-2025-0018', texto: 'Revisar cumplimiento de la campaña antes de cierre de mes.', fecha: new Date(Date.now() - 172800000).toISOString(), tipo: 'comercial' },
  { id: '4', autor: 'Pedro Soto', rol: 'Ejecutivo', campanaId: 'CAM-2025-0015', texto: 'Agencia creativa envió nueva versión del spot. Revisar aprobación.', fecha: new Date(Date.now() - 200000000).toISOString(), tipo: 'general' },
];

export default function ObservacionesPage() {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState<Observacion[]>(MOCK_OBS);
  const [nuevaObs, setNuevaObs] = useState('');
  const [tipoNueva, setTipoNueva] = useState<Observacion['tipo']>('general');
  const [campanaFilter, setCampanaFilter] = useState('');
  const [autor, setAutor] = useState('');

  const tipoColor = (t: string) => {
    const map: Record<string, string> = { general: 'blue', urgente: 'red', tecnico: 'purple', comercial: 'green' };
    return map[t] || 'gray';
  };

  const handleEnviar = () => {
    if (!nuevaObs.trim()) return;
    const obs: Observacion = {
      id: Date.now().toString(),
      autor: autor || 'Usuario Actual',
      rol: 'Ejecutivo',
      campanaId: campanaFilter || 'GENERAL',
      texto: nuevaObs,
      fecha: new Date().toISOString(),
      tipo: tipoNueva,
    };
    setObservaciones([obs, ...observaciones]);
    setNuevaObs('');
  };

  const handleEliminar = (id: string) => {
    setObservaciones(prev => prev.filter(o => o.id !== id));
  };

  const filtradas = observaciones.filter(o => {
    const matchCampana = !campanaFilter || o.campanaId.toLowerCase().includes(campanaFilter.toLowerCase());
    return matchCampana;
  });

  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-[1900px] mx-auto space-y-5">
        <NeoPageHeader
          title="Observaciones Colaborativas"
          subtitle="Comunicación en tiempo real entre equipos ejecutivo, traffic y finanzas"
          icon={MessageSquare}
          backHref="/campanas"
        />

        {/* Nueva Observación */}
        <NeoCard>
          <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: N.text }}>
            <Send className="h-4 w-4" style={{ color: N.accent }} />
            Nueva Observación
          </h3>
          <div className="grid md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Autor</label>
              <NeoInput placeholder="Tu nombre..." value={autor} onChange={e => setAutor(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Campaña</label>
              <NeoInput placeholder="CAM-2025-XXXX" value={campanaFilter} onChange={e => setCampanaFilter(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Tipo</label>
              <NeoSelect value={tipoNueva} onChange={e => setTipoNueva(e.target.value as Observacion['tipo'])}>
                <option value="general">General</option>
                <option value="urgente">Urgente</option>
                <option value="tecnico">Técnico</option>
                <option value="comercial">Comercial</option>
              </NeoSelect>
            </div>
            <div className="flex items-end">
              <NeoButton variant="primary" onClick={handleEnviar} className="w-full">
                <Send className="h-4 w-4" /> Publicar
              </NeoButton>
            </div>
          </div>
          <NeoTextarea
            placeholder="Escribe tu observación, instrucción o alerta para el equipo..."
            value={nuevaObs}
            onChange={e => setNuevaObs(e.target.value)}
            rows={3}
          />
        </NeoCard>

        {/* Lista */}
        <NeoCard padding="none">
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: `${N.dark}40` }}>
            <h3 className="text-sm font-black flex items-center gap-2" style={{ color: N.text }}>
              <MessageSquare className="h-4 w-4" style={{ color: N.accent }} />
              Conversaciones ({filtradas.length})
            </h3>
            {campanaFilter && (
              <NeoButton variant="ghost" size="sm" onClick={() => setCampanaFilter('')}>
                Limpiar filtro
              </NeoButton>
            )}
          </div>
          <div className="divide-y" style={{ borderColor: `${N.dark}30` }}>
            {filtradas.map(obs => (
              <div key={obs.id} className="p-4 hover:bg-[#6888ff04] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <NeoBadge color={tipoColor(obs.tipo) as any}>{obs.tipo}</NeoBadge>
                      <span className="text-xs font-bold flex items-center gap-1" style={{ color: N.text }}>
                        <User className="h-3 w-3" /> {obs.autor}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: N.base, boxShadow: `inset 1px 1px 2px ${N.dark}, inset -1px -1px 2px ${N.light}`, color: N.textSub }}>
                        {obs.rol}
                      </span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: N.textSub }}>
                        <Clock className="h-3 w-3" /> {new Date(obs.fecha).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1" style={{ color: N.text }}>
                      {obs.campanaId !== 'GENERAL' && (
                        <span className="font-mono text-xs mr-2 px-1.5 py-0.5 rounded" style={{ background: `${N.accent}15`, color: N.accent }}>{obs.campanaId}</span>
                      )}
                      {obs.texto}
                    </div>
                  </div>
                  <NeoButton variant="ghost" size="icon" onClick={() => handleEliminar(obs.id)} title="Eliminar">
                    <Trash2 className="h-3.5 w-3.5" style={{ color: '#ef4444' }} />
                  </NeoButton>
                </div>
              </div>
            ))}
            {filtradas.length === 0 && (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" style={{ color: N.textSub }} />
                <p className="text-sm" style={{ color: N.textSub }}>No hay observaciones. Sé el primero en comentar.</p>
              </div>
            )}
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
