import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { neuromorphicStyles } from './neuromorphic';

export interface NeuromorphicWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: number | string;
  className?: string;
  icon?: React.ReactNode;
}

export const NeuromorphicWindow: React.FC<NeuromorphicWindowProps> = ({
  title,
  isOpen,
  onClose,
  children,
  defaultPosition = { x: 50, y: 50 },
  width = 600,
  className,
  icon,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Bring to front effect
  const [zIndex, setZIndex] = useState(50);

  const handleFocus = () => {
    // Basic logic to bring window to front by increasing z-index locally
    setZIndex(prev => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           // When framer-motion drag is true, the element needs to be absolute or fixed
          drag={!isFullscreen && !isMinimized}
          dragConstraints={containerRef} // For bounded dragging, we'd pass a bounds ref, but omitting allows free drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.95, ...defaultPosition }}
          animate={{
            opacity: 1,
            scale: 1,
            x: isFullscreen ? 0 : isMinimized ? 20 : undefined,
            y: isFullscreen ? 0 : isMinimized ? window.innerHeight - 60 : undefined,
            width: isFullscreen ? '100vw' : isMinimized ? 300 : width,
            height: isFullscreen ? '100vh' : isMinimized ? 50 : 'auto',
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onPointerDown={handleFocus}
          className={cn(
            'fixed bg-[#F0EDE8] rounded-2xl flex flex-col overflow-hidden',
            // Tier 0 Neumorphism glowing embossed shadow
            'shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff]',
            'border border-white/40 backdrop-blur-sm',
            className
          )}
          style={{ 
            zIndex, 
            transformOrigin: 'top left',
            maxWidth: '100vw',
            maxHeight: '100vh'
          }}
        >
          {/* Header OS-like Bar */}
          <div 
            className="h-14 bg-[#F0EDE8] flex items-center justify-between px-4 cursor-grab active:cursor-grabbing border-b border-white/50 shadow-[0_4px_6px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4),2px_2px_4px_rgba(0,0,0,0.1)] hover:bg-red-500 transition-colors"
                  title="Cerrar"
                  aria-label="Cerrar ventana"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); setIsFullscreen(false); }}
                  className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4),2px_2px_4px_rgba(0,0,0,0.1)] hover:bg-yellow-500 transition-colors"
                  title="Minimizar"
                  aria-label={isMinimized ? 'Restaurar ventana' : 'Minimizar ventana'}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); setIsMinimized(false); }}
                  className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4),2px_2px_4px_rgba(0,0,0,0.1)] hover:bg-emerald-500 transition-colors"
                  title="Maximizar"
                  aria-label={isFullscreen ? 'Restaurar tamaño' : 'Maximizar ventana'}
                />
              </div>
              <div className="flex items-center gap-2 pl-2">
                {icon && <span className="text-indigo-500">{icon}</span>}
                <span className="font-bold text-slate-700 tracking-tight select-none">
                  {title}
                </span>
              </div>
            </div>

            <div className="text-slate-400 pointer-events-none">
              <Move size={16} />
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div 
              className={cn(
                "p-6 overflow-y-auto bg-transparent",
                isFullscreen ? "flex-1" : "max-h-[80vh]"
              )}
            >
              {children}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
