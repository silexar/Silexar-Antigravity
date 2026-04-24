/**
 * COMPONENTS: NEUMORPHIC UI - TIER 0
 *
 * Componentes de interfaz con diseño neumórfico para el módulo Cuñas.
 * Implementa el principio de mobile-first para todas las vistas.
 */

import React from 'react';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={`
        ${paddingClasses[padding]} 
        rounded-2xl 
        bg-light-surface
        shadow-neumorphic-inset
        dark:bg-dark-surface
        ${className}
      `}
      style={{
        background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
        boxShadow: 'inset 8px 8px 16px #d1d1d1, inset -8px -8px 16px #ffffff',
      }}
    >
      {children}
    </div>
  );
};

interface NeumorphicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantColors = {
    primary: {
      bg: 'bg-primary',
      text: 'text-white',
      shadow: 'shadow-neumorphic-outset'
    },
    secondary: {
      bg: 'bg-secondary',
      text: 'text-gray-800',
      shadow: 'shadow-neumorphic-outset'
    },
    success: {
      bg: 'bg-success',
      text: 'text-white',
      shadow: 'shadow-neumorphic-outset'
    },
    danger: {
      bg: 'bg-danger',
      text: 'text-white',
      shadow: 'shadow-neumorphic-outset'
    }
  };

  const { bg, text, shadow } = variantColors[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} 
        ${bg} 
        ${text} 
        ${shadow} 
        rounded-xl 
        font-medium 
        transition-all 
        duration-200
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        background: variant === 'primary' 
          ? 'linear-gradient(145deg, #8a8a8a, #ffffff)'
          : 'linear-gradient(145deg, #e6e6e6, #ffffff)',
        boxShadow: '10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff',
      }}
    >
      {children}
    </button>
  );
};

interface NeumorphicInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div 
        className="flex items-center px-4 py-3 rounded-xl bg-input-surface shadow-neumorphic-inset"
        style={{
          background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
          boxShadow: 'inset 8px 8px 16px #d1d1d1, inset -8px -8px 16px #ffffff',
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 dark:text-gray-300 placeholder-gray-400"
        />
      </div>
    </div>
  );
};

interface NeumorphicSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export const NeumorphicSelect: React.FC<NeumorphicSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div 
        className="relative px-4 py-3 rounded-xl bg-input-surface shadow-neumorphic-inset"
        style={{
          background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
          boxShadow: 'inset 8px 8px 16px #d1d1d1, inset -8px -8px 16px #ffffff',
        }}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 appearance-none text-gray-700 dark:text-gray-300"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Estilos CSS para los efectos neumórficos
export const NeumorphicStyles = () => (
  <style jsx global>{`
    .bg-light-surface {
      background-color: #f0f0f0;
    }
    
    .dark .bg-dark-surface {
      background-color: #1a1a1a;
    }
    
    .bg-primary {
      background: linear-gradient(145deg, #8a8a8a, #ffffff);
    }
    
    .bg-secondary {
      background: linear-gradient(145deg, #e0e0e0, #ffffff);
    }
    
    .bg-success {
      background: linear-gradient(145deg, #4CAF50, #ffffff);
    }
    
    .bg-danger {
      background: linear-gradient(145deg, #f44336, #ffffff);
    }
    
    .bg-input-surface {
      background: linear-gradient(145deg, #e6e6e6, #ffffff);
    }
    
    .shadow-neumorphic-outset {
      box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;
    }
    
    .shadow-neumorphic-inset {
      box-shadow: inset 8px 8px 16px #d1d1d1, inset -8px -8px 16px #ffffff;
    }
    
    /* Mobile-first responsive adjustments */
    @media (max-width: 768px) {
      .rounded-2xl {
        border-radius: 1rem;
      }
      
      .p-6 {
        padding: 1rem;
      }
      
      .p-8 {
        padding: 1.5rem;
      }
    }
  `}</style>
);