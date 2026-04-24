'use client';

/**
 * 🎨 SILEXAR PULSE - Editar Agencia Creativa
 * 
 * @description Página de edición de agencia existente
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AgenciaCreativa {
    id: string;
    codigo: string;
    rut: string | null;
    razonSocial: string;
    nombreFantasia: string | null;
    tipoAgencia: string;
    porcentajeComision: number;
    emailGeneral: string | null;
    telefonoGeneral: string | null;
    paginaWeb: string | null;
    direccion: string | null;
    ciudad: string | null;
    pais: string | null;
    nombreContacto: string | null;
    cargoContacto: string | null;
    emailContacto: string | null;
    telefonoContacto: string | null;
    estado: string;
    activa: boolean;
}

interface EditAgenciaForm {
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
    required = false,
    disabled = false
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
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
            disabled={disabled}
            className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200"
            style={{
                background: disabled ? N.base : N.light,
                color: N.text,
                boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`,
                border: 'none',
                opacity: disabled ? 0.7 : 1
            }}
        />
    </div>
);

const NeuSelect = ({
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    disabled?: boolean;
}) => (
    <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider" style={{ color: N.textSub }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200 appearance-none cursor-pointer"
            style={{
                background: disabled ? N.base : N.light,
                color: N.text,
                boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`,
                border: 'none',
                opacity: disabled ? 0.7 : 1
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

// ═══════════════════════════════════════════════════════════════
// PÁGINA DE EDICIÓN
// ═══════════════════════════════════════════════════════════════

export default function EditarAgenciaCreativaPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [agencia, setAgencia] = useState<AgenciaCreativa | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [form, setForm] = useState<EditAgenciaForm>({
        razonSocial: '',
        nombreFantasia: '',
        rut: '',
        tipoAgencia: 'publicidad',
        emailGeneral: '',
        telefonoGeneral: '',
        paginaWeb: '',
        direccion: '',
        ciudad: '',
        pais: '',
        nombreContacto: '',
        cargoContacto: '',
        emailContacto: '',
        telefonoContacto: '',
        porcentajeComision: 15,
    });

    const fetchAgencia = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/agencias-creativas?id=${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                const agenciaData = Array.isArray(data.data)
                    ? data.data.find((a: AgenciaCreativa) => a.id === id)
                    : data.data;

                if (agenciaData) {
                    setAgencia(agenciaData);
                    setForm({
                        razonSocial: agenciaData.razonSocial || '',
                        nombreFantasia: agenciaData.nombreFantasia || '',
                        rut: agenciaData.rut || '',
                        tipoAgencia: agenciaData.tipoAgencia || 'publicidad',
                        emailGeneral: agenciaData.emailGeneral || '',
                        telefonoGeneral: agenciaData.telefonoGeneral || '',
                        paginaWeb: agenciaData.paginaWeb || '',
                        direccion: agenciaData.direccion || '',
                        ciudad: agenciaData.ciudad || '',
                        pais: agenciaData.pais || '',
                        nombreContacto: agenciaData.nombreContacto || '',
                        cargoContacto: agenciaData.cargoContacto || '',
                        emailContacto: agenciaData.emailContacto || '',
                        telefonoContacto: agenciaData.telefonoContacto || '',
                        porcentajeComision: agenciaData.porcentajeComision || 15,
                    });
                }
            } else {
                setError(data.error || 'Error al cargar la agencia');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchAgencia();
        }
    }, [id, fetchAgencia]);

    const updateForm = (field: keyof EditAgenciaForm, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.razonSocial.trim()) {
            setError('La razón social es obligatoria');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/agencias-creativas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...form }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Agencia actualizada correctamente');
                setTimeout(() => {
                    router.push(`/agencias-creativas/${id}`);
                }, 1500);
            } else {
                setError(data.error || 'Error al actualizar la agencia');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}>
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-12 w-64 rounded-2xl" style={{ background: N.base }} />
                        <div className="h-96 rounded-3xl" style={{ background: N.base }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !agencia) {
        return (
            <div className="min-h-screen p-8" style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}>
                <div className="max-w-2xl mx-auto">
                    <NeuCard className="text-center py-12">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
                        <h2 className="text-xl font-bold mb-2" style={{ color: N.text }}>
                            {error || 'Agencia no encontrada'}
                        </h2>
                        <NeuButton variant="secondary" onClick={() => router.push('/agencias-creativas')}>
                            Volver a Agencias
                        </NeuButton>
                    </NeuCard>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-6 lg:p-8"
            style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}
        >
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push(`/agencias-creativas/${id}`)}
                        className="p-3 rounded-2xl transition-all duration-200"
                        style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}` }}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: N.text }} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black" style={{ color: N.text }}>
                            Editar Agencia
                        </h1>
                        <p className="text-sm" style={{ color: N.textSub }}>
                            {agencia?.codigo} • {agencia?.nombreFantasia || agencia?.razonSocial}
                        </p>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <NeuCard className="border-2 border-red-300 bg-red-50">
                        <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </p>
                    </NeuCard>
                )}

                {success && (
                    <NeuCard className="border-2 border-green-300 bg-green-50">
                        <p className="text-green-600 text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {success}
                        </p>
                    </NeuCard>
                )}

                {/* Form */}
                <NeuCard>
                    <div className="space-y-6">
                        {/* Información Legal */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold" style={{ color: N.text }}>Información Legal</h3>

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

                        {/* Contacto */}
                        <div className="space-y-4 pt-4 border-t-2" style={{ borderColor: N.dark }}>
                            <h3 className="text-lg font-bold" style={{ color: N.text }}>Información de Contacto</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <NeuInput
                                    label="Email General"
                                    value={form.emailGeneral}
                                    onChange={(v) => updateForm('emailGeneral', v)}
                                    placeholder="contacto@empresa.cl"
                                    type="email"
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
                        </div>

                        {/* Contacto Principal */}
                        <div className="space-y-4 pt-4 border-t-2" style={{ borderColor: N.dark }}>
                            <h3 className="text-lg font-bold" style={{ color: N.text }}>Contacto Principal</h3>

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

                            <div className="grid grid-cols-2 gap-4">
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

                        {/* Comercial */}
                        <div className="space-y-4 pt-4 border-t-2" style={{ borderColor: N.dark }}>
                            <h3 className="text-lg font-bold" style={{ color: N.text }}>Información Comercial</h3>

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
                            </div>
                        </div>
                    </div>
                </NeuCard>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <NeuButton variant="secondary" onClick={() => router.push(`/agencias-creativas/${id}`)}>
                        Cancelar
                    </NeuButton>
                    <NeuButton variant="success" onClick={handleSubmit} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Guardar Cambios
                            </>
                        )}
                    </NeuButton>
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
