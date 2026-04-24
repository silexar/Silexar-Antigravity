/**
 * ⚙️ SILEXAR PULSE - User Permissions Configuration Panel TIER 0
 * 
 * @description Panel de configuración de permisos de usuario con
 * diseño neuromorphic. Permite al admin definir límites de aprobación,
 * derechos de firma y permisos personalizados.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Settings,
  Shield,
  DollarSign,
  Check,
  X,
  Save,
  ChevronRight,
  FileSignature,
  Search,
  RefreshCw,
  UserCog,
  Briefcase,
  Building2,
  Crown,
  Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuroStyles = {
  // Contenedor principal con efecto neuromorphic
  container: `
    bg-gradient-to-br from-[#dfeaff] via-slate-50 to-[#dfeaff]
    min-h-screen
  `,
  
  // Card con sombras neuromorphic (efecto elevado)
  cardRaised: `
    bg-gradient-to-br from-[#dfeaff] to-[#dfeaff]
    rounded-3xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
    border border-[#bec8de30]/50
  `,
  
  // Card con efecto hundido
  cardInset: `
    bg-gradient-to-br from-[#dfeaff] to-[#dfeaff]
    rounded-2xl
    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
    border border-[#bec8de30]/30
  `,
  
  // Botón neuromorphic activo
  buttonActive: `
    bg-[#6888ff]
    text-white font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
  `,
  
  // Botón neuromorphic secundario
  buttonSecondary: `
    bg-gradient-to-br from-[#dfeaff] to-[#dfeaff]
    text-[#69738c] font-medium
    rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_#bec8de]
    transition-all duration-200
  `,
  
  // Input neuromorphic
  input: `
    bg-gradient-to-br from-[#dfeaff] to-[#dfeaff]
    rounded-xl
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-[#6888ff]/50
    transition-all duration-200
    px-4 py-3
    text-[#69738c]
    placeholder:text-[#9aa3b8]
  `,
  
  // Toggle switch neuromorphic
  toggle: `
    relative w-14 h-7
    bg-gradient-to-br from-slate-200 to-[#dfeaff]
    rounded-full
    shadow-[inset_2px_2px_4px_#c9cbd0,inset_-2px_-2px_4px_#ffffff]
    cursor-pointer
    transition-all duration-300
  `,
  
  toggleActive: `
    bg-gradient-to-br from-indigo-400 to-purple-500
    shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
  `,
  
  toggleKnob: `
    absolute top-1 w-5 h-5
    bg-[#dfeaff]
    rounded-full
    shadow-[2px_2px_4px_rgba(0,0,0,0.15)]
    transition-all duration-300
  `,
  
  // Slider neuromorphic
  slider: `
    w-full h-2
    bg-gradient-to-r from-slate-200 to-[#dfeaff]
    rounded-full
    shadow-[inset_1px_1px_2px_#c9cbd0,inset_-1px_-1px_2px_#ffffff]
    appearance-none
    cursor-pointer
  `,
  
  // Badge neuromorphic
  badge: `
    px-3 py-1
    bg-gradient-to-br from-[#dfeaff] to-[#dfeaff]
    rounded-lg
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `
};

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface PermisoConfigurable {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'contratos' | 'facturacion' | 'cobranza' | 'aprobaciones';
  tipo: 'booleano' | 'porcentaje' | 'monto' | 'dias';
  valor: number | boolean;
  valorMinimo?: number;
  valorMaximo?: number;
  requiereAprobacion?: boolean;
}

interface UsuarioConfigurable {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  rolPersonalizado: boolean;
  avatar?: string;
  activo: boolean;
  permisos: PermisoConfigurable[];
  limitesPersonalizados: {
    valorMaximoContrato: number;
    descuentoMaximo: number;
    diasPagoMaximo: number;
    puedeAprobar: boolean;
    puedeFirmar: boolean;
    puedeFirmarParaFacturacion: boolean;
    requiereSupervision: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockUsuarios: UsuarioConfigurable[] = [
  {
    id: 'u-001',
    nombre: 'María López',
    email: 'mlopez@silexar.cl',
    rol: 'Ejecutivo Junior',
    rolPersonalizado: false,
    activo: true,
    permisos: [],
    limitesPersonalizados: {
      valorMaximoContrato: 25000000,
      descuentoMaximo: 10,
      diasPagoMaximo: 30,
      puedeAprobar: false,
      puedeFirmar: false,
      puedeFirmarParaFacturacion: false,
      requiereSupervision: true
    }
  },
  {
    id: 'u-002',
    nombre: 'Carlos Mendoza',
    email: 'cmendoza@silexar.cl',
    rol: 'Ejecutivo Senior',
    rolPersonalizado: true,
    activo: true,
    permisos: [],
    limitesPersonalizados: {
      valorMaximoContrato: 150000000,
      descuentoMaximo: 25,
      diasPagoMaximo: 60,
      puedeAprobar: true,
      puedeFirmar: true,
      puedeFirmarParaFacturacion: false,
      requiereSupervision: false
    }
  },
  {
    id: 'u-003',
    nombre: 'Ana García',
    email: 'agarcia@silexar.cl',
    rol: 'Supervisor',
    rolPersonalizado: false,
    activo: true,
    permisos: [],
    limitesPersonalizados: {
      valorMaximoContrato: 500000000,
      descuentoMaximo: 30,
      diasPagoMaximo: 60,
      puedeAprobar: true,
      puedeFirmar: true,
      puedeFirmarParaFacturacion: false,
      requiereSupervision: false
    }
  },
  {
    id: 'u-006',
    nombre: 'Claudia Reyes',
    email: 'creyes@silexar.cl',
    rol: 'Gerente Facturación',
    rolPersonalizado: false,
    activo: true,
    permisos: [],
    limitesPersonalizados: {
      valorMaximoContrato: 0,
      descuentoMaximo: 5,
      diasPagoMaximo: 90,
      puedeAprobar: false,
      puedeFirmar: true,
      puedeFirmarParaFacturacion: true,
      requiereSupervision: false
    }
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const NeuroToggle: React.FC<{
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    className={`${neuroStyles.toggle} ${value ? neuroStyles.toggleActive : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div
      className={neuroStyles.toggleKnob}
      style={{ left: value ? '32px' : '4px' }}
    />
  </button>
);

const NeuroSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
  formatValue?: (val: number) => string;
  label?: string;
}> = ({ value, min, max, step = 1, onChange, suffix = '', formatValue, label }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm text-[#69738c]">Valor actual:</span>
      <span className={`${neuroStyles.badge} text-[#6888ff]`}>
        {formatValue ? formatValue(value) : value}{suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
      className={`${neuroStyles.slider} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-indigo-400 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer`}
    />
    <div className="flex justify-between text-xs text-[#9aa3b8]">
      <span>{formatValue ? formatValue(min) : min}{suffix}</span>
      <span>{formatValue ? formatValue(max) : max}{suffix}</span>
    </div>
  </div>
);

const NeuroInput: React.FC<{
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  label?: string;
}> = ({ value, onChange, type = 'text', placeholder, prefix, suffix, label }) => (
  <div className="relative">
    {prefix && (
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa3b8]">
        {prefix}
      </div>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label ?? placeholder}
      className={`${neuroStyles.input} w-full ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
    />
    {suffix && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa3b8]">
        {suffix}
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE TARJETA DE USUARIO
// ═══════════════════════════════════════════════════════════════

const UserPermissionCard: React.FC<{
  usuario: UsuarioConfigurable;
  onUpdate: (usuario: UsuarioConfigurable) => void;
  expanded: boolean;
  onToggle: () => void;
}> = ({ usuario, onUpdate, expanded, onToggle }) => {
  const [limites, setLimites] = useState(usuario.limitesPersonalizados);
  const [hasChanges, setHasChanges] = useState(false);

  const handleLimiteChange = (key: keyof typeof limites, value: number | boolean) => {
    setLimites(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({ ...usuario, limitesPersonalizados: limites, rolPersonalizado: true });
    setHasChanges(false);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(0)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(0)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const getRolIcon = () => {
    if (usuario.rol.includes('Gerente')) return <Crown className="w-5 h-5 text-amber-500" />;
    if (usuario.rol.includes('Supervisor')) return <Briefcase className="w-5 h-5 text-purple-500" />;
    if (usuario.rol.includes('Senior')) return <Zap className="w-5 h-5 text-[#6888ff]" />;
    return <Users className="w-5 h-5 text-[#69738c]" />;
  };

  return (
    <motion.div
      layout
      className={neuroStyles.cardRaised + ' p-6 mb-4'}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          {/* Avatar con efecto neuromorphic */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${neuroStyles.cardInset}`}>
            {getRolIcon()}
          </div>
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#69738c]">{usuario.nombre}</h3>
              {usuario.rolPersonalizado && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  Personalizado
                </span>
              )}
            </div>
            <p className="text-sm text-[#69738c]">{usuario.email}</p>
            <p className="text-xs text-[#6888ff] font-medium">{usuario.rol}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Indicadores rápidos */}
          <div className="flex gap-2">
            {limites.puedeFirmar && (
              <div className={`${neuroStyles.badge} text-green-600 flex items-center gap-1`}>
                <FileSignature className="w-3 h-3" />
                Firma
              </div>
            )}
            {limites.puedeAprobar && (
              <div className={`${neuroStyles.badge} text-blue-600 flex items-center gap-1`}>
                <Check className="w-3 h-3" />
                Aprueba
              </div>
            )}
          </div>
          
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-[#9aa3b8]" />
          </motion.div>
        </div>
      </button>

      {/* Panel expandible */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-[#bec8de30]/50"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Columna 1: Límites de valor */}
              <div className={`${neuroStyles.cardInset} p-5 space-y-5`}>
                <h4 className="font-bold text-[#69738c] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Límites de Valor
                </h4>
                
                {/* Valor máximo de contrato */}
                <div>
                  <label className="text-sm font-medium text-[#69738c] mb-2 block">
                    Valor Máximo de Contrato
                  </label>
                  <NeuroSlider
                    value={limites.valorMaximoContrato}
                    min={0}
                    max={1000000000}
                    step={5000000}
                    onChange={(val) => handleLimiteChange('valorMaximoContrato', val)}
                    formatValue={formatCurrency}
                    label="Valor Máximo de Contrato"
                  />
                </div>
                
                {/* Descuento máximo */}
                <div>
                  <label className="text-sm font-medium text-[#69738c] mb-2 block">
                    Descuento Máximo Permitido
                  </label>
                  <NeuroSlider
                    value={limites.descuentoMaximo}
                    min={0}
                    max={50}
                    step={1}
                    onChange={(val) => handleLimiteChange('descuentoMaximo', val)}
                    suffix="%"
                    label="Descuento Máximo Permitido"
                  />
                </div>
                
                {/* Días de pago máximo */}
                <div>
                  <label className="text-sm font-medium text-[#69738c] mb-2 block">
                    Días de Pago Máximo
                  </label>
                  <NeuroSlider
                    value={limites.diasPagoMaximo}
                    min={0}
                    max={180}
                    step={15}
                    onChange={(val) => handleLimiteChange('diasPagoMaximo', val)}
                    suffix=" días"
                    label="Días de Pago Máximo"
                  />
                </div>
              </div>

              {/* Columna 2: Permisos de acción */}
              <div className={`${neuroStyles.cardInset} p-5 space-y-5`}>
                <h4 className="font-bold text-[#69738c] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#6888ff]" />
                  Permisos de Acción
                </h4>
                
                {/* Puede Aprobar */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#69738c]">Puede Aprobar Contratos</p>
                    <p className="text-xs text-[#69738c]">Aprueba contratos de niveles inferiores</p>
                  </div>
                  <NeuroToggle
                    value={limites.puedeAprobar}
                    onChange={(val) => handleLimiteChange('puedeAprobar', val)}
                  />
                </div>
                
                {/* Puede Firmar */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#69738c]">Puede Firmar Contratos</p>
                    <p className="text-xs text-[#69738c]">Firma como representante comercial</p>
                  </div>
                  <NeuroToggle
                    value={limites.puedeFirmar}
                    onChange={(val) => handleLimiteChange('puedeFirmar', val)}
                  />
                </div>
                
                {/* Firma para Facturación */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#69738c]">Firma para Facturación</p>
                    <p className="text-xs text-[#69738c]">Libera contratos para facturación</p>
                  </div>
                  <NeuroToggle
                    value={limites.puedeFirmarParaFacturacion}
                    onChange={(val) => handleLimiteChange('puedeFirmarParaFacturacion', val)}
                  />
                </div>
                
                {/* Requiere Supervisión */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#69738c]">Requiere Supervisión</p>
                    <p className="text-xs text-[#69738c]">Acciones revisadas por superior</p>
                  </div>
                  <NeuroToggle
                    value={limites.requiereSupervision}
                    onChange={(val) => handleLimiteChange('requiereSupervision', val)}
                  />
                </div>
              </div>
            </div>

            {/* Acciones */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-end gap-3"
              >
                <button
                  onClick={() => {
                    setLimites(usuario.limitesPersonalizados);
                    setHasChanges(false);
                  }}
                  className={`${neuroStyles.buttonSecondary} px-4 py-2 flex items-center gap-2`}
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className={`${neuroStyles.buttonActive} px-6 py-2 flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function PermisosConfiguracion() {
  const [usuarios, setUsuarios] = useState<UsuarioConfigurable[]>(mockUsuarios);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');

  const handleUpdateUsuario = (updated: UsuarioConfigurable) => {
    setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRol = filterRol === 'todos' || u.rol.toLowerCase().includes(filterRol.toLowerCase());
    return matchSearch && matchRol;
  });

  const roles = ['todos', ...new Set(usuarios.map(u => u.rol))];

  return (
    <div className={neuroStyles.container}>
      {/* Header */}
      <div className="sticky top-0 z-30 -xl bg-[#dfeaff]/80 border-b border-[#bec8de30]/50">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${neuroStyles.cardRaised}`}>
                <UserCog className="w-7 h-7 text-[#6888ff]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#69738c]">⚙️ Configuración de Permisos</h1>
                <p className="text-[#69738c] text-sm">Gestiona límites y permisos de usuarios</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className={`${neuroStyles.buttonSecondary} px-4 py-2 flex items-center gap-2`}>
                <RefreshCw className="w-4 h-4" />
                Restablecer Todo
              </button>
              <button className={`${neuroStyles.buttonActive} px-6 py-2 flex items-center gap-2`}>
                <Building2 className="w-4 h-4" />
                Políticas Globales
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Filtros con estilo neuromorphic */}
        <div className={`${neuroStyles.cardRaised} p-5 mb-8`}>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Búsqueda */}
            <div className="flex-1 min-w-[250px]">
              <NeuroInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar usuario..."
                prefix={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* Filtro por rol */}
            <div className="flex gap-2 flex-wrap">
              {roles.map(rol => (
                <button
                  key={rol}
                  onClick={() => setFilterRol(rol)}
                  className={`px-4 py-2 rounded-xl capitalize transition-all ${
                    filterRol === rol
                      ? 'bg-[#6888ff] text-white shadow-lg'
                      : neuroStyles.buttonSecondary
                  }`}
                >
                  {rol === 'todos' ? 'Todos' : rol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Usuarios Totales', value: usuarios.length, icon: <Users className="w-5 h-5" />, color: 'text-blue-600' },
            { label: 'Con Permisos Custom', value: usuarios.filter(u => u.rolPersonalizado).length, icon: <Settings className="w-5 h-5" />, color: 'text-amber-600' },
            { label: 'Pueden Aprobar', value: usuarios.filter(u => u.limitesPersonalizados.puedeAprobar).length, icon: <Check className="w-5 h-5" />, color: 'text-green-600' },
            { label: 'Pueden Firmar', value: usuarios.filter(u => u.limitesPersonalizados.puedeFirmar).length, icon: <FileSignature className="w-5 h-5" />, color: 'text-purple-600' }
          ].map((stat) => (
            <div key={stat.label} className={`${neuroStyles.cardRaised} p-5`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${neuroStyles.cardInset} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-[#69738c]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#69738c]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-4">
          {filteredUsuarios.map(usuario => (
            <UserPermissionCard
              key={usuario.id}
              usuario={usuario}
              onUpdate={handleUpdateUsuario}
              expanded={expandedUser === usuario.id}
              onToggle={() => setExpandedUser(expandedUser === usuario.id ? null : usuario.id)}
            />
          ))}
        </div>

        {filteredUsuarios.length === 0 && (
          <div className={`${neuroStyles.cardInset} p-12 text-center`}>
            <Users className="w-12 h-12 text-[#9aa3b8] mx-auto mb-4" />
            <p className="text-[#69738c]">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
}
