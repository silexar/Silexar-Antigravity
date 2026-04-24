// ─── Tipos del flujo de Nueva Búsqueda ───

export type PasoFlujo =
    | 'anunciante'
    | 'contrato'
    | 'campana'
    | 'radio'
    | 'fecha'
    | 'spx'
    | 'resultado'
    | 'exportar';

export interface Anunciante {
    id: string;
    nombre: string;
    nombreRazonSocial?: string;
    rut?: string;
    codigo?: string;
}

export interface Contrato {
    id: string;
    numero: string;
    numeroContrato?: string;
    titulo: string;
    estado: 'activo' | 'pendiente' | 'finalizado';
    valor?: number;
    fechaInicio: string;
    fechaFin: string;
}

export interface Campana {
    id: string;
    codigo: string;
    nombre: string;
    estado: string;
    fechaInicio: string;
    fechaFin: string;
    tipo?: string;
    spxCount?: number;
}

export interface Emisora {
    id: string;
    nombre: string;
    frecuencia?: string;
}

export interface SPXItem {
    id: string;
    pautaId: string;
    codigo: string;
    spxCode?: string;
    nombre: string;
    hora: string;
    horaInicio: string;
    duracion: number;
    tipo: 'audio_pregrabado' | 'mencion_vivo';
    emisoraId: string;
    emisoraNombre: string;
}

export interface RegistroResultado {
    id: string;
    spxId: string;
    codigo: string;
    nombre: string;
    fecha: string;
    hora: string;
    horaInicio: string;
    horaFin: string;
    duracion: number;
    tipo: 'audio_pregrabado' | 'mencion_vivo';
    emisoraId: string;
    emisoras: Emisora[];
    archivoUrl?: string;
    encontrado: boolean;
}

export interface HistorialEntry {
    id: string;
    anuncianteId: string;
    anuncianteNombre: string;
    contratoId: string;
    contratoNumero: string;
    campanaId: string;
    campanaNombre: string;
    fecha: string;
    hora: string;
    spxCodes: string[];
    resultado: 'encontrado' | 'no_encontrado' | 'pendiente';
    fechaBusqueda: string;
    horaBusqueda: string;
}

export interface SecureLink {
    id: string;
    codigo: string;
    url: string;
    expiresAt: string;
    maxAccessCount: number;
    requireCode: boolean;
    estado: 'activo' | 'usado' | 'expirado' | 'revocado';
}

// ─── Estado del flujo ───
export interface FlujoState {
    paso: PasoFlujo;
    anunciante: Anunciante | null;
    contrato: Contrato | null;
    campana: Campana | null;
    emisorasSeleccionadas: Emisora[];
    fecha: string;
    hora: string;
    spxSeleccionados: SPXItem[];
    resultados: RegistroResultado[];
    loading: boolean;
    error: string | null;
}