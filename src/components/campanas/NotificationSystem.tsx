/**
 * 🔔 NotificationSystem - Sistema de notificaciones browser
 * @enterprise Enterprise 2050
 */

/* eslint-disable react-refresh/only-export-components */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  campanaId?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [permiso, setPermiso] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermiso(Notification.permission)
    }
  }, [])

  const solicitarPermiso = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermiso(result)
      return result === 'granted'
    }
    return false
  }, [])

  const enviarNotificacion = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotif, ...prev].slice(0, 50))

    // Browser notification
    if (permiso === 'granted' && 'Notification' in window) {
      new Notification(notif.title, {
        body: notif.message,
        icon: '/favicon.ico',
        tag: newNotif.id
      })
    }

    return newNotif.id
  }, [permiso])

  const marcarLeida = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const marcarTodasLeidas = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const eliminar = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const noLeidas = notifications.filter(n => !n.read).length

  return {
    notifications, noLeidas, permiso,
    solicitarPermiso, enviarNotificacion, marcarLeida, marcarTodasLeidas, eliminar
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDelete: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ notifications, onMarkRead, onMarkAllRead, onDelete, isOpen, onClose }: NotificationCenterProps) {
  if (!isOpen) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border z-50 animate-in slide-in-from-top-2">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold">🔔 Notificaciones</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            <Check className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="max-h-80 overflow-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-gray-500 text-sm">Sin notificaciones</p>
        ) : (
          notifications.slice(0, 10).map(n => (
            <div 
              key={n.id} 
              className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => onMarkRead(n.id)}
            >
              <div className="flex items-start gap-2">
                {getIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 truncate">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {n.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onDelete(n.id) }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
