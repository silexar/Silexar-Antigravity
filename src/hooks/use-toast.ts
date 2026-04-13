import { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: { altText: string; onClick: () => void };
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: { altText: string; onClick: () => void };
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = (): string => {
    return `toast_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  };

  const toast = useCallback((options: string | ToastOptions) => {
    // Handle invalid/null input gracefully
    if (options === null || options === undefined) {
      return;
    }

    const id = generateId();
    
    // If string is passed, treat it as title
    const toastOptions: ToastOptions = typeof options === 'string' 
      ? { title: options } 
      : options;

    const newToast: Toast = {
      id,
      title: toastOptions.title,
      description: toastOptions.description,
      variant: toastOptions.variant || 'default',
      action: toastOptions.action,
      duration: toastOptions.duration || 3000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration (default 3 seconds)
    const duration = toastOptions.duration || 3000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      // Dismiss specific toast
      setToasts(prev => prev.filter(t => t.id !== toastId));
    } else {
      // Dismiss all toasts
      setToasts([]);
    }
  }, []);

  return { toasts, toast, dismiss };
};

export default useToast;
