/**
 * 📋 ContextMenuCampana - Menu contextual click derecho
 * @enterprise Enterprise 2050
 */

/* eslint-disable react-refresh/only-export-components */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Star, Eye, Copy, Trash2, UserPlus, ExternalLink, Download, Edit } from 'lucide-react'

interface MenuPosition { x: number; y: number }

interface ContextMenuProps {
  campanaId: string | null
  position: MenuPosition | null
  onClose: () => void
  onAction: (action: string, id: string) => void
  isFavorito?: boolean
}

export function ContextMenuCampana({ campanaId, position, onClose, onAction, isFavorito }: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose()
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  if (!position || !campanaId) return null

  const items = [
    { id: 'open', label: 'Abrir campaña', icon: ExternalLink, shortcut: 'Enter' },
    { id: 'quickview', label: 'Vista rápida', icon: Eye, shortcut: 'Space' },
    { id: 'divider1' },
    { id: 'favorite', label: isFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos', icon: Star },
    { id: 'edit', label: 'Editar', icon: Edit },
    { id: 'duplicate', label: 'Duplicar', icon: Copy, shortcut: 'Ctrl+D' },
    { id: 'divider2' },
    { id: 'assign', label: 'Asignar ejecutivo', icon: UserPlus },
    { id: 'export', label: 'Exportar', icon: Download },
    { id: 'divider3' },
    { id: 'delete', label: 'Eliminar', icon: Trash2, danger: true }
  ]

  return (
    <div 
      className="fixed z-[100] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => 
        item.id.startsWith('divider') ? (
          <div key={`${item}-${i}`} className="h-px bg-gray-200 dark:bg-slate-700 my-1" />
        ) : (
          <button
            key={item.id}
            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 dark:text-gray-200'}`}
            onClick={() => { onAction(item.id, campanaId); onClose() }}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <kbd className="text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-600 px-1 rounded">{item.shortcut}</kbd>}
          </button>
        )
      )}
    </div>
  )
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{ id: string; pos: MenuPosition } | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setContextMenu({ id, pos: { x: e.clientX, y: e.clientY } })
  }, [])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  return { contextMenu, handleContextMenu, closeContextMenu }
}
