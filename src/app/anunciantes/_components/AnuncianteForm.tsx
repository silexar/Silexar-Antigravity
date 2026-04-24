'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Save, ArrowLeft, ArrowRight, Loader2, Globe, Mail, Phone,
  MapPin, User, Briefcase, FileText, AlertTriangle, FileSignature, Map, CheckCircle2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// --- Tipos de Datos ---
export interface AnuncianteFormData {
  nombreRazonSocial: string;
  rut: string;
  categoriaCliente: string;
  giroActividad: string;
  direccion: string;
  numeroOficina: string;
  departamento: string;
  ciudad: string;
  comunaProvincia: string;
  pais: string;
  emailContacto: string;
  telefonoContacto: string;
  paginaWeb: string;
  nombreContactoPrincipal: string;
  cargoContactoPrincipal: string;
  tieneFacturacionElectronica: boolean;
  direccionFacturacion: string;
  emailFacturacion: string;
  numeroDeudor: string;
  tipoDTE: string;
  condicionPago: string;
  riesgoFinanciero: string;
  notas: string;
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
}

interface AnuncianteFormProps {
  initialData?: Partial<AnuncianteFormData>;
  mode: 'create' | 'edit';
  onSubmit: (data: AnuncianteFormData) => Promise<void>;
  isLoading?: boolean;
}

const defaultData: AnuncianteFormData = {
  nombreRazonSocial: '', rut: '', categoriaCliente: '', giroActividad: '', direccion: '', numeroOficina: '',
  departamento: '', ciudad: '', comunaProvincia: '', pais: 'Chile', emailContacto: '',
  telefonoContacto: '', paginaWeb: '', nombreContactoPrincipal: '', cargoContactoPrincipal: '',
  tieneFacturacionElectronica: false, direccionFacturacion: '', emailFacturacion: '',
  numeroDeudor: '', tipoDTE: 'Factura Electrónica', condicionPago: '30 días',
  riesgoFinanciero: 'A', notas: '', estado: 'activo',
};

// --- Datos Geográficos ---
const PAISES = ["Chile", "Argentina", "Perú", "Colombia", "México", "Estados Unidos", "España", "Brasil", "Uruguay"];
const CIUDADES_CHILE = ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Iquique", "Rancagua", "Talca", "Arica", "Puerto Montt", "Chillán", "Los Ángeles", "Valdivia"];
const COMUNAS_SANTIAGO = ["Santiago Centro", "Providencia", "Las Condes", "Vitacura", "Lo Barnechea", "Ñuñoa", "La Reina", "Macul", "Peñalolén", "La Florida", "Maipú", "Puente Alto", "San Bernardo", "Quilicura", "Pudahuel", "Huechuraba"];
const CIUDADES_EXTRANJERAS: Record<string, string[]> = {
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"],
  "Perú": ["Lima", "Arequipa", "Trujillo", "Chiclayo"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla"],
  "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Cancún"],
  "Estados Unidos": ["New York", "Los Angeles", "Chicago", "Miami"],
  "España": ["Madrid", "Barcelona", "Valencia", "Sevilla"]
};

const RIESGOS_FINANCIEROS = [
  { id: 'AAA', desc: 'Riesgo Nulo. Capacidad de pago sobresaliente.' },
  { id: 'AA', desc: 'Riesgo Muy Bajo. Alta calidad crediticia.' },
  { id: 'A', desc: 'Riesgo Bajo. Buena capacidad de pago.' },
  { id: 'BBB', desc: 'Riesgo Moderado-Bajo. Capacidad adecuada.' },
  { id: 'BB', desc: 'Riesgo Moderado. Sensible a cambios económicos.' },
  { id: 'B', desc: 'Riesgo Moderado-Alto. Historial con pequeños atrasos.' },
  { id: 'CCC', desc: 'Riesgo Alto. Vulnerabilidad actual.' },
  { id: 'CC', desc: 'Riesgo Muy Alto. Alta probabilidad de impago.' },
  { id: 'C', desc: 'Riesgo Crítico. Procedimientos de cobranza inminentes.' },
  { id: 'D', desc: 'Default. En cese de pagos o quiebra.' },
  { id: 'En Observación', desc: 'Cliente bajo monitoreo estricto por comportamiento irregular.' }
];

