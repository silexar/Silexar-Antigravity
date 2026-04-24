'use client';

import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Maximize2, Minus } from 'lucide-react';

interface DraggableWindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title,
  isOpen,
  onClose,
  children,
  initialWidth = 600,
  initialHeight = 400,
  initialX = 100,
  initialY = 100,
}) => {
  const dragControls = useDragControls();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (!isOpen) return null;

  return (
    <motion.div
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false} // Solo arrastrable desde el Header
      dragMomentum={false}
      initial={{ scale: 0.9, opacity: 0, x: initialX, y: initialY }}
      animate={
        isMaximized 
          ? { scale: 1, opacity: 1, x: 0, y: 0, width: '100vw', height: '100vh', borderRadius: 0 }
          : isMinimized
            ? { scale: 0.5, opacity: 0, y: '100vh' }
            : { scale: 1, opacity: 1, width: initialWidth, height: initialHeight, borderRadius: 16 }
      }
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      style={{
        position: isMaximized ? 'fixed' : 'absolute',
        top: isMaximized ? 0 : undefined,
        left: isMaximized ? 0 : undefined,
        zIndex: 50,
        minWidth: 300,
        minHeight: 200,
      }}
      className={`
        bg-[#EAF0F6] overflow-hidden flex flex-col
        shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff]
        border border-white/50 text-slate-700
      `}
    >
      {/* HEADER - Zona de arrastre */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="h-12 border-b border-gray-300/30 flex justify-between items-center px-4 cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="font-bold text-slate-700 truncate mr-4">{title}</div>
        <div className="flex gap-2 shrink-0">
          {/* Botones estilo Apple / OS */}
          <button 
            onClick={() => setIsMinimized(true)} 
            className="w-3.5 h-3.5 rounded-full bg-amber-400 hover:bg-amber-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center group"
          >
            <Minus className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)} 
            className="w-3.5 h-3.5 rounded-full bg-emerald-400 hover:bg-emerald-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center group"
          >
            <Maximize2 className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button 
            onClick={onClose} 
            className="w-3.5 h-3.5 rounded-full bg-red-400 hover:bg-red-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center group"
          >
            <X className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
      </div>
      
      {/* BODY - Con Scroll */}
      <div className="flex-1 overflow-auto p-6 bg-[#EAF0F6]">
        {children}
      </div>
      
      {/* RESIZER - Ángulo inferior derecho */}
      {!isMaximized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent" />
      )}
    </motion.div>
  );
};
