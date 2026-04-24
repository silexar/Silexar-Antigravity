'use client';

/**
 * 🎨 SILEXAR PULSE - Nueva Agencia Creativa
 * 
 * @description Wizard de creación de nueva agencia con IA asistida
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    Sparkles,
    Loader2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface NuevaAgenciaForm {
    razonSocial: string;
    nombreFantasia: string;
    rut: string;
    tipoAgencia: string;
    emailGeneral: string;
    telefonoGeneral: string;
    paginaWeb: string;
    direccion: string;
    ciudad: string;
    pais: string;
    nombreContacto: string;
    cargoContacto: string;
    emailContacto: string;
    telefonoContacto: string;
    porcentajeComision: number;
}

type Step = 1 | 2 | 3;

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS (Neuromorphic)
// ═══════════════════════════════════════════════════════════════

const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    text: '#69738c',
    textSub: '#9aa3b8',
}

const S = {
    raised: `shadow-[8px_8px_16px_${N.dark},-8px_-8px_16px_${N.light}]`,
    sm: `shadow-[4px_4px_8px_${N.dark},-4px_-4px_8px_${N.light}]`,
    inset: `shadow-[inset_4px_4px_8px_${N.dark},inset_-4px_-4px_8px_${N.light}]`,
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const NeuCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
        className={`rounded-3xl p-6 ${className}`}
        style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px_-8px 16px ${N.light}` }}
    >
        {children}
    </div>
);

const NeuInput = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = false
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}) => (
    <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: N.textSub }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
            style={{
                background: N.light,
                color: N.text,
                boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`,
                border: 'none'
            }}
        />
    </div>
);

const NeuSelect = ({
    label,
    value,
    onChange,
    options,
    required = false
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
}) => (
    <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: N.textSub }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200 appearance-none cursor-pointer"
            style={{
                background: N.light,
                color: N.text,
                boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`,
                border: 'none'
            }}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const NeuButton = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    type = 'button'
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'success';
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit';
}) => {
    const colors = {
        primary: { bg: N.accent, text: '#ffffff' },
        secondary: { bg: N.base, text: N.text },
        success: { bg: '#10b981', text: '#ffffff' },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
            style={{
                background: colors[variant].bg,
                color: colors[variant].text,
                boxShadow: disabled ? 'none' : `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}`,
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
        >
            {children}
        </button>
    );
};

const StepIndicator = ({ current, total }: { current: Step; total: number }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: total }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all duration-300"
                    style={{
                        background: i + 1 <= current ? N.accent : N.dark,
                        boxShadow: i + 1 <= current ? `2px 2px 6px ${N.dark}` : 'none'
                    }}
                >
                    {i + 1 < current ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < total - 1 && (
                    <div
                        className="w-12 h-1 rounded-full transition-all duration-300"
                        style={{ background: i + 1 < current ? N.accent : N.dark }}
                    />
                )}
            </div>
        ))}
    </div>
);

// ═══════════════════════════════════════════════════════════════
// PÁGINA DE CREACIÓN
// ═══════════════════════════════════════════════════════════════

export default function NuevaAgenciaCreativaPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<NuevaAgenciaForm>({
        razonSocial: '',
        nombreFantasia: '',
        rut: '',
        tipoAgencia: 'publicidad',
        emailGeneral: '',
        telefonoGeneral: '',
        paginaWeb: '',
        direccion: '',
        ciudad: 'Santiago',
        pais: 'Chile',
        nombreContacto: '',
        cargoContacto: '',
        emailContacto: '',
        telefonoContacto: '',
        porcentajeComision: 15,
    });

    const updateForm = (field: keyof NuevaAgenciaForm, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (currentStep: Step): boolean => {
        switch (currentStep) {
            case 1:
                if (!form.razonSocial.trim()) {
                    setError('La razón social es obligatoria');
                    return false;
                }
                if (!form.rut.trim()) {
                    setError('El RUT es obligatorio');
                    return false;
                }
                break;
            case 2:
                if (!form.emailGeneral.trim()) {
                    setError('El email es obligatorio');
                    return false;
                }
                break;
            case 3:
                if (!form.porcentajeComision || form.porcentajeComision < 0 || form.porcentajeComision > 100) {
                    setError('El porcentaje de comisión debe estar entre 0 y 100');
                    return false;
                }
                break;
        }
        setError(null);
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => Math.min(prev + 1, 3) as Step);
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1) as Step);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/agencias-creativas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (data.success) {
                router.push(`/agencias-creativas/${data.data.id}`);
            } else {
                setError(data.error || 'Error al crear la agencia');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen p-6 lg:p-8"
            style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}
        >
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/agencias-creativas')}
                        className="p-3 rounded-2xl transition-all duration-200"
                        style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}` }}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: N.text }} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black" style={{ color: N.text }}>
                            Nueva Agencia Creativa
                        </h1>
                        <p className="text-sm" style={{ color: N.textSub }}>
                            Completa los datos para registrar una nueva agencia
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <StepIndicator current={step} total={3} />

                {/* Error Message */}
                {error && (
                    <NeuCard className="border-2 border-red-300 bg-red-50">
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                    </NeuCard>
                )}

                {/* Form Steps */}
                <NeuCard>
                    {/* Step 1: Información Legal */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl" style={{ background: N.accent }}>
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: N.text }}>
                                        Información Legal
                                    </h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>
                                        Datos oficiales de la empresa
                                    </p>
                                </div>
                            </div>

                            <NeuInput
                                label="Razón Social"
                                value={form.razonSocial}
                                onChange={(v) => updateForm('razonSocial', v)}
                                placeholder="Ej: Creativos Asociados Ltda"
                                required
                            />

                            <NeuInput
                                label="Nombre de Fantasía"
                                value={form.nombreFantasia}
                                onChange={(v) => updateForm('nombreFantasia', v)}
                                placeholder="Ej: BlueWave Creative"
                            />

                            <NeuInput
                                label="RUT"
                                value={form.rut}
                                onChange={(v) => updateForm('rut', v)}
                                placeholder="Ej: 76.111.222-3"
                                required
                            />

                            <NeuSelect
                                label="Tipo de Agencia"
                                value={form.tipoAgencia}
                                onChange={(v) => updateForm('tipoAgencia', v)}
                                options={[
                                    { value: 'publicidad', label: 'Publicidad' },
                                    { value: 'digital', label: 'Digital' },
                                    { value: 'medios', label: 'Medios' },
                                    { value: 'btl', label: 'BTL' },
                                    { value: 'integral', label: 'Integral' },
                                    { value: 'boutique', label: 'Boutique' },
                                ]}
                                required
                            />
                        </div>
                    )}

                    {/* Step 2: Contacto */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl" style={{ background: N.accent }}>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: N.text }}>
                                        Información de Contacto
                                    </h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>
                                        Datos de contacto general y ejecutivo
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <NeuInput
                                    label="Email General"
                                    value={form.emailGeneral}
                                    onChange={(v) => updateForm('emailGeneral', v)}
                                    placeholder="contacto@empresa.cl"
                                    type="email"
                                    required
                                />
                                <NeuInput
                                    label="Teléfono General"
                                    value={form.telefonoGeneral}
                                    onChange={(v) => updateForm('telefonoGeneral', v)}
                                    placeholder="+56 2 2345 6789"
                                    type="tel"
                                />
                            </div>

                            <NeuInput
                                label="Sitio Web"
                                value={form.paginaWeb}
                                onChange={(v) => updateForm('paginaWeb', v)}
                                placeholder="www.empresa.cl"
                            />

                            <NeuInput
                                label="Dirección"
                                value={form.direccion}
                                onChange={(v) => updateForm('direccion', v)}
                                placeholder="Av. Providencia 1234"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <NeuInput
                                    label="Ciudad"
                                    value={form.ciudad}
                                    onChange={(v) => updateForm('ciudad', v)}
                                    placeholder="Santiago"
                                />
                                <NeuInput
                                    label="País"
                                    value={form.pais}
                                    onChange={(v) => updateForm('pais', v)}
                                    placeholder="Chile"
                                />
                            </div>

                            <div className="border-t-2 pt-4 mt-4" style={{ borderColor: N.dark }}>
                                <h3 className="text-lg font-bold mb-4" style={{ color: N.text }}>
                                    Contacto Principal (Opcional)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <NeuInput
                                        label="Nombre Completo"
                                        value={form.nombreContacto}
                                        onChange={(v) => updateForm('nombreContacto', v)}
                                        placeholder="Juan Pérez"
                                    />
                                    <NeuInput
                                        label="Cargo"
                                        value={form.cargoContacto}
                                        onChange={(v) => updateForm('cargoContacto', v)}
                                        placeholder="Director Creativo"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <NeuInput
                                        label="Email"
                                        value={form.emailContacto}
                                        onChange={(v) => updateForm('emailContacto', v)}
                                        placeholder="jperez@empresa.cl"
                                        type="email"
                                    />
                                    <NeuInput
                                        label="Teléfono"
                                        value={form.telefonoContacto}
                                        onChange={(v) => updateForm('telefonoContacto', v)}
                                        placeholder="+56 9 8765 4321"
                                        type="tel"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Comercial */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl" style={{ background: N.accent }}>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: N.text }}>
                                        Información Comercial
                                    </h2>
                                    <p className="text-sm" style={{ color: N.textSub }}>
                                        Configuración de comisiones y términos
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: N.textSub }}>
                                    Porcentaje de Comisión (%) <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.porcentajeComision}
                                    onChange={(e) => updateForm('porcentajeComision', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
                                    style={{
                                        background: N.light,
                                        color: N.text,
                                        boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`,
                                        border: 'none'
                                    }}
                                />
                                <p className="text-xs" style={{ color: N.textSub }}>
                                    Porcentaje de comisión que recibe la agencia por campañas gestionadas
                                </p>
                            </div>

                            {/* Resumen */}
                            <div
                                className="p-4 rounded-2xl mt-6"
                                style={{ background: N.light, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}
                            >
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: N.textSub }}>
                                    Resumen de la Agencia
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span style={{ color: N.textSub }}>Nombre:</span>
                                        <span className="font-medium" style={{ color: N.text }}>
                                            {form.nombreFantasia || form.razonSocial}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: N.textSub }}>RUT:</span>
                                        <span className="font-medium" style={{ color: N.text }}>{form.rut}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: N.textSub }}>Tipo:</span>
                                        <span className="font-medium" style={{ color: N.text }}>
                                            {form.tipoAgencia.charAt(0).toUpperCase() + form.tipoAgencia.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: N.textSub }}>Comisión:</span>
                                        <span className="font-medium" style={{ color: N.text }}>{form.porcentajeComision}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </NeuCard>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    {step > 1 ? (
                        <NeuButton variant="secondary" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4" /> Anterior
                        </NeuButton>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <NeuButton variant="primary" onClick={handleNext}>
                            Siguiente <ArrowRight className="w-4 h-4" />
                        </NeuButton>
                    ) : (
                        <NeuButton variant="success" onClick={handleSubmit} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Creando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" /> Crear Agencia
                                </>
                            )}
                        </NeuButton>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center pt-4">
                    <p className="text-sm" style={{ color: N.textSub }}>
                        🎨 Agencias Creativas - SILEXAR PULSE TIER 0
                    </p>
                </div>
            </div>
        </div>
    );
}