const TIPOS_DTE = ["Factura Electrónica (33)", "Factura Exenta Electrónica (34)", "Boleta Electrónica (39)"];
const CONDICIONES_PAGO = ["Al contado", "15 días", "30 días", "45 días", "60 días", "90 días"];

// --- Utilidades ---
const formatRut = (rut: string): string => {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
};

const validarRutChileno = (rut: string): boolean => {
  if (!rut) return false;
  // Debe contener exactamente un guión en la penúltima posición para ser formalmente válido
  if (!/^[0-9]+-[0-9K]$/i.test(rut)) return false;
  // Limpiamos todo menos números y K, y convertimos a mayúscula
  const cleanRut = rut.replace(/[^0-9kK]+/g, '').toUpperCase();
  if (cleanRut.length < 7) return false;
  
  const dv = cleanRut.slice(-1);
  let rutNum = parseInt(cleanRut.slice(0, -1), 10);
  
  if (isNaN(rutNum)) return false;

  let m = 0, s = 1;
  for (; rutNum; rutNum = Math.floor(rutNum / 10)) {
    s = (s + (rutNum % 10) * (9 - (m++ % 6))) % 11;
  }
  const expectedDv = s ? (s - 1).toString() : 'K';
  
  return dv === expectedDv;
};

// --- Tokens Neumórficos TIER 0 Compactos ---
const neoCard = "w-full bg-[#dfeaff] rounded-[1.5rem] p-6 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40";
const neoInput = "bg-[#dfeaff] rounded-xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] text-[#69738c] focus:outline-none focus:ring-2 focus:ring-[#6888ff]/50 transition-all px-4 py-2.5 w-full placeholder-[#9aa3b8] border-none text-sm font-medium";
const neoInputError = "ring-2 ring-red-400 focus:ring-red-400";
const neoBtnPrimary = "bg-[#6888ff] rounded-full text-white font-bold shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff] hover:bg-[#5572ee] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)] transition-all duration-300 px-6 py-2.5 flex items-center justify-center gap-2 border-none disabled:opacity-50 text-sm";
const neoBtnSecondary = "bg-[#dfeaff] rounded-full text-[#69738c] font-bold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 px-6 py-2.5 flex items-center justify-center gap-2 border-none disabled:opacity-50 text-sm";
const labelClass = "block text-[13px] font-bold text-[#69738c] mb-1.5 ml-1";

const STEPS = [
  { id: 1, title: 'Legal y Fiscal', icon: Building2 },
  { id: 2, title: 'Ubicación', icon: MapPin },
  { id: 3, title: 'Contacto', icon: Mail },
  { id: 4, title: 'Facturación', icon: FileSignature },
];

