'use client';

/**
 * 🏢 SILEXAR PULSE - Nueva Agencia de Medios
 * 
 * Wizard de creación con IA integrada
 * Diseño neuromórfico premium
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    User,
    DollarSign,
    Target,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Search,
    Globe,
    Mail,
    Building,
    AlertCircle,
    Sparkles,
    Loader2,
    X,
    Plus,
    Trash2,
    ArrowRight,
    Lock,
    Shield,
    Zap
} from 'lucide-react';
import {
    NeuromorphicCard,
    NeuromorphicButton,
    NeuromorphicInput as BaseNeuromorphicInput,
    NeuromorphicContainer
} from '@/components/ui/neuromorphic';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface FormData {
    // Basic Info
    codigo?: string;
    rut: string;
    razonSocial: string;
    nombreComercial: string;
    tipoAgencia: string;
    ciudad: string;
    pais: string;

    // Contact
    emailGeneral: string;
    telefonoGeneral: string;
    paginaWeb: string;
    direccion: string;

    // Business
    giroActividad: string;
    empleadosCantidad: number;
    revenueAnual: number;

    // Specializations
    especializaciones: string[];
    capacidadesDigitales: string[];

    // Commission
    comisionPorcentaje: number;
    tipoComision: string;

    // Contact Principal
    contactoNombre: string;
    contactoApellido: string;
    contactoEmail: string;
    contactoTelefono: string;
    contactoCargo: string;
}

interface ValidationResult {
    valid: boolean;
    data?: {
        razonSocial: string;
        giro: string;
        estado: string;
        direccion: string;
    };
    iaAnalysis?: {
        tipoEstimado: string;
        facturacionEstimada: string;
        tamanoEmpleados: string;
        especializaciones: string[];
        clientesPrincipales: string[];
        certificacionesDetectadas: string[];
    };
    warnings: string[];
}

// ═══════════════════════════════════════════════════════════════
// NEUROMORPHIC STYLES
// ═══════════════════════════════════════════════════════════════

const colors = {
    bgGradientStart: '#e8edf3',
    bgGradientMid: '#f0f4f8',
    bgGradientEnd: '#e2e8f0',
    surface: 'rgba(255, 255, 255, 0.7)',
    accentCyan: '#06b6d4',
    accentEmerald: '#10b981',
    accentAmber: '#f59e0b',
    accentRose: '#f43f5e',
    accentViolet: '#8b5cf6',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
};

const styles = {
    card: `
    background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,244,248,0.7));
    backdrop-filter: blur(20px);
    border-radius: 24px;
    box-shadow: 
      12px 12px 24px rgba(163, 177, 198, 0.5),
      -8px -8px 20px rgba(255, 255, 255, 0.9),
      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  `,
    input: `
    background: linear-gradient(145deg, #f8fafc, #e8edf3);
    border-radius: 16px;
    box-shadow: 
      inset 6px 6px 12px rgba(163, 177, 198, 0.4),
      inset -4px -4px 8px rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(163, 177, 198, 0.2);
    transition: all 0.3s ease;
  `,
    button: `
    background: linear-gradient(145deg, #ffffff, #f0f4f8);
    border-radius: 16px;
    box-shadow: 
      6px 6px 12px rgba(163, 177, 198, 0.5),
      -4px -4px 10px rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
  `,
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

const StepIndicator = ({ currentStep, totalSteps, steps }: { currentStep: number; totalSteps: number; steps: string[] }) => (
    <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
            <div key={index} className="flex items-center">
                <div
                    className="flex items-center justify-center rounded-full font-bold transition-all duration-300"
                    style={{
                        width: '36px',
                        height: '36px',
                        background: index < currentStep
                            ? colors.accentEmerald
                            : index === currentStep
                                ? colors.accentCyan
                                : '#e8edf3',
                        color: index <= currentStep ? '#fff' : colors.textMuted,
                        boxShadow: index === currentStep
                            ? `0 4px 16px ${colors.accentCyan}40`
                            : 'none',
                    }}
                >
                    {index < currentStep ? <CheckCircle2 size={20} /> : index + 1}
                </div>
                <span
                    className="ml-2 text-sm font-medium hidden md:inline"
                    style={{ color: index <= currentStep ? colors.textPrimary : colors.textMuted }}
                >
                    {step}
                </span>
                {index < steps.length - 1 && (
                    <div
                        className="w-12 md:w-24 h-0.5 mx-3 transition-all duration-300"
                        style={{
                            background: index < currentStep ? colors.accentEmerald : '#e8edf3'
                        }}
                    />
                )}
            </div>
        ))}
    </div>
);

const NeuromorphicInput = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    icon,
    error,
    helpText,
    className = ''
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
    error?: string;
    helpText?: string;
    className?: string;
}) => (
    <div className={className}>
        <label
            className="block mb-2 text-sm font-medium"
            style={{ color: colors.textSecondary }}
        >
            {label}
        </label>
        <div className="relative">
            {icon && (
                <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: colors.textMuted }}
                >
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full py-3 pl-5 pr-4 text-base bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 rounded-xl`}
            />
        </div>
        {error && (
            <p className="mt-2 text-sm flex items-center gap-1" style={{ color: colors.accentRose }}>
                <AlertCircle size={14} />
                {error}
            </p>
        )}
        {helpText && !error && (
            <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>{helpText}</p>
        )}
    </div>
);

const NeuromorphicSelect = ({
    label,
    value,
    onChange,
    options,
    icon,
    className = ''
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    icon?: React.ReactNode;
    className?: string;
    error?: string;
}) => (
    <div className={className}>
        <label
            className="block mb-2 text-sm font-medium"
            style={{ color: colors.textSecondary }}
        >
            {label}
        </label>
        <div className="relative">
            {icon && (
                <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                    style={{ color: colors.textMuted }}
                >
                    {icon}
                </div>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full py-3 appearance-none cursor-pointer bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 rounded-xl"
                style={{
                    paddingLeft: icon ? '48px' : '20px',
                    paddingRight: '40px',
                    color: colors.textPrimary,
                }}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: colors.textMuted }}
            />
        </div>
    </div>
);

const ChipSelector = ({
    label,
    options,
    selected,
    onChange,
    multiSelect = false
}: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    multiSelect?: boolean;
}) => (
    <div>
        <label
            className="block mb-3 text-sm font-medium"
            style={{ color: colors.textSecondary }}
        >
            {label}
        </label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => {
                const isSelected = selected.includes(option);
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => {
                            if (multiSelect) {
                                if (isSelected) {
                                    onChange(selected.filter(s => s !== option));
                                } else {
                                    onChange([...selected, option]);
                                }
                            } else {
                                onChange([option]);
                            }
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: isSelected
                                ? `linear-gradient(145deg, ${colors.accentCyan}, #0891b2)`
                                : 'rgba(255,255,255,0.7)',
                            color: isSelected ? '#fff' : colors.textSecondary,
                            boxShadow: isSelected
                                ? `0 4px 12px ${colors.accentCyan}40`
                                : '0 2px 8px rgba(163, 177, 198, 0.3)',
                            border: `1px solid ${isSelected ? 'transparent' : 'rgba(163, 177, 198, 0.3)'}`,
                        }}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    </div>
);

const SIIAnalysisCard = ({ analysis, onAccept, onAdjust }: {
    analysis: ValidationResult;
    onAccept: () => void;
    onAdjust: () => void;
}) => (
    <div
        className="p-6 rounded-2xl border-2 animate-pulse-slow"
        style={{
            background: `linear-gradient(145deg, ${colors.accentEmerald}08, ${colors.accentEmerald}02)`,
            borderColor: `${colors.accentEmerald}30`,
            boxShadow: `0 8px 32px ${colors.accentEmerald}10`,
        }}
    >
        <div className="flex items-center gap-3 mb-4">
            <div
                className="p-2 rounded-xl"
                style={{ background: `${colors.accentEmerald}20` }}
            >
                <CheckCircle2 size={24} style={{ color: colors.accentEmerald }} />
            </div>
            <div>
                <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: '16px' }}>
                    ✅ Agencia Validada por SII + IA
                </h3>
                <p style={{ color: colors.textMuted, fontSize: '13px' }}>
                    Datos encontrados y analizados automáticamente
                </p>
            </div>
        </div>

        {analysis.data && (
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <p style={{ color: colors.textMuted, fontSize: '11px' }}>Razón Social</p>
                    <p style={{ color: colors.textPrimary, fontWeight: 600 }}>{analysis.data.razonSocial}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <p style={{ color: colors.textMuted, fontSize: '11px' }}>Giro</p>
                    <p style={{ color: colors.textPrimary, fontWeight: 600 }}>{analysis.data.giro}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <p style={{ color: colors.textMuted, fontSize: '11px' }}>Estado</p>
                    <p style={{ color: colors.accentEmerald, fontWeight: 600 }}>{analysis.data.estado}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <p style={{ color: colors.textMuted, fontSize: '11px' }}>Dirección</p>
                    <p style={{ color: colors.textPrimary, fontWeight: 600 }}>{analysis.data.direccion}</p>
                </div>
            </div>
        )}

        {analysis.iaAnalysis && (
            <div
                className="p-4 rounded-xl mb-4"
                style={{ background: `${colors.accentCyan}10`, border: `1px solid ${colors.accentCyan}20` }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} style={{ color: colors.accentCyan }} />
                    <span style={{ color: colors.accentCyan, fontWeight: 600, fontSize: '14px' }}>
                        Análisis IA Automático
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span style={{ color: colors.textMuted }}>Tipo estimado: </span>
                        <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                            {analysis.iaAnalysis.tipoEstimado}
                        </span>
                    </div>
                    <div>
                        <span style={{ color: colors.textMuted }}>Facturación: </span>
                        <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                            {analysis.iaAnalysis.facturacionEstimada}
                        </span>
                    </div>
                    <div>
                        <span style={{ color: colors.textMuted }}>Empleados: </span>
                        <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                            {analysis.iaAnalysis.tamanoEmpleados}
                        </span>
                    </div>
                </div>
                {analysis.iaAnalysis.certificacionesDetectadas.length > 0 && (
                    <div className="mt-3">
                        <span style={{ color: colors.textMuted, fontSize: '12px' }}>Certificaciones: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.iaAnalysis.certificacionesDetectadas.map(cert => (
                                <span
                                    key={cert}
                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                    style={{ background: `${colors.accentAmber}20`, color: colors.accentAmber }}
                                >
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex gap-3">
            <button
                onClick={onAccept}
                className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{
                    background: `linear-gradient(145deg, ${colors.accentEmerald}, #059669)`,
                    color: '#fff',
                    boxShadow: `0 4px 16px ${colors.accentEmerald}40`,
                }}
            >
                <CheckCircle2 size={18} />
                Usar datos
            </button>
            <button
                onClick={onAdjust}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{
                    background: 'rgba(255,255,255,0.8)',
                    color: colors.textSecondary,
                    boxShadow: '0 2px 8px rgba(163, 177, 198, 0.3)',
                }}
            >
                Ajustar
            </button>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function NuevaAgenciaPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [validatingRUT, setValidatingRUT] = useState(false);
    const [rutValidado, setRutValidado] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<FormData>({
        rut: '',
        razonSocial: '',
        nombreComercial: '',
        tipoAgencia: '',
        ciudad: '',
        pais: 'Chile',
        emailGeneral: '',
        telefonoGeneral: '',
        paginaWeb: '',
        direccion: '',
        giroActividad: '',
        empleadosCantidad: 0,
        revenueAnual: 0,
        especializaciones: [],
        capacidadesDigitales: [],
        comisionPorcentaje: 15,
        tipoComision: 'porcentaje',
        contactoNombre: '',
        contactoApellido: '',
        contactoEmail: '',
        contactoTelefono: '',
        contactoCargo: '',
    });

    const steps = ['Básica', 'Contacto', 'Negocio', 'Comisiones', 'Confirmar'];

    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateRUT = async () => {
        if (!formData.rut || formData.rut.length < 8) {
            setErrors(prev => ({ ...prev, rut: 'Ingresa un RUT válido' }));
            return;
        }

        setValidatingRUT(true);

        // Simulate SII validation + IA analysis
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock validation result
        setValidationResult({
            valid: true,
            data: {
                razonSocial: formData.razonSocial || 'Starcom MediaVest Group Chile SpA',
                giro: 'Actividades de publicidad y marketing',
                estado: 'Activo',
                direccion: 'Av. Apoquindo 4001, Las Condes, Santiago',
            },
            iaAnalysis: {
                tipoEstimado: 'Full Service Agency',
                facturacionEstimada: '$500M-1B anual',
                tamanoEmpleados: '200-500',
                especializaciones: ['Digital', 'TV', 'Radio', 'Retail'],
                clientesPrincipales: ['FMCG', 'Retail', 'Finance'],
                certificacionesDetectadas: ['Google Premier', 'Meta Business'],
            },
            warnings: ['RUT ya existe en el sistema'],
        });

        setRutValidado(true);
        setValidatingRUT(false);
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 0:
                if (!formData.razonSocial) newErrors.razonSocial = 'La razón social es requerida';
                if (!formData.tipoAgencia) newErrors.tipoAgencia = 'Selecciona un tipo de agencia';
                break;
            case 1:
                if (!formData.emailGeneral) newErrors.emailGeneral = 'El email es requerido';
                if (formData.emailGeneral && !formData.emailGeneral.includes('@')) {
                    newErrors.emailGeneral = 'Email inválido';
                }
                break;
            case 2:
                if (formData.especializaciones.length === 0) {
                    newErrors.especializaciones = 'Selecciona al menos una especialización';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/agencias-medios/dashboard');
        } catch (error) {
            console.error('Error creating agency:', error);
        } finally {
            setLoading(false);
        }
    };

    const tipoAgencias = [
        { value: 'FULL_SERVICE', label: '🌟 Full Service - Agencia integral' },
        { value: 'DIGITAL', label: '📱 Digital - Especializada en medios digitales' },
        { value: 'MEDIA_BUYING', label: '📺 Media Buying - Compra de medios' },
        { value: 'BOUTIQUE', label: '🎨 Boutique - Especializada en nichos' },
        { value: 'SPECIALIZED', label: '🎯 Especializada - Vertical específico' },
        { value: 'INDEPENDENT', label: '🏠 Independiente - Sin affiliation' },
    ];

    const especializaciones = [
        'FMCG', 'Finance', 'Insurance', 'Technology', 'Pharma',
        'Healthcare', 'Retail', 'Automotive', 'Telecom', 'Travel',
        'Food & Beverage', 'Entertainment', 'Education', 'E-Commerce'
    ];

    const capacidades = [
        'Programmatic', 'Social Media', 'SEO/SEM', 'Video Ads',
        'Native Advertising', 'Display', 'Email Marketing', 'Analytics',
        'Data Management', 'Mobile Marketing', 'Influencer Marketing'
    ];

    return (
        <div
            className="min-h-screen py-8 px-4"
            style={{ background: `linear-gradient(145deg, ${colors.bgGradientStart}, ${colors.bgGradientMid}, ${colors.bgGradientEnd})` }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1
                        className="text-4xl font-bold mb-2"
                        style={{
                            background: `linear-gradient(135deg, ${colors.textPrimary}, ${colors.accentCyan})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        🏢 Nueva Agencia de Medios
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Completa el formulario para registrar una nueva agencia en el sistema
                    </p>
                </div>

                {/* Progress Steps */}
                <StepIndicator currentStep={currentStep} totalSteps={steps.length} steps={steps} />

                {/* Form Card */}
                <div className="p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50">

                    {/* STEP 0: Basic Info */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div>
                                <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                                    📋 Información Fundamental
                                </h2>
                                <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                                    Ingresa los datos básicos de la agencia
                                </p>
                            </div>

                            {/* RUT Search with SII Validation */}
                            <div className="p-4 rounded-2xl" style={{ background: `${colors.accentCyan}08` }}>
                                <label
                                    className="block mb-2 text-sm font-medium"
                                    style={{ color: colors.textSecondary }}
                                >
                                    🔍 Buscar por RUT (Chile)
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={formData.rut}
                                        onChange={(e) => {
                                            updateField('rut', e.target.value);
                                            setRutValidado(false);
                                            setValidationResult(null);
                                        }}
                                        placeholder="12.345.678-9"
                                        className="flex-1 py-3 pl-5 pr-4 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                                    />
                                    <button
                                        onClick={validateRUT}
                                        disabled={validatingRUT || rutValidado}
                                        className="px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                                        style={{
                                            background: rutValidado
                                                ? colors.accentEmerald
                                                : `linear-gradient(145deg, ${colors.accentCyan}, #0891b2)`,
                                            color: '#fff',
                                            boxShadow: `0 4px 16px ${rutValidado ? colors.accentEmerald : colors.accentCyan}40`,
                                        }}
                                    >
                                        {validatingRUT ? (
                                            <><Loader2 size={18} className="animate-spin" /> Validando...</>
                                        ) : rutValidado ? (
                                            <><CheckCircle2 size={18} /> Validado</>
                                        ) : (
                                            <><Search size={18} /> Buscar</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* SII Validation Result */}
                            {validationResult && (
                                <SIIAnalysisCard
                                    analysis={validationResult}
                                    onAccept={() => {
                                        if (validationResult.data) {
                                            updateField('razonSocial', validationResult.data.razonSocial);
                                            updateField('direccion', validationResult.data.direccion);
                                            updateField('giroActividad', validationResult.data.giro);
                                        }
                                    }}
                                    onAdjust={() => setValidationResult(null)}
                                />
                            )}

                            {/* Manual Fields */}
                            <NeuromorphicInput
                                label="Razón Social *"
                                value={formData.razonSocial}
                                onChange={(v) => updateField('razonSocial', v)}
                                placeholder="Starcom MediaVest Group Chile SpA"
                                icon={<Building size={18} />}
                                error={errors.razonSocial}
                            />

                            <NeuromorphicInput
                                label="Nombre Comercial"
                                value={formData.nombreComercial}
                                onChange={(v) => updateField('nombreComercial', v)}
                                placeholder="Starcom"
                                icon={<Briefcase size={18} />}
                            />

                            <NeuromorphicSelect
                                label="Tipo de Agencia *"
                                value={formData.tipoAgencia}
                                onChange={(v) => updateField('tipoAgencia', v)}
                                options={[{ value: '', label: 'Selecciona un tipo...' }, ...tipoAgencias]}
                                icon={<Target size={18} />}
                                error={errors.tipoAgencia}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <NeuromorphicInput
                                    label="Ciudad"
                                    value={formData.ciudad}
                                    onChange={(v) => updateField('ciudad', v)}
                                    placeholder="Santiago"
                                />
                                <NeuromorphicSelect
                                    label="País"
                                    value={formData.pais}
                                    onChange={(v) => updateField('pais', v)}
                                    options={[
                                        { value: 'Chile', label: '🇨🇱 Chile' },
                                        { value: 'Argentina', label: '🇦🇷 Argentina' },
                                        { value: 'México', label: '🇲🇽 México' },
                                        { value: 'Colombia', label: '🇨🇴 Colombia' },
                                        { value: 'Perú', label: '🇵🇪 Perú' },
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 1: Contact Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                                    📞 Información de Contacto
                                </h2>
                                <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                                    Datos de contacto principal de la agencia
                                </p>
                            </div>

                            <NeuromorphicInput
                                label="Email General *"
                                value={formData.emailGeneral}
                                onChange={(v) => updateField('emailGeneral', v)}
                                placeholder="contacto@agencia.cl"
                                type="email"
                                icon={<Mail size={18} />}
                                error={errors.emailGeneral}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <NeuromorphicInput
                                    label="Teléfono Fijo"
                                    value={formData.telefonoGeneral}
                                    onChange={(v) => updateField('telefonoGeneral', v)}
                                    placeholder="+56 2 2345 6789"
                                    icon={<Building size={18} />}
                                />
                                <NeuromorphicInput
                                    label="Sitio Web"
                                    value={formData.paginaWeb}
                                    onChange={(v) => updateField('paginaWeb', v)}
                                    placeholder="https://www.agencia.cl"
                                    icon={<Globe size={18} />}
                                />
                            </div>

                            <NeuromorphicInput
                                label="Dirección"
                                value={formData.direccion}
                                onChange={(v) => updateField('direccion', v)}
                                placeholder="Av. Apoquindo 4001, Las Condes"
                            />

                            {/* Contact Principal */}
                            <div
                                className="p-4 rounded-2xl"
                                style={{ background: `${colors.accentViolet}08`, border: `1px solid ${colors.accentViolet}20` }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="p-2 rounded-xl"
                                        style={{ background: `${colors.accentViolet}20` }}
                                    >
                                        <User size={20} style={{ color: colors.accentViolet }} />
                                    </div>
                                    <div>
                                        <h3 style={{ color: colors.textPrimary, fontWeight: 600 }}>
                                            Contacto Principal
                                        </h3>
                                        <p style={{ color: colors.textMuted, fontSize: '12px' }}>
                                            Persona clave de la agencia
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <NeuromorphicInput
                                        label="Nombre"
                                        value={formData.contactoNombre}
                                        onChange={(v) => updateField('contactoNombre', v)}
                                        placeholder="María"
                                    />
                                    <NeuromorphicInput
                                        label="Apellido"
                                        value={formData.contactoApellido}
                                        onChange={(v) => updateField('contactoApellido', v)}
                                        placeholder="González"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <NeuromorphicInput
                                        label="Email"
                                        value={formData.contactoEmail}
                                        onChange={(v) => updateField('contactoEmail', v)}
                                        placeholder="maria@agencia.cl"
                                        type="email"
                                        icon={<Mail size={18} />}
                                    />
                                    <NeuromorphicInput
                                        label="Teléfono Móvil"
                                        value={formData.contactoTelefono}
                                        onChange={(v) => updateField('contactoTelefono', v)}
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>

                                <div className="mt-4">
                                    <NeuromorphicInput
                                        label="Cargo"
                                        value={formData.contactoCargo}
                                        onChange={(v) => updateField('contactoCargo', v)}
                                        placeholder="Country Manager"
                                        icon={<Briefcase size={18} />}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Business Info */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                                    💼 Información de Negocio
                                </h2>
                                <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                                    Clasificaciones y especializaciones
                                </p>
                            </div>

                            <ChipSelector
                                label="Especializaciones Verticales *"
                                options={especializaciones}
                                selected={formData.especializaciones}
                                onChange={(selected) => updateField('especializaciones', selected)}
                                multiSelect
                            />

                            <ChipSelector
                                label="Capacidades Digitales"
                                options={capacidades}
                                selected={formData.capacidadesDigitales}
                                onChange={(selected) => updateField('capacidadesDigitales', selected)}
                                multiSelect
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <NeuromorphicInput
                                    label="Giro de Actividad"
                                    value={formData.giroActividad}
                                    onChange={(v) => updateField('giroActividad', v)}
                                    placeholder="Publicidad y marketing"
                                />
                                <NeuromorphicInput
                                    label="Número de Empleados"
                                    value={formData.empleadosCantidad.toString()}
                                    onChange={(v) => updateField('empleadosCantidad', parseInt(v) || 0)}
                                    type="number"
                                />
                            </div>

                            <NeuromorphicInput
                                label="Revenue Anual Estimado (CLP)"
                                value={formData.revenueAnual.toString()}
                                onChange={(v) => updateField('revenueAnual', parseInt(v) || 0)}
                                type="number"
                                helpText="Ingresalo en pesos chilenos"
                            />
                        </div>
                    )}

                    {/* STEP 3: Commission */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                                    💰 Configuración Comercial
                                </h2>
                                <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                                    Términos y comisiones
                                </p>
                            </div>

                            {/* Commission Preview */}
                            <div
                                className="p-4 rounded-2xl"
                                style={{
                                    background: `linear-gradient(145deg, ${colors.accentEmerald}10, ${colors.accentEmerald}05)`,
                                    border: `1px solid ${colors.accentEmerald}20`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-3 rounded-xl"
                                        style={{ background: `${colors.accentEmerald}20` }}
                                    >
                                        <DollarSign size={24} style={{ color: colors.accentEmerald }} />
                                    </div>
                                    <div>
                                        <h3 style={{ color: colors.textPrimary, fontWeight: 600 }}>
                                            Comisión Sugerida: {formData.comisionPorcentaje}%
                                        </h3>
                                        <p style={{ color: colors.textMuted, fontSize: '13px' }}>
                                            Basada en el nivel de partnership estimado
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <NeuromorphicInput
                                    label="Comisión %"
                                    value={formData.comisionPorcentaje.toString()}
                                    onChange={(v) => updateField('comisionPorcentaje', parseFloat(v) || 0)}
                                    type="number"
                                    helpText="Porcentaje sobre medios contratados"
                                />
                                <NeuromorphicSelect
                                    label="Tipo de Comisión"
                                    value={formData.tipoComision}
                                    onChange={(v) => updateField('tipoComision', v)}
                                    options={[
                                        { value: 'porcentaje', label: 'Por Porcentaje' },
                                        { value: 'fija', label: 'Fee Fijo' },
                                        { value: 'mixta', label: 'Mixta (% + Fee)' },
                                    ]}
                                />
                            </div>

                            {/* Commission Tiers Info */}
                            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                <h4 style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: '12px' }}>
                                    📊 Rangos de Comisión por Nivel
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>🌟 Estratégico ($100M+)</span>
                                        <span style={{ color: colors.accentEmerald, fontWeight: 600 }}>12-20%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>💎 Preferencial ($50M-100M)</span>
                                        <span style={{ color: colors.accentEmerald, fontWeight: 600 }}>10-17%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>🥇 Estándar ($10M-50M)</span>
                                        <span style={{ color: colors.textSecondary, fontWeight: 600 }}>8-15%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>🥈 Transaccional ($1M-10M)</span>
                                        <span style={{ color: colors.textMuted, fontWeight: 600 }}>5-12%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Confirmation */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                                    ✅ Confirmar Creación
                                </h2>
                                <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                                    Revisa los datos antes de crear la agencia
                                </p>
                            </div>

                            {/* Summary Card */}
                            <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.8)' }}>
                                <div className="flex items-start gap-4 mb-6">
                                    <div
                                        className="p-4 rounded-2xl"
                                        style={{ background: `linear-gradient(145deg, ${colors.accentCyan}20, ${colors.accentCyan}10)` }}
                                    >
                                        <Briefcase size={32} style={{ color: colors.accentCyan }} />
                                    </div>
                                    <div>
                                        <h3 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700 }}>
                                            {formData.nombreComercial || formData.razonSocial}
                                        </h3>
                                        <p style={{ color: colors.textMuted }}>
                                            {formData.codigo || 'AGM-XXXX'} • {formData.tipoAgencia || 'Tipo no especificado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <SummaryItem label="RUT" value={formData.rut} />
                                    <SummaryItem label="Ciudad" value={formData.ciudad || 'N/A'} />
                                    <SummaryItem label="Email" value={formData.emailGeneral || 'N/A'} />
                                    <SummaryItem label="Teléfono" value={formData.telefonoGeneral || 'N/A'} />
                                    <SummaryItem label="Comisión" value={`${formData.comisionPorcentaje}%`} />
                                    <SummaryItem label="Especializaciones" value={formData.especializaciones.join(', ') || 'N/A'} />
                                </div>

                                {formData.contactoNombre && (
                                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(163, 177, 198, 0.2)' }}>
                                        <h4 style={{ color: colors.textSecondary, fontWeight: 600, marginBottom: '8px' }}>
                                            Contacto Principal
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                                style={{ background: `${colors.accentViolet}20` }}
                                            >
                                                <User size={20} style={{ color: colors.accentViolet }} />
                                            </div>
                                            <div>
                                                <p style={{ color: colors.textPrimary, fontWeight: 600 }}>
                                                    {formData.contactoNombre} {formData.contactoApellido}
                                                </p>
                                                <p style={{ color: colors.textMuted, fontSize: '13px' }}>
                                                    {formData.contactoCargo} • {formData.contactoEmail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Security Badge */}
                            <div
                                className="p-4 rounded-2xl flex items-center gap-3"
                                style={{ background: `${colors.accentCyan}08` }}
                            >
                                <Lock size={20} style={{ color: colors.accentCyan }} />
                                <div>
                                    <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px' }}>
                                        🔒 Datos Protegidos
                                    </p>
                                    <p style={{ color: colors.textMuted, fontSize: '12px' }}>
                                        Esta información estará cifrada y solo será visible para usuarios autorizados
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(163, 177, 198, 0.2)' }}>
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 shadow-sm shadow-slate-200/50 border border-white/40 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <ChevronLeft size={18} />
                            Anterior
                        </button>

                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 rounded-xl font-medium flex items-center gap-2"
                                style={{
                                    background: `linear-gradient(145deg, ${colors.accentCyan}, #0891b2)`,
                                    color: '#fff',
                                    boxShadow: `0 4px 16px ${colors.accentCyan}40`,
                                }}
                            >
                                Siguiente
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 rounded-xl font-medium flex items-center gap-2"
                                style={{
                                    background: `linear-gradient(145deg, ${colors.accentEmerald}, #059669)`,
                                    color: '#fff',
                                    boxShadow: `0 4px 16px ${colors.accentEmerald}40`,
                                }}
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Creando...</>
                                ) : (
                                    <><CheckCircle2 size={18} /> Crear Agencia</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper component
const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p style={{ color: colors.textMuted, fontSize: '11px' }}>{label}</p>
        <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px' }}>{value}</p>
    </div>
);
