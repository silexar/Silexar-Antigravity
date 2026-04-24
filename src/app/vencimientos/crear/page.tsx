/**
 * 📅 SILEXAR PULSE - Crear Programa Wizard TIER 0
 *
 * @description 5-step wizard for creating new commercial programs.
 *              Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 *              TIER 0 ENTERPRISE - Fortune 10 Ready
 *
 * @version 2026.1.0
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Plus,
    ArrowLeft,
    ArrowRight,
    Check,
    X,
    Calendar,
    Clock,
    Users,
    Package,
    DollarSign,
    Sparkles,
    Radio,
    Trash2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TOKENS OFICIALES NEUMORPHISM
// ═══════════════════════════════════════════════════════════════

const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    text: '#69738c',
    textSub: '#9aa3b8',
};

const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const neuXs = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;
const insetSm = `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUMORPHIC
// ═══════════════════════════════════════════════════════════════

function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: neu, ...style }}>
            {children}
        </div>
    );
}

function NeuButton({ children, onClick, variant = 'secondary', className = '', disabled = false }: {
    children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'success'; className?: string; disabled?: boolean;
}) {
    const s = variant === 'primary'
        ? { background: N.accent, color: '#fff', boxShadow: neuSm }
        : variant === 'success'
            ? { background: '#22c55e', color: '#fff', boxShadow: neuSm }
            : { background: N.base, color: N.text, boxShadow: neu };
    return (
        <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`} style={s}>
            {children}
        </button>
    );
}

function NeuInput({ value, onChange, placeholder, type = 'text', className = '' }: {
    value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 rounded-xl text-sm ${className}`}
            style={{
                background: N.base,
                boxShadow: inset,
                color: N.text,
                outline: 'none'
            }}
        />
    );
}

function NeuSelect({ value, onChange, options, className = '' }: {
    value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl text-sm cursor-pointer ${className}`}
            style={{
                background: N.base,
                boxShadow: inset,
                color: N.text,
                outline: 'none'
            }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

function NeuTextarea({ value, onChange, placeholder, rows = 4, className = '' }: {
    value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string;
}) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-3 rounded-xl text-sm ${className}`}
            style={{
                background: N.base,
                boxShadow: inset,
                color: N.text,
                outline: 'none',
                resize: 'vertical'
            }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════
// STEPS Y TIPOS
// ═══════════════════════════════════════════════════════════════

const STEPS = [
    { id: 1, title: 'Información Básica', description: 'Nombre, descripción y emisora', icon: Package },
    { id: 2, title: 'Horario y Días', description: 'Configurar horarios de transmisión', icon: Clock },
    { id: 3, title: 'Cupos Comerciales', description: 'Definir tipos y cantidades de cupos', icon: DollarSign },
    { id: 4, title: 'Conductores', description: 'Asignar conductores al programa', icon: Users },
    { id: 5, title: 'Revisión', description: 'Verificar y crear programa', icon: Sparkles },
];

interface CupoItem {
    id: string;
    nombre: string;
    tipo: 'PREMIUM' | 'STANDARD' | 'MENSAJE' | 'PERSONALIZADO';
    total: number;
    precioBase: number;
    color: string;
}

interface ProgramaFormData {
    emiId: string;
    emiNombre: string;
    nombre: string;
    descripcion: string;
    estado: 'BORRADOR' | 'ACTIVO';
    horarioInicio: string;
    horarioFin: string;
    diasSemana: number[];
    cupos: CupoItem[];
    conductores: Array<{ id: string; nombre: string; rol: string }>;
    vigenciaDesde: string;
    vigenciaHasta: string;
}

const diasSemanaOpciones = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
];

const emisorasOptions = [
    { value: '', label: 'Seleccionar emisora' },
    { value: 'emi-1', label: 'Radio Activa' },
    { value: 'emi-2', label: 'Radio Central' },
    { value: 'emi-3', label: 'Radio Nacional' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CrearProgramaPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<ProgramaFormData>({
        emiId: '',
        emiNombre: '',
        nombre: '',
        descripcion: '',
        estado: 'BORRADOR',
        horarioInicio: '06:00',
        horarioFin: '10:00',
        diasSemana: [1, 2, 3, 4, 5],
        cupos: [
            { id: 'cupo-1', nombre: 'Cupo Tipo A (Premium)', tipo: 'PREMIUM', total: 10, precioBase: 500000, color: '#3b82f6' },
            { id: 'cupo-2', nombre: 'Cupo Tipo B (Standard)', tipo: 'STANDARD', total: 20, precioBase: 300000, color: '#22c55e' },
            { id: 'cupo-3', nombre: 'Menciones', tipo: 'MENSAJE', total: 5, precioBase: 200000, color: '#a855f7' },
        ],
        conductores: [],
        vigenciaDesde: '',
        vigenciaHasta: '',
    });

    const [conductorNombre, setConductorNombre] = useState('');
    const [conductorRol, setConductorRol] = useState('');

    const updateFormData = (updates: Partial<ProgramaFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const toggleDiaSemana = (dia: number) => {
        setFormData(prev => ({
            ...prev,
            diasSemana: prev.diasSemana.includes(dia)
                ? prev.diasSemana.filter(d => d !== dia)
                : [...prev.diasSemana, dia].sort((a, b) => a - b),
        }));
    };

    const addConductor = () => {
        if (conductorNombre.trim() && conductorRol.trim()) {
            updateFormData({
                conductores: [
                    ...formData.conductores,
                    { id: `cond-${Date.now()}`, nombre: conductorNombre.trim(), rol: conductorRol.trim() },
                ],
            });
            setConductorNombre('');
            setConductorRol('');
        }
    };

    const removeConductor = (index: number) => {
        updateFormData({
            conductores: formData.conductores.filter((_, i) => i !== index),
        });
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const totalRevenue = () => {
        return formData.cupos.reduce((sum, cupo) => sum + (cupo.total * cupo.precioBase), 0);
    };

    const addCupo = (tipo: CupoItem['tipo'], nombre: string) => {
        const colors: Record<CupoItem['tipo'], string> = {
            PREMIUM: '#3b82f6',
            STANDARD: '#22c55e',
            MENSAJE: '#a855f7',
            PERSONALIZADO: '#f59e0b',
        };
        const newCupo: CupoItem = {
            id: `cupo-${Date.now()}`,
            nombre,
            tipo,
            total: 0,
            precioBase: 0,
            color: colors[tipo],
        };
        updateFormData({ cupos: [...formData.cupos, newCupo] });
    };

    const removeCupo = (id: string) => {
        updateFormData({ cupos: formData.cupos.filter(c => c.id !== id) });
    };

    const updateCupo = (id: string, updates: Partial<CupoItem>) => {
        updateFormData({
            cupos: formData.cupos.map(c => c.id === id ? { ...c, ...updates } : c)
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/vencimientos/programas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                router.push('/vencimientos');
            }
        } catch (error) {
            console.error('Error al crear programa:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
                            <Radio className="w-8 h-8" style={{ color: N.accent }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black" style={{ color: N.text }}>Crear Nuevo Programa</h1>
                            <p className="text-sm mt-1" style={{ color: N.textSub }}>Completa los pasos para crear un programa comercial</p>
                        </div>
                    </div>
                    <NeuButton onClick={() => router.push('/vencimientos')}>
                        <X className="w-5 h-5" /> Cancelar
                    </NeuButton>
                </div>

                {/* Progress Steps */}
                <NeuCard className="p-6">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep >= step.id;
                            const isCompleted = currentStep > step.id;
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isCompleted ? 'text-white' : isActive ? 'text-white' : ''
                                                }`}
                                            style={{
                                                background: isCompleted ? '#22c55e' : isActive ? N.accent : N.base,
                                                boxShadow: isActive ? neuSm : inset,
                                            }}
                                        >
                                            {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                        </motion.div>
                                        <span className="text-xs mt-2 font-bold" style={{ color: isActive ? N.text : N.textSub }}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`w-12 lg:w-20 h-1 mx-2 rounded-full transition-all duration-300`}
                                            style={{ background: isCompleted ? '#22c55e' : N.dark }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </NeuCard>

                {/* Step Content */}
                <NeuCard className="p-6">

                    {/* Step 1: Información Básica */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <Package className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black" style={{ color: N.text }}>Información Básica</h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>Datos generales del programa</p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Nombre del Programa</label>
                                    <NeuInput
                                        value={formData.nombre}
                                        onChange={(v) => updateFormData({ nombre: v })}
                                        placeholder="Ej: Buenos Días Radio"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Emisora</label>
                                    <NeuSelect
                                        value={formData.emiId}
                                        onChange={(v) => {
                                            const emi = emisorasOptions.find(e => e.value === v);
                                            updateFormData({ emiId: v, emiNombre: emi?.label || '' });
                                        }}
                                        options={emisorasOptions}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Descripción</label>
                                <NeuTextarea
                                    value={formData.descripcion}
                                    onChange={(v) => updateFormData({ descripcion: v })}
                                    placeholder="Descripción del programa comercial..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Vigencia Desde</label>
                                    <NeuInput
                                        type="date"
                                        value={formData.vigenciaDesde}
                                        onChange={(v) => updateFormData({ vigenciaDesde: v })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Vigencia Hasta</label>
                                    <NeuInput
                                        type="date"
                                        value={formData.vigenciaHasta}
                                        onChange={(v) => updateFormData({ vigenciaHasta: v })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Estado</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.estado === 'BORRADOR'}
                                            onChange={() => updateFormData({ estado: 'BORRADOR' })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-bold" style={{ color: N.text }}>Borrador</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.estado === 'ACTIVO'}
                                            onChange={() => updateFormData({ estado: 'ACTIVO' })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-bold" style={{ color: N.text }}>Activo</span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Horario y Días */}
                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <Clock className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black" style={{ color: N.text }}>Horario y Días</h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>Configura los horarios de transmisión</p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Hora de Inicio</label>
                                    <NeuInput
                                        type="time"
                                        value={formData.horarioInicio}
                                        onChange={(v) => updateFormData({ horarioInicio: v })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Hora de Fin</label>
                                    <NeuInput
                                        type="time"
                                        value={formData.horarioFin}
                                        onChange={(v) => updateFormData({ horarioFin: v })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-3" style={{ color: N.textSub }}>Días de Transmisión</label>
                                <div className="flex flex-wrap gap-3">
                                    {diasSemanaOpciones.map((dia) => {
                                        const isSelected = formData.diasSemana.includes(dia.value);
                                        return (
                                            <button
                                                key={dia.value}
                                                type="button"
                                                onClick={() => toggleDiaSemana(dia.value)}
                                                className="px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                                                style={{
                                                    background: isSelected ? N.accent : N.base,
                                                    color: isSelected ? '#fff' : N.text,
                                                    boxShadow: isSelected ? neuSm : inset,
                                                }}
                                            >
                                                {dia.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="mt-3 text-sm font-medium" style={{ color: N.textSub }}>
                                    {formData.diasSemana.length === 0
                                        ? 'Selecciona al menos un día'
                                        : `${formData.diasSemana.length} días seleccionados`}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Cupos Comerciales */}
                    {currentStep === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <DollarSign className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black" style={{ color: N.text }}>Cupos Comerciales</h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>Define la cantidad y precios de cupos</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Dynamic Cupos List */}
                                {formData.cupos.map((cupo) => (
                                    <div key={cupo.id} className="p-5 rounded-2xl" style={{ background: N.base, boxShadow: inset }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ background: cupo.color }} />
                                                <h3 className="font-bold" style={{ color: N.text }}>{cupo.nombre}</h3>
                                            </div>
                                            <button
                                                onClick={() => removeCupo(cupo.id)}
                                                className="p-2 rounded-lg transition-all duration-200 hover:opacity-70"
                                                style={{ background: N.base, boxShadow: neuSm }}
                                            >
                                                <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                                            </button>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Cantidad Total</label>
                                                <NeuInput
                                                    type="number"
                                                    value={cupo.total}
                                                    onChange={(v) => updateCupo(cupo.id, { total: parseInt(v) || 0 })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-2" style={{ color: N.textSub }}>Precio Base (CLP)</label>
                                                <NeuInput
                                                    type="number"
                                                    value={cupo.precioBase}
                                                    onChange={(v) => updateCupo(cupo.id, { precioBase: parseInt(v) || 0 })}
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm font-medium" style={{ color: cupo.color }}>
                                            Ingreso potencial: {formatCurrency(cupo.total * cupo.precioBase)}
                                        </p>
                                    </div>
                                ))}

                                {/* Add New Cupo Buttons */}
                                <div className="p-4 rounded-2xl flex flex-wrap gap-3" style={{ background: N.base, boxShadow: inset }}>
                                    <span className="text-sm font-bold w-full mb-2" style={{ color: N.textSub }}>Agregar Auspicio:</span>
                                    <NeuButton onClick={() => addCupo('PREMIUM', 'Cupo Premium')}>
                                        <Plus className="w-4 h-4" /> Premium
                                    </NeuButton>
                                    <NeuButton onClick={() => addCupo('STANDARD', 'Cupo Standard')}>
                                        <Plus className="w-4 h-4" /> Standard
                                    </NeuButton>
                                    <NeuButton onClick={() => addCupo('MENSAJE', 'Mención')}>
                                        <Plus className="w-4 h-4" /> Méncion
                                    </NeuButton>
                                    <NeuButton onClick={() => addCupo('PERSONALIZADO', 'Auspicio Personalizado')}>
                                        <Plus className="w-4 h-4" /> Personalizado
                                    </NeuButton>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Conductores */}
                    {currentStep === 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <Users className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black" style={{ color: N.text }}>Conductores</h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>Asigna conductores al programa</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {formData.conductores.length === 0 ? (
                                    <div className="p-8 text-center rounded-2xl" style={{ background: N.base, boxShadow: inset }}>
                                        <Users className="w-12 h-12 mx-auto mb-4" style={{ color: N.textSub }} />
                                        <p className="font-bold" style={{ color: N.textSub }}>No hay conductores agregados</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.conductores.map((conductor, index) => (
                                            <div key={conductor.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: N.base, boxShadow: inset }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: N.accent }}>
                                                        <span className="text-white font-bold">{conductor.nombre.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold" style={{ color: N.text }}>{conductor.nombre}</p>
                                                        <p className="text-xs" style={{ color: N.textSub }}>{conductor.rol}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeConductor(index)}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:opacity-70"
                                                    style={{ background: N.base, boxShadow: neuSm }}
                                                >
                                                    <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Conductor Form */}
                                <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: inset }}>
                                    <span className="text-sm font-bold mb-3 block" style={{ color: N.textSub }}>Agregar Conductor:</span>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <NeuInput
                                            value={conductorNombre}
                                            onChange={setConductorNombre}
                                            placeholder="Nombre del conductor"
                                        />
                                        <NeuInput
                                            value={conductorRol}
                                            onChange={setConductorRol}
                                            placeholder="Rol (ej: Conductor principal)"
                                        />
                                        <NeuButton onClick={addConductor}>
                                            <Plus className="w-4 h-4" /> Agregar
                                        </NeuButton>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Revisión */}
                    {currentStep === 5 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <Sparkles className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black" style={{ color: N.text }}>Revisión Final</h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>Verifica los datos antes de crear</p>
                                </div>
                            </div>

                            {/* Info Summary */}
                            <div className="rounded-2xl p-4" style={{ background: N.base, boxShadow: inset }}>
                                <h3 className="text-sm font-bold mb-3" style={{ color: N.textSub }}>Información del Programa</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Nombre</p>
                                        <p className="text-lg font-black" style={{ color: N.text }}>{formData.nombre || 'Sin nombre'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Emisora</p>
                                        <p className="text-lg font-black" style={{ color: N.text }}>{formData.emiNombre || 'Sin seleccionar'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Horario</p>
                                        <p className="text-lg font-black" style={{ color: N.text }}>{formData.horarioInicio} - {formData.horarioFin}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Estado</p>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: formData.estado === 'ACTIVO' ? '#22c55e20' : '#f59e0b20', color: formData.estado === 'ACTIVO' ? '#22c55e' : '#f59e0b' }}>
                                            {formData.estado}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cupos Summary */}
                            <div className="rounded-2xl p-4" style={{ background: N.base, boxShadow: inset }}>
                                <h3 className="text-sm font-bold mb-3" style={{ color: N.textSub }}>Cupos Configurados</h3>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {formData.cupos.map((cupo) => (
                                        <div key={cupo.id} className="p-3 rounded-xl text-center" style={{ background: `${cupo.color}14` }}>
                                            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: cupo.color }}>{cupo.nombre}</p>
                                            <p className="text-lg font-black" style={{ color: N.text }}>{cupo.total} cupos</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Revenue Summary */}
                            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(104,136,255,0.08) 0%, rgba(34,197,94,0.08) 100%)' }}>
                                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Revenue Potencial Estimado</h3>
                                <p className="text-3xl font-black mt-2" style={{ color: N.accent }}>{formatCurrency(totalRevenue())}</p>
                            </div>

                            {/* Conductores Summary */}
                            <div className="rounded-2xl p-4" style={{ background: N.base, boxShadow: inset }}>
                                <h3 className="text-sm font-bold mb-3" style={{ color: N.textSub }}>Conductores Asignados</h3>
                                <p className="text-lg font-bold" style={{ color: N.text }}>{formData.conductores.length} conductor(es)</p>
                                {formData.conductores.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.conductores.map(c => (
                                            <span key={c.id} className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: N.base, boxShadow: neuXs, color: N.text }}>
                                                {c.nombre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </NeuCard>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <NeuButton
                        onClick={prevStep}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="w-5 h-5" /> Anterior
                    </NeuButton>

                    {currentStep < 5 ? (
                        <NeuButton variant="primary" onClick={nextStep}>
                            Siguiente <ArrowRight className="w-5 h-5" />
                        </NeuButton>
                    ) : (
                        <NeuButton
                            variant="success"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creando...' : '✓ Crear Programa'}
                        </NeuButton>
                    )}
                </div>

            </div>
        </div>
    );
}
