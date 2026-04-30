'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

export interface FloatingWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: ReactNode;
  subtitle?: string;
  badge?: { text: string; color?: string };
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  children: ReactNode;
  showVentanaButton?: boolean;
  onVentanaClick?: () => void;
  zIndex?: number;
  /** Si true, cierra con tecla Escape */
  closeOnEscape?: boolean;
}

export function FloatingWindow({
  isOpen,
  onClose,
  title,
  titleIcon,
  subtitle,
  badge,
  defaultWidth = 800,
  defaultHeight = 600,
  minWidth = 480,
  minHeight = 320,
  children,
  showVentanaButton = true,
  onVentanaClick,
  zIndex = 60,
  closeOnEscape = true,
}: FloatingWindowProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const resizing = useRef(false);
  const resizeDir = useRef<'se' | 'sw' | 'ne' | 'nw'>('se');
  const resizeStart = useRef({
    x: 0,
    y: 0,
    width: defaultWidth,
    height: defaultHeight,
    posX: 0,
    posY: 0,
  });

  // Centrar en viewport al abrir
  useEffect(() => {
    if (isOpen) {
      const w = Math.min(defaultWidth, window.innerWidth - 80);
      const h = Math.min(defaultHeight, window.innerHeight - 80);
      setSize({ width: w, height: h });
      setPos({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
      setIsMinimized(false);
      setIsMaximized(false);
    }
  }, [isOpen, defaultWidth, defaultHeight]);

  // Escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeOnEscape, isOpen, onClose]);

  // Global mouse handlers for drag + resize
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
      if (resizing.current) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const dir = resizeDir.current;

        let newW = resizeStart.current.width;
        let newH = resizeStart.current.height;
        let newX = resizeStart.current.posX;
        let newY = resizeStart.current.posY;

        if (dir.includes('e'))
          newW = Math.max(minWidth, Math.min(window.innerWidth - 40, resizeStart.current.width + dx));
        if (dir.includes('w')) {
          const proposedW = Math.max(minWidth, resizeStart.current.width - dx);
          newW = proposedW;
          newX = resizeStart.current.posX + (resizeStart.current.width - proposedW);
        }
        if (dir.includes('s'))
          newH = Math.max(minHeight, Math.min(window.innerHeight - 40, resizeStart.current.height + dy));
        if (dir.includes('n')) {
          const proposedH = Math.max(minHeight, resizeStart.current.height - dy);
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
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [minWidth, minHeight]);

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
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: pos.x,
      posY: pos.y,
    };
  };

  const toggleMaximize = () => {
    if (!isMaximized) {
      setIsMaximized(true);
      setIsMinimized(false);
      setPos({ x: 20, y: 20 });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
    } else {
      setIsMaximized(false);
      const w = Math.min(defaultWidth, window.innerWidth - 80);
      const h = Math.min(defaultHeight, window.innerHeight - 80);
      setSize({ width: w, height: h });
      setPos({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
    }
  };

  const badgeColor = badge?.color ?? N.accent;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0"
          style={{ pointerEvents: 'none', zIndex }}
        >
          <div
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: isMinimized ? 360 : size.width,
              height: isMinimized ? 52 : size.height,
              background: N.base,
              boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}`,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.4)',
              overflow: 'hidden',
              minWidth: isMinimized ? 360 : minWidth,
              minHeight: isMinimized ? 52 : minHeight,
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
              <div className="flex items-center gap-2 min-w-0">
                {titleIcon && <span className="shrink-0" style={{ color: N.accent }}>{titleIcon}</span>}
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-sm font-bold select-none truncate" style={{ color: N.text }} title={title}>
                    {title}
                  </span>
                  {badge && (
                    <span
                      className="text-xs font-mono font-bold select-none px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ color: badgeColor, background: `${badgeColor}12` }}
                    >
                      {badge.text}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <span className="hidden sm:inline text-xs select-none truncate" style={{ color: N.textSub }}>
                    {subtitle}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {showVentanaButton && onVentanaClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVentanaClick();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 text-[11px] font-bold"
                    style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                    title="Abrir en ventana nueva"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ventana</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMaximize();
                  }}
                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                  title={isMaximized ? 'Restaurar' : 'Maximizar'}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto relative min-h-0" style={{ scrollbarWidth: 'thin' }}>
                {children}
              </div>
            )}

            {/* Resize handles */}
            {!isMinimized && !isMaximized && (
              <>
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'se')}
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                  style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderBottomRightRadius: 24 }}
                />
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
                  className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
                  style={{ background: 'linear-gradient(225deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderBottomLeftRadius: 24 }}
                />
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
                  className="absolute top-10 right-0 w-4 h-4 cursor-ne-resize z-50"
                  style={{ background: 'linear-gradient(45deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderTopRightRadius: 8 }}
                />
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