const NeumorphicMap = ({ address, label }: { address: string, label: string }) => (
  <div className="w-full h-32 mt-6 rounded-xl overflow-hidden relative shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] bg-[#dfeaff] flex flex-row items-center justify-center border border-white/30 group px-6 gap-5">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 via-[#dfeaff] to-[#dfeaff] group-hover:scale-105 transition-transform duration-1000"></div>
    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#6888ff 1px, transparent 1px), linear-gradient(90deg, #6888ff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
    <div className="relative z-10 flex-shrink-0">
      <MapPin className="w-10 h-10 text-[#6888ff] drop-shadow-md" />
      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></span>
    </div>
    <div className="z-10 flex flex-col flex-1 min-w-0">
      <span className="text-[#69738c] font-bold text-xs bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm self-start mb-1.5 border border-white/50">📍 {label}</span>
      <span className="text-[#69738c] font-medium text-sm truncate w-full">{address && address.length > 3 ? address : 'Ingresa una dirección válida...'}</span>
    </div>
    <div className="absolute bottom-2 right-3 flex items-center gap-1 opacity-50"><Map className="w-4 h-4 text-[#69738c]" /><span className="text-xs font-bold text-[#69738c]">Maps API</span></div>
  </div>
);

export function AnuncianteForm({ initialData, mode, onSubmit, isLoading = false }: AnuncianteFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AnuncianteFormData>({ ...defaultData, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  // Mapa de códigos de país para Nominatim
  const COUNTRY_CODES: Record<string, string> = {
    Chile: 'cl', Argentina: 'ar', Perú: 'pe', Colombia: 'co',
    México: 'mx', 'Estados Unidos': 'us', España: 'es', Brasil: 'br', Uruguay: 'uy',
  };

  const searchAddress = async (query: string) => {
    if (query.length < 4) { setAddressSuggestions([]); return; }
    setAddressLoading(true);
    try {
      const cc = COUNTRY_CODES[form.pais] ?? '';
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=${cc}&format=json&addressdetails=1&limit=6`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es', 'User-Agent': 'SilexarPulse/1.0' } });
      const json = await res.json();
      setAddressSuggestions(json.map((item: { display_name: string }) => item.display_name));
      setShowAddressSuggestions(true);
    } catch { setAddressSuggestions([]); } finally { setAddressLoading(false); }
  };

  const updateField = <K extends keyof AnuncianteFormData>(field: K, value: AnuncianteFormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const handlePaisChange = (pais: string) => {
    updateField('pais', pais); updateField('ciudad', ''); updateField('comunaProvincia', '');
  };

  const ciudadesDisponibles = form.pais === 'Chile' ? CIUDADES_CHILE : (CIUDADES_EXTRANJERAS[form.pais] || []);

  const validateStep = (step: number): boolean => {
    const nextErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.nombreRazonSocial.trim()) nextErrors.nombreRazonSocial = 'La Razón Social es obligatoria';
      if (!form.categoriaCliente) nextErrors.categoriaCliente = 'Debe seleccionar una categoría de cliente';
      if (!form.rut.trim()) nextErrors.rut = 'El RUT es obligatorio';
      else if (form.pais === 'Chile' && !validarRutChileno(form.rut)) nextErrors.rut = 'El RUT ingresado no corresponde a un RUT válido. Recuerde el formato: 12345678-9';
    }
    if (step === 2) {
      if (!form.direccion.trim()) nextErrors.direccion = 'La dirección es obligatoria';
      if (!form.ciudad.trim()) nextErrors.ciudad = 'Debe seleccionar una ciudad';
      if (!form.comunaProvincia.trim()) nextErrors.comunaProvincia = 'Debe seleccionar una comuna';
    }
    if (step === 3) {
      if (form.emailContacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailContacto)) {
        nextErrors.emailContacto = 'Formato de email inválido';
      }
      if (!form.nombreContactoPrincipal.trim()) nextErrors.nombreContactoPrincipal = 'El nombre del representante es obligatorio';
      if (!form.cargoContactoPrincipal.trim()) nextErrors.cargoContactoPrincipal = 'El cargo del representante es obligatorio';
    }
    if (step === 4) {
      if (!form.riesgoFinanciero) nextErrors.riesgoFinanciero = 'Debe asignar un perfil de riesgo financiero';
      if (form.tieneFacturacionElectronica && !form.numeroDeudor.trim()) {
        nextErrors.numeroDeudor = 'El N° de Deudor es obligatorio para DTE';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) { setDirection(1); setCurrentStep(prev => Math.min(prev + 1, STEPS.length)); } };
  const handlePrev = () => { setDirection(-1); setCurrentStep(prev => Math.max(prev - 1, 1)); };
  const handleSubmit = async () => { if (validateStep(4)) await onSubmit(form); };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    // Wrapper transparente, centrado, con menor padding vertical para aprovechar mejor la pantalla
    <div className="w-full flex flex-col items-center justify-center py-4">
      
      <div className="w-full max-w-4xl mx-auto flex flex-col">
        
        {/* HEADER Y STEPPER - Centrados, en línea y ultracompactos */}
        <div className="flex flex-col mb-5 w-full">
          
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
              <Building2 className="w-6 h-6 text-[#6888ff]" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-extrabold text-[#69738c] tracking-tight drop-shadow-sm leading-tight">
                {mode === 'create' ? 'Nuevo Anunciante' : 'Editar Anunciante'}
              </h1>
              <p className="text-[#9aa3b8] font-medium text-xs">Completa el formulario interactivo paso a paso</p>
            </div>
          </div>

          <div className="flex flex-nowrap items-center mx-auto bg-[#dfeaff] p-2.5 rounded-2xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] max-w-full overflow-x-auto lg:overflow-visible">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const Icon = isCompleted ? CheckCircle2 : step.icon;
              return (
                <div key={step.id} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#6888ff] text-white shadow-[2px_2px_6px_#bec8de,-2px_-2px_6px_#ffffff]' : isCompleted ? 'text-emerald-500' : 'text-[#9aa3b8]'}`}>
                    <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="text-xs sm:text-sm font-bold hidden sm:inline-block">{step.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && <div className={`w-6 sm:w-16 h-1 mx-2 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-[#bec8de]/50'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO DESLIZANTE - Sin alturas fijas, crecerá según el contenido */}
        <div className="w-full relative">
          {/* AnimatePresence mode="wait" asegura que la tarjeta actual desaparezca antes de que aparezca la siguiente, evitando solapamientos y scrollbars raros */}
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full pb-8"
            >
              
              {/* PASO 1 */}
              {currentStep === 1 && (
                <div className={neoCard}>
                  <h2 className="text-xl font-bold text-[#6888ff] mb-6 flex items-center gap-2"><Building2 className="w-6 h-6" /> Información Legal y Fiscal</h2>
                  
                  {/* Selector de Categoría */}
                  <div className="mb-5">
                    <label className={labelClass}>Categoría del Cliente *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                      {[
                        { id: 'normal', label: 'Cliente General', icon: '🏢', desc: 'Empresa o persona sin restricciones especiales', color: '#6888ff' },
                        { id: 'politica', label: 'Contenido Político', icon: '🏛️', desc: 'Partidos, candidatos o propaganda electoral', color: '#f59e0b' },
                        { id: 'juego_azar', label: 'Juego de Azar', icon: '🎰', desc: 'Casinos, apuestas y loterías', color: '#ef4444' },
                      ].map((cat) => {
                        const isSel = form.categoriaCliente === cat.id;
                        return (
                          <button key={cat.id} type="button" onClick={() => updateField('categoriaCliente', cat.id)}
                            className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                              isSel
                                ? 'border-transparent shadow-[inset_4px_4px_8px_rgba(0,0,0,0.12)]'
                                : 'border-transparent shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]'
                            } bg-[#dfeaff]`}
                            style={isSel ? { boxShadow: `inset 3px 3px 7px #bec8de, inset -3px -3px 7px #ffffff, 0 0 0 2px ${cat.color}` } : {}}
                          >
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="text-sm font-bold" style={{ color: isSel ? cat.color : '#69738c' }}>{cat.label}</span>
                            <span className="text-[11px] text-[#9aa3b8] leading-tight">{cat.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.categoriaCliente && <p className="text-xs text-red-500 mt-2 font-bold ml-1">{errors.categoriaCliente}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className={labelClass}>Razón Social *</label>
                      <input type="text" value={form.nombreRazonSocial} onChange={e => updateField('nombreRazonSocial', e.target.value)} className={`${neoInput} ${errors.nombreRazonSocial ? neoInputError : ''}`} placeholder="Ej: Inversiones Globales SpA" autoFocus />
                      {errors.nombreRazonSocial && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{errors.nombreRazonSocial}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>RUT Fiscal * <span className="text-[#9aa3b8] font-normal">(formato: 12345678-9, sin puntos)</span></label>
                      <input
                        type="text"
                        value={form.rut}
                        onChange={e => updateField('rut', formatRut(e.target.value))}
                        className={`${neoInput} font-mono ${errors.rut ? neoInputError : ''}`}
                        placeholder="Ej: 76123456-7"
                        maxLength={12}
                      />
                      {errors.rut && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{errors.rut}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Giro / Actividad Principal</label>
                      <input type="text" value={form.giroActividad} onChange={e => updateField('giroActividad', e.target.value)} className={neoInput} placeholder="Ej: Publicidad y Marketing" />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {currentStep === 2 && (
                <div className={neoCard}>
                  <h2 className="text-xl font-bold text-emerald-500 mb-6 flex items-center gap-2"><MapPin className="w-6 h-6" /> Ubicación Geográfica</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className={labelClass}>Dirección Comercial *</label>
                      <input type="text" value={form.direccion} onChange={e => updateField('direccion', e.target.value)} className={`${neoInput} ${errors.direccion ? neoInputError : ''}`} placeholder="Av. Apoquindo 3000" />
                      {errors.direccion && <p className="text-sm text-red-500 mt-2 font-bold ml-1">{errors.direccion}</p>}
                    </div>
                    <div className="col-span-1">
                      <label className={labelClass}>N° Oficina</label>
                      <input type="text" value={form.numeroOficina} onChange={e => updateField('numeroOficina', e.target.value)} className={neoInput} placeholder="Of. 401" />
                    </div>
                    <div className="col-span-1">
                      <label className={labelClass}>Dpto</label>
                      <input type="text" value={form.departamento} onChange={e => updateField('departamento', e.target.value)} className={neoInput} placeholder="Dpto 5A" />
                    </div>

                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                      <label className={labelClass}>País *</label>
                      <select value={form.pais} onChange={e => handlePaisChange(e.target.value)} className={`${neoInput} cursor-pointer`}>{PAISES.map(p => <option key={p} value={p}>{p}</option>)}</select>
                    </div>
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                      <label className={labelClass}>Ciudad *</label>
                      <select value={form.ciudad} onChange={e => updateField('ciudad', e.target.value)} className={`${neoInput} ${errors.ciudad ? neoInputError : ''} cursor-pointer`}><option value="">Seleccione...</option>{ciudadesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}<option value="Otra">Otra...</option></select>
                      {errors.ciudad && <p className="text-sm text-red-500 mt-2 font-bold ml-1">{errors.ciudad}</p>}
                    </div>
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                      <label className={labelClass}>{form.pais === 'Chile' ? 'Comuna' : 'Estado/Provincia'}</label>
                      {form.pais === 'Chile' && ['Santiago'].includes(form.ciudad) ? (
                        <select value={form.comunaProvincia} onChange={e => updateField('comunaProvincia', e.target.value)} className={`${neoInput} cursor-pointer`}><option value="">Seleccione...</option>{COMUNAS_SANTIAGO.map(c => <option key={c} value={c}>{c}</option>)}</select>
                      ) : (
                        <input type="text" value={form.comunaProvincia} onChange={e => updateField('comunaProvincia', e.target.value)} className={neoInput} placeholder={form.pais === 'Chile' ? "Ej: Viña del Mar" : "Ej: Estado de México"} />
                      )}
                    </div>
                  </div>
                  <NeumorphicMap address={`${form.direccion} ${form.numeroOficina} ${form.ciudad} ${form.pais}`.trim()} label="Ubicación Comercial" />
                </div>
              )}

              {/* PASO 3 */}
              {currentStep === 3 && (
                <div className={neoCard}>
                  <h2 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-2"><Mail className="w-6 h-6" /> Contacto Corporativo</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Email Corporativo</label>
                      <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" /><input type="email" value={form.emailContacto} onChange={e => updateField('emailContacto', e.target.value)} className={`${neoInput} pl-9 ${errors.emailContacto ? neoInputError : ''}`} placeholder="contacto@empresa.com" /></div>
                      {errors.emailContacto && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{errors.emailContacto}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Teléfono Central</label>
                      <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" /><input type="text" value={form.telefonoContacto} onChange={e => updateField('telefonoContacto', e.target.value)} className={`${neoInput} pl-9`} placeholder="+56 9 1234 5678" /></div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Sitio Web</label>
                      <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" /><input type="text" value={form.paginaWeb} onChange={e => updateField('paginaWeb', e.target.value)} className={`${neoInput} pl-9`} placeholder="www.empresa.com" /></div>
                    </div>
                  </div>
                  <div className="mt-6 p-5 bg-[#dfeaff] rounded-[1.5rem] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] border border-white/30">
                    <h3 className="text-sm font-extrabold text-[#6888ff] mb-4 flex items-center gap-2 uppercase tracking-wide"><User className="w-4 h-4" /> Representante Principal *</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Nombre Completo *</label>
                        <input type="text" value={form.nombreContactoPrincipal} onChange={e => updateField('nombreContactoPrincipal', e.target.value)} className={`${neoInput} ${errors.nombreContactoPrincipal ? neoInputError : ''}`} placeholder="Ej: Juan Pérez" />
                        {errors.nombreContactoPrincipal && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{errors.nombreContactoPrincipal}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Cargo / Título *</label>
                        <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" /><input type="text" value={form.cargoContactoPrincipal} onChange={e => updateField('cargoContactoPrincipal', e.target.value)} className={`${neoInput} pl-9 ${errors.cargoContactoPrincipal ? neoInputError : ''}`} placeholder="Ej: Gerente Comercial" /></div>
                        {errors.cargoContactoPrincipal && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{errors.cargoContactoPrincipal}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4 */}
              {currentStep === 4 && (
                <div className={neoCard}>
                  <h2 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2"><FileSignature className="w-6 h-6" /> Facturación y Riesgo</h2>
                  
                  {/* Riesgo Financiero */}
                  <div className="mb-8 p-5 bg-[#dfeaff] rounded-[1.5rem] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] border border-white/30">
                    <label className="text-sm font-extrabold text-[#6888ff] mb-4 flex items-center gap-2 uppercase tracking-wide"><AlertTriangle className="w-4 h-4" /> Perfil de Riesgo Asignado</label>
                    <div className="flex flex-wrap gap-2">
                      {RIESGOS_FINANCIEROS.map((r) => {
                        const isSel = form.riesgoFinanciero === r.id;
                        const isDanger = ['C', 'D', 'En Observación'].includes(r.id);
                        const isWarn = ['BBB', 'BB', 'B', 'CCC', 'CC'].includes(r.id);
                        let btnCls = 'bg-white/50 text-[#69738c] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] hover:bg-[#6888ff]/10';
                        if (isSel) { btnCls = isDanger ? 'bg-red-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]' : isWarn ? 'bg-amber-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]' : 'bg-emerald-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]'; }
                        return (
                          <div key={r.id} className="relative group">
                            <button type="button" onClick={() => { updateField('riesgoFinanciero', r.id); if (errors.riesgoFinanciero) setErrors(prev => { const n = {...prev}; delete n.riesgoFinanciero; return n; }); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${btnCls}`}>{r.id}</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-xs text-slate-700 font-bold border border-slate-200 text-center leading-relaxed">
                              {r.desc}<div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/95"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.riesgoFinanciero && <p className="text-xs text-red-500 mt-3 font-bold ml-1">{errors.riesgoFinanciero}</p>}
                  </div>

                  {/* DTE */}
                  <div className="flex items-center gap-4 mb-8">
                    <Switch id="fact-electronica" checked={form.tieneFacturacionElectronica} onCheckedChange={v => updateField('tieneFacturacionElectronica', v)} className="data-[state=checked]:bg-[#6888ff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] scale-125 ml-2" />
                    <Label htmlFor="fact-electronica" className="text-lg font-bold text-[#69738c] cursor-pointer">Habilitar Facturación DTE</Label>
                  </div>

                  {form.tieneFacturacionElectronica && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div>
                        <label className={labelClass}>N° Deudor (ERP) *</label>
                        <input type="text" value={form.numeroDeudor} onChange={e => updateField('numeroDeudor', e.target.value)} className={`${neoInput} ${errors.numeroDeudor ? neoInputError : ''}`} placeholder="Ej: D-100254" />
                        {errors.numeroDeudor && <p className="text-sm text-red-500 mt-2 font-bold ml-1">{errors.numeroDeudor}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Tipo DTE</label>
                        <select value={form.tipoDTE} onChange={e => updateField('tipoDTE', e.target.value)} className={`${neoInput} cursor-pointer`}>{TIPOS_DTE.map(t => <option key={t} value={t}>{t}</option>)}</select>
                      </div>
                      <div>
                        <label className={labelClass}>Condición de Pago</label>
                        <select value={form.condicionPago} onChange={e => updateField('condicionPago', e.target.value)} className={`${neoInput} cursor-pointer`}>{CONDICIONES_PAGO.map(c => <option key={c} value={c}>{c}</option>)}</select>
                      </div>
                      <div className="md:col-span-3 relative">
                        <label className={labelClass}>
                          Dirección Fiscal / Envío XML
                          <span className="text-[#9aa3b8] font-normal ml-1">(escribe para buscar)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={form.direccionFacturacion}
                            onChange={e => {
                              updateField('direccionFacturacion', e.target.value);
                              searchAddress(e.target.value);
                            }}
                            onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                            onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                            className={neoInput}
                            placeholder={`Ej: Av. Apoquindo 3000, Santiago${form.pais !== 'Chile' ? ` (${form.pais})` : ''}`}
                            autoComplete="off"
                          />
                          {addressLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-[#6888ff] border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        {showAddressSuggestions && addressSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 bg-[#dfeaff] rounded-2xl shadow-[8px_8px_20px_#bec8de,-4px_-4px_12px_#ffffff] border border-white/40 overflow-hidden">
                            {addressSuggestions.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={() => {
                                  updateField('direccionFacturacion', s);
                                  setShowAddressSuggestions(false);
                                  setAddressSuggestions([]);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs text-[#69738c] font-medium hover:bg-[#6888ff]/10 transition-colors border-b border-[#bec8de]/30 last:border-0 flex items-center gap-2"
                              >
                                <MapPin className="w-3 h-3 text-[#6888ff] shrink-0" />
                                <span className="truncate">{s}</span>
                              </button>
                            ))}
                            <div className="px-4 py-1.5 text-[10px] text-[#9aa3b8] text-right border-t border-[#bec8de]/30">
                              © OpenStreetMap
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Notas y Documentos (Movido al final) */}
                  <div className="pt-8 border-t-2 border-[#bec8de]/30">
                    <h3 className="text-base font-extrabold text-[#69738c] mb-4 flex items-center gap-2 uppercase tracking-wide"><FileText className="w-5 h-5 text-[#6888ff]" /> Notas y Documentos</h3>
                    <div className="space-y-4">
                      <textarea
                        value={form.notas}
                        onChange={e => updateField('notas', e.target.value)}
                        rows={4}
                        className={`${neoInput} resize-none`}
                        placeholder="Ingresa acuerdos especiales, historial resumido o condiciones a tomar en cuenta..."
                      />
                      <div>
                        <label className={labelClass}>Adjuntar Documento (Opcional)</label>
                        <input type="file" className="block w-full text-sm text-[#69738c] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#6888ff] file:text-white hover:file:bg-[#5572ee] transition-all cursor-pointer bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] rounded-xl p-2" />
                        <p className="text-xs text-[#9aa3b8] mt-2 ml-1">Formatos soportados: PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={currentStep === 1 ? () => router.push('/anunciantes') : handlePrev} className={neoBtnSecondary}>
            {currentStep === 1 ? 'Cancelar' : <><ArrowLeft className="w-4 h-4" /> Anterior</>}
          </button>
          {currentStep < STEPS.length ? (
            <button type="button" onClick={handleNext} className={neoBtnPrimary}>Siguiente <ArrowRight className="w-4 h-4" /></button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isLoading} className="bg-emerald-500 rounded-full text-white font-bold shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff] hover:bg-emerald-400 active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)] transition-all duration-300 px-6 py-2.5 flex items-center justify-center gap-2 border-none disabled:opacity-50 text-sm">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Anunciante
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
