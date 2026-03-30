import React from 'react';
import { cn } from '@/lib/utils';

// Base neuromorphic styles
export const neuromorphicStyles = {
  base: 'bg-[#F0EDE8] text-slate-700 font-sans',
  embossed: 'shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]',
  debossed: 'shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]',
  glow: 'shadow-[12px_12px_24px_#d1d5db,-12px_-12px_24px_#ffffff] border border-white/50',
  pulse: 'animate-pulse shadow-[0_0_30px_rgba(79,70,229,0.4)]',
};

// Neuromorphic Card Component
export interface NeuromorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'embossed' | 'debossed' | 'glow' | 'pulse';
  borderAccent?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  children: React.ReactNode;
}

export const NeuromorphicCard: React.FC<NeuromorphicCardProps> = ({
  className,
  variant = 'embossed',
  borderAccent,
  children,
  ...props
}) => {
  const borderColor = borderAccent ? `border-${borderAccent}-500/30` : '';
  
  return (
    <div
      className={cn(
        neuromorphicStyles.base,
        neuromorphicStyles[variant],
        borderColor,
        'rounded-xl transition-all duration-300 hover:scale-[1.01]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Neuromorphic Button Component
export interface NeuromorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const NeuromorphicButton: React.FC<NeuromorphicButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: `
      bg-[#F0EDE8]
      text-indigo-600 font-bold
      shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
      hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
      active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-[#F0EDE8]
      text-slate-600 font-medium
      shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
      hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
      active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]
    `,
    danger: `
      bg-[#F0EDE8]
      text-red-600 font-bold
      shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
      hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
      active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]
    `,
    success: `
      bg-[#F0EDE8]
      text-emerald-600 font-bold
      shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
      hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
      active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]
    `,
  };

  return (
    <button
      className={cn(
        'relative rounded-lg font-semibold transition-all duration-200',
        'transform hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <span className={cn(isLoading && 'opacity-0')}>{children}</span>
    </button>
  );
};

// Neuromorphic Input Component
export interface NeuromorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const NeuromorphicInput: React.FC<NeuromorphicInputProps> = ({
  className,
  label,
  error,
  icon,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full bg-[#F0EDE8] rounded-xl',
            'shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]',
            'text-slate-700 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/30',
            'transition-all duration-300',
            icon ? 'pl-10 pr-4 py-2' : 'px-4 py-2',
            error && 'ring-2 ring-red-400/50',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

// Neuromorphic Status Indicator
export interface NeuromorphicStatusProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const NeuromorphicStatus: React.FC<NeuromorphicStatusProps> = ({
  status,
  size = 'md',
  pulse = false,
}) => {
  const sizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]',
    offline: 'bg-slate-600',
    warning: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]',
    error: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]',
  };

  return (
    <div className={cn(
      'relative rounded-full',
      sizeStyles[size],
      statusColors[status],
      pulse && 'animate-pulse'
    )}>
      {pulse && (
        <div className={cn(
          'absolute inset-0 rounded-full animate-ping',
          statusColors[status].replace('shadow-', ''),
          'opacity-75'
        )} />
      )}
    </div>
  );
};

// Neuromorphic Grid Layout
export interface NeuromorphicGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
}

export const NeuromorphicGrid: React.FC<NeuromorphicGridProps> = ({
  className,
  children,
  columns = 3,
  gap = 'md',
  ...props
}) => {
  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const gridStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid',
        gapStyles[gap],
        gridStyles[columns as keyof typeof gridStyles],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Neuromorphic Container Component
export const NeuromorphicContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        neuromorphicStyles.base,
        'rounded-xl shadow-lg backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Neuromorphic State Hook
export const useNeuromorphicState = () => {
  const [state, setState] = React.useState({
    consciousness: 'BASELINE',
    awareness: 0,
    prediction: 0,
    transcendence: 0,
    isReady: false
  });

  React.useEffect(() => {
    // Simular inicialización
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, isReady: true }));
      
      // Simular evolución de conciencia
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          awareness: Math.min(1, prev.awareness + 0.05),
          prediction: Math.min(1, prev.prediction + 0.03),
          transcendence: Math.min(1, prev.transcendence + 0.01),
          consciousness: prev.awareness > 0.8 ? 'TRANSCENDENT' : 
                        prev.awareness > 0.6 ? 'PREDICTIVE' :
                        prev.awareness > 0.4 ? 'ADAPTIVE' :
                        prev.awareness > 0.2 ? 'AWARE' : 'BASELINE'
        }));
      }, 2000);

      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return state;
};

export default {
  NeuromorphicCard,
  NeuromorphicButton,
  NeuromorphicInput,
  NeuromorphicStatus,
  NeuromorphicGrid,
  NeuromorphicContainer,
  useNeuromorphicState
};