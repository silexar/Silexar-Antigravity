/**
 * 🔔 Toast Notifications - Enterprise 2050
 * 
 * Sistema de notificaciones toast para feedback visual inmediato.
 * Incluye variantes, animaciones y control de tiempo.
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

// ==================== TIPOS ====================

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'destructive' | 'default'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Exported types for compatibility with use-toast.ts
export type ToastProps = Partial<Toast>
export type ToastActionElement = React.ReactElement

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void
  dismissToast: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// ==================== PROVIDER ====================

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((
    message: string, 
    variant: ToastVariant = 'info', 
    duration: number = 4000
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`
    
    const newToast: Toast = { id, message, variant, duration }
    setToasts(prev => [...prev, newToast])

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }, [dismissToast])

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const error = useCallback((message: string) => showToast(message, 'error', 6000), [showToast])
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast])
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast])

  const value: ToastContextType = {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

// ==================== HOOK ====================

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}

// ==================== TOAST CONTAINER ====================

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// ==================== TOAST ITEM ====================

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const config = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      text: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      text: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      text: 'text-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      text: 'text-blue-800'
    },
    destructive: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      text: 'text-red-800'
    },
    default: {
      bg: 'bg-gray-50 border-gray-200',
      icon: <Info className="h-5 w-5 text-gray-600" />,
      text: 'text-gray-800'
    }
  }

  const { bg, icon, text } = config[toast.variant] ?? config.default

  return (
    <div
      className={`
        ${bg} border rounded-lg shadow-lg p-4 pr-10 relative
        animate-in slide-in-from-right-5 fade-in duration-300
        min-w-[280px]
      `}
    >
      <div className="flex items-start gap-3">
        {icon}
        <p className={`text-sm font-medium ${text}`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2 right-2 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </button>
    </div>
  )
}

export default ToastProvider