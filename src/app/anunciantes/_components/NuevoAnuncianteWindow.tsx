'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { AnuncianteForm, AnuncianteFormData } from './AnuncianteForm';
import { toast } from '@/components/ui/use-toast';

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

const LS_KEY = 'silexar_anunciantes';

const IVA_POR_PAIS: Record<string, number> = {
  Chile: 19, Argentina: 21, Perú: 18, Colombia: 19, México: 16,
  España: 21, Brasil: 17, Uruguay: 22, 'Estados Unidos': 0,
};
const getIvaPorPais = (pais: string): number => IVA_POR_PAIS[pais] ?? 0;

interface NuevoAnuncianteWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NuevoAnuncianteWindow({ isOpen, onClose, onSuccess }: NuevoAnuncianteWindowProps) {
  // Position & size state
  const [pos, setPos] = useState({ x: 80, y: 60 });
  const [size, setSize] = useState({ width: 920, height: 720 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Drag state
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resize state
  const resizing = useRef(false);
  const resizeDir = useRef<'se' | 'sw' | 'ne' | 'nw'>('se');
  const resizeStart = useRef({ x: 0, y: 0, width: 920, height: 720, posX: 80, posY: 60 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Window center on open
  useEffect(() => {
    if (isOpen) {
      const w = Math.min(920, window.innerWidth - 80);
      const h = Math.min(720, window.innerHeight - 80);
      setSize({ width: w, height: h });
      setPos({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
    }
  }, [isOpen]);

  // Global mouse handlers for drag & resize
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
      }
      if (resizing.current) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const dir = resizeDir.current;

        let newW = resizeStart.current.width;
        let newH = resizeStart.current.height;
        let newX = resizeStart.current.posX;
        let newY = resizeStart.current.posY;

        if (dir.includes('e')) newW = Math.max(520, Math.min(window.innerWidth - 40, resizeStart.current.width + dx));
        if (dir.includes('w')) {
          const proposedW = Math.max(520, resizeStart.current.width - dx);
          newW = proposedW;
          newX = resizeStart.current.posX + (resizeStart.current.width - proposedW);
        }
        if (dir.includes('s')) newH = Math.max(400, Math.min(window.innerHeight - 40, resizeStart.current.height + dy));
        if (dir.includes('n')) {
          const proposedH = Math.max(400, resizeStart.current.height - dy);
          newH = proposedH;
          newY = resizeStart.current.posY + (resizeStart.current.height - proposedH);
        }

        setSize({ width: newW, height: newH });
        setPos({ x: newX, y: newY });
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizing.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  const onResizeMouseDown = (e: React.MouseEvent, dir: 'se' | 'sw' | 'ne' | 'nw') => {
    e.stopPropagation();
    e.preventDefault();
    resizing.current = true;
    resizeDir.current = dir;
    resizeStart.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height, posX: pos.x, posY: pos.y };
  };

  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => {
      if (!prev) {
        // Store previous before maximizing
        setPos({ x: 20, y: 20 });
        setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      } else {
        // Restore
        const w = Math.min(920, window.innerWidth - 80);
        const h = Math.min(720, window.innerHeight - 80);
        setSize({ width: w, height: h });
        setPos({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
      }
      return !prev;
    });
    setIsMinimized(false);
  }, []);

  const handleCreate = async (data: AnuncianteFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existing = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
      const newRecord = {
        ...data,
        id: `local-${Date.now()}`,
        codigo: `ANC-${String(existing.length + 1).padStart(4, '0')}`,
        activo: true,
        estado: 'activo',
        fechaCreacion: new Date().toISOString(),
        ivaPorcentaje: data.ivaPorcentaje ?? getIvaPorPais(data.pais),
      };
      localStorage.setItem(LS_KEY, JSON.stringify([...existing, newRecord]));
      toast({ title: '✅ Anunciante creado exitosamente', description: `${String(data.nombreRazonSocial)} ha sido registrado en el sistema.` });
      onSuccess();
      onClose();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el anunciante', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[60]"
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: isMinimized ? 320 : size.width,
              height: isMinimized ? 52 : size.height,
              background: N.base,
              boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}`,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.4)',
              overflow: 'hidden',
              minWidth: isMinimized ? 320 : 520,
              minHeight: isMinimized ? 52 : 400,
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: 'calc(100vh - 40px)',
            }}
          >
            {/* Header OS */}
            <div
              onMouseDown={onHeaderMouseDown}
              className="flex items-center justify-between px-5 py-3 border-b border-[#bec8de]/40 cursor-grab active:cursor-grabbing shrink-0 select-none"
              style={{ background: N.base }}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-3.5 h-3.5 rounded-full transition-all hover:brightness-95"
                    style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-1px -1px 3px ${N.light}` }}
                    title="Cerrar"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(m => !m); if (isMaximized) setIsMaximized(false); }}
                    className="w-3.5 h-3.5 rounded-full transition-all hover:brightness-95"
                    style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-1px -1px 3px ${N.light}` }}
                    title={isMinimized ? 'Restaurar' : 'Minimizar'}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
                    className="w-3.5 h-3.5 rounded-full transition-all hover:brightness-95"
                    style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-1px -1px 3px ${N.light}` }}
                    title={isMaximized ? 'Restaurar tamaño' : 'Maximizar'}
                  />
                </div>
                <div className="flex items-center gap-2 pl-1">
                  <div className="p-1.5 rounded-lg" style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}>
                    <Building2 className="w-4 h-4" style={{ color: N.accent }} />
                  </div>
                  <span className="text-sm font-bold select-none" style={{ color: N.text }}>Nuevo Anunciante</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMaximize()}
                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                  title={isMaximized ? 'Restaurar' : 'Maximizar'}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body - responsive */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto neu-scrollbar min-h-0">
                <div className="w-full h-full">
                  <AnuncianteForm mode="create" onSubmit={handleCreate} isLoading={isLoading} />
                </div>
              </div>
            )}

            {/* Resize handles */}
            {!isMinimized && !isMaximized && (
              <>
                {/* SE corner */}
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'se')}
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                  style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderBottomRightRadius: 24 }}
                />
                {/* SW corner */}
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
                  className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
                  style={{ background: 'linear-gradient(225deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderBottomLeftRadius: 24 }}
                />
                {/* NE corner */}
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
                  className="absolute top-10 right-0 w-4 h-4 cursor-ne-resize z-50"
                  style={{ background: 'linear-gradient(45deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderTopRightRadius: 8 }}
                />
                {/* NW corner */}
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'nw')}
                  className="absolute top-10 left-0 w-4 h-4 cursor-nw-resize z-50"
                  style={{ background: 'linear-gradient(315deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderTopLeftRadius: 8 }}
                />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
