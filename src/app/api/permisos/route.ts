/**
 * 🔐 SILEXAR PULSE - API de Permisos Granulares
 * 
 * @description Sistema de permisos granulares recurso + acción
 * Permite gestionar permisos específicos por recurso y acción
 * 
 * @version 2025.1.0
 * @tier TIER_FUNCTIONAL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════

type Recurso =
    | 'anunciantes' | 'agencias' | 'emisoras' | 'cunas' | 'campanas'
    | 'contratos' | 'facturacion' | 'inventario' | 'pauta' | 'tandas'
    | 'emision' | 'conciliacion' | 'informes' | 'usuarios' | 'configuracion';

type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'aprobar' | 'exportar';

const RECURSOS: Recurso[] = [
    'anunciantes', 'agencias', 'emisoras', 'cunas', 'campanas',
    'contratos', 'facturacion', 'inventario', 'pauta', 'tandas',
    'emision', 'conciliacion', 'informes', 'usuarios', 'configuracion'
];

const ACCIONES: Accion[] = ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'];

// Metadatos de recursos para UI
const RECURSO_METADATA: Record<Recurso, { nombre: string; descripcion: string; icono: string; categoria: string }> = {
    anunciantes: { nombre: 'Anunciantes', descripcion: 'Gestión de anunciantes', icono: '🏢', categoria: 'Comercial' },
    agencias: { nombre: 'Agencias', descripcion: 'Agencias creativas y de medios', icono: '🎨', categoria: 'Comercial' },
    emisoras: { nombre: 'Emisoras', descripcion: 'Estaciones de radio/TV', icono: '📻', categoria: 'Operaciones' },
    cunas: { nombre: 'Cuñas', descripcion: 'Spots publicitarios', icono: '🎵', categoria: 'Producción' },
    campanas: { nombre: 'Campañas', descripcion: 'Campañas publicitarias', icono: '📢', categoria: 'Comercial' },
    contratos: { nombre: 'Contratos', descripcion: 'Contratos comerciales', icono: '📄', categoria: 'Comercial' },
    facturacion: { nombre: 'Facturación', descripcion: 'Facturas y pagos', icono: '💰', categoria: 'Finanzas' },
    inventario: { nombre: 'Inventario', descripcion: 'Inventario de pauta', icono: '📦', categoria: 'Operaciones' },
    pauta: { nombre: 'Pauta', descripcion: 'Programación de anuncios', icono: '📺', categoria: 'Operaciones' },
    tandas: { nombre: 'Tandas', descripcion: 'Bloques de publicidad', icono: '⏱️', categoria: 'Operaciones' },
    emision: { nombre: 'Emisión', descripcion: 'Control de emisiones', icono: '📡', categoria: 'Operaciones' },
    conciliacion: { nombre: 'Conciliación', descripcion: 'Conciliación de emisiones', icono: '⚖️', categoria: 'Finanzas' },
    informes: { nombre: 'Informes', descripcion: 'Reportes y análisis', icono: '📊', categoria: 'Intelligence' },
    usuarios: { nombre: 'Usuarios', descripcion: 'Gestión de usuarios', icono: '👥', categoria: 'Sistema' },
    configuracion: { nombre: 'Configuración', descripcion: 'Configuración del sistema', icono: '⚙️', categoria: 'Sistema' }
};

// Matriz de permisos por rol (ejemplo simplificado)
const PERMISOS_MATRIX: Record<string, Record<Recurso, Accion[]>> = {
    super_admin: {
        anunciantes: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        agencias: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        emisoras: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        cunas: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        campanas: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        contratos: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        facturacion: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        inventario: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        pauta: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        tandas: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        emision: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        conciliacion: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        informes: ['ver', 'crear', 'exportar'],
        usuarios: ['ver', 'crear', 'editar', 'eliminar'],
        configuracion: ['ver', 'editar']
    },
    admin_tenant: {
        anunciantes: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        agencias: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        emisoras: ['ver', 'crear', 'editar', 'exportar'],
        cunas: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        campanas: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        contratos: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        facturacion: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        inventario: ['ver', 'editar', 'exportar'],
        pauta: ['ver', 'editar', 'aprobar', 'exportar'],
        tandas: ['ver', 'editar', 'aprobar', 'exportar'],
        emision: ['ver', 'aprobar', 'exportar'],
        conciliacion: ['ver', 'aprobar', 'exportar'],
        informes: ['ver', 'crear', 'exportar'],
        usuarios: ['ver', 'crear', 'editar'],
        configuracion: ['ver', 'editar']
    },
    gerente_ventas: {
        anunciantes: ['ver', 'crear', 'editar', 'exportar'],
        agencias: ['ver', 'crear', 'editar', 'exportar'],
        emisoras: ['ver'],
        cunas: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        campanas: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        contratos: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        facturacion: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        inventario: ['ver', 'exportar'],
        pauta: ['ver', 'editar', 'aprobar', 'exportar'],
        tandas: ['ver', 'editar', 'aprobar', 'exportar'],
        emision: ['ver'],
        conciliacion: ['ver'],
        informes: ['ver', 'exportar'],
        usuarios: ['ver'],
        configuracion: ['ver']
    },
    ejecutivo_ventas: {
        anunciantes: ['ver', 'crear', 'editar'],
        agencias: ['ver'],
        emisoras: ['ver'],
        cunas: ['ver', 'crear', 'editar'],
        campanas: ['ver', 'crear'],
        contratos: ['ver', 'crear'],
        facturacion: ['ver'],
        inventario: ['ver'],
        pauta: ['ver', 'crear', 'editar'],
        tandas: ['ver', 'crear', 'editar'],
        emision: ['ver'],
        conciliacion: ['ver'],
        informes: ['ver'],
        usuarios: ['ver'],
        configuracion: ['ver']
    },
    operador_pauta: {
        anunciantes: ['ver'],
        agencias: ['ver'],
        emisoras: ['ver'],
        cunas: ['ver', 'crear', 'editar'],
        campanas: ['ver'],
        contratos: ['ver'],
        facturacion: ['ver'],
        inventario: ['ver', 'editar'],
        pauta: ['ver', 'crear', 'editar', 'exportar'],
        tandas: ['ver', 'crear', 'editar', 'exportar'],
        emision: ['ver'],
        conciliacion: ['ver'],
        informes: ['ver'],
        usuarios: [],
        configuracion: ['ver']
    },
    operador_trafico: {
        anunciantes: ['ver'],
        agencias: ['ver'],
        emisoras: ['ver'],
        cunas: ['ver'],
        campanas: ['ver'],
        contratos: ['ver'],
        facturacion: ['ver'],
        inventario: ['ver'],
        pauta: ['ver'],
        tandas: ['ver'],
        emision: ['ver', 'crear', 'editar'],
        conciliacion: ['ver', 'crear'],
        informes: ['ver'],
        usuarios: [],
        configuracion: ['ver']
    },
    contador: {
        anunciantes: ['ver'],
        agencias: ['ver'],
        emisoras: ['ver'],
        cunas: ['ver'],
        campanas: ['ver'],
        contratos: ['ver'],
        facturacion: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        inventario: ['ver'],
        pauta: ['ver'],
        tandas: ['ver'],
        emision: ['ver', 'exportar'],
        conciliacion: ['ver', 'aprobar', 'exportar'],
        informes: ['ver', 'exportar'],
        usuarios: [],
        configuracion: ['ver']
    },
    auditor: {
        anunciantes: ['ver', 'exportar'],
        agencias: ['ver', 'exportar'],
        emisoras: ['ver', 'exportar'],
        cunas: ['ver', 'exportar'],
        campanas: ['ver', 'exportar'],
        contratos: ['ver', 'exportar'],
        facturacion: ['ver', 'exportar'],
        inventario: ['ver', 'exportar'],
        pauta: ['ver', 'exportar'],
        tandas: ['ver', 'exportar'],
        emision: ['ver', 'exportar'],
        conciliacion: ['ver', 'exportar'],
        informes: ['ver', 'exportar'],
        usuarios: ['ver'],
        configuracion: ['ver']
    },
    cliente_externo: {
        anunciantes: [],
        agencias: [],
        emisoras: ['ver'],
        cunas: ['ver'],
        campanas: ['ver'],
        contratos: ['ver'],
        facturacion: ['ver'],
        inventario: [],
        pauta: [],
        tandas: [],
        emision: [],
        conciliacion: [],
        informes: ['ver'],
        usuarios: [],
        configuracion: []
    }
};

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════

const VerificarPermisoSchema = z.object({
    usuarioId: z.string().optional(),
    rol: z.string(),
    recurso: z.enum(RECURSOS as unknown as [Recurso, ...Recurso[]]),
    accion: z.enum(ACCIONES as unknown as [Accion, ...Accion[]])
});

const AsignarPermisoSchema = z.object({
    rol: z.string(),
    recurso: z.enum(RECURSOS as unknown as [Recurso, ...Recurso[]]),
    acciones: z.array(z.enum(ACCIONES as unknown as [Accion, ...Accion[]])).min(1)
});

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function generatePermisoId(): string {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function tienePermiso(rol: string, recurso: Recurso, accion: Accion): boolean {
    const permisosRol = PERMISOS_MATRIX[rol];
    if (!permisosRol) return false;

    const accionesRecurso = permisosRol[recurso];
    if (!accionesRecurso) return false;

    return accionesRecurso.includes(accion);
}

function getPermisosRecurso(rol: string, recurso: Recurso): Accion[] {
    const permisosRol = PERMISOS_MATRIX[rol];
    if (!permisosRol) return [];
    return permisosRol[recurso] || [];
}

function logAudit(action: string, details: Record<string, unknown>) {
    console.log(`[AUDIT] ${action} - permisos granulares`, details);
}

// ═══════════════════════════════════════════════════════════════════
// GET /api/permisos
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';

        const accion = searchParams.get('accion');

        // GET /api/permisos?matriz=true - Obtener matriz completa de permisos
        if (searchParams.get('matriz') === 'true') {
            const rol = searchParams.get('rol') || 'super_admin';
            const matriz = PERMISOS_MATRIX[rol] || {};

            return NextResponse.json({
                success: true,
                data: {
                    rol,
                    permisos: matriz,
                    recursos: RECURSOS.map(r => ({
                        id: r,
                        ...RECURSO_METADATA[r],
                        acciones: getPermisosRecurso(rol, r)
                    })),
                    accionesDisponibles: ACCIONES
                }
            });
        }

        // GET /api/permisos?recurso=true - Obtener metadata de recursos
        if (searchParams.get('recursos') === 'true') {
            return NextResponse.json({
                success: true,
                data: {
                    recursos: RECURSOS.map(r => ({
                        id: r,
                        ...RECURSO_METADATA[r],
                        accionesDisponibles: ACCIONES
                    })),
                    acciones: ACCIONES.map(a => ({
                        id: a,
                        nombre: a.charAt(0).toUpperCase() + a.slice(1),
                        descripcion: `Permiso para ${a}`
                    }))
                }
            });
        }

        // GET /api/permisos?verificar=true&rol=X&recurso=Y&accion=Z - Verificar permiso específico
        if (searchParams.get('verificar') === 'true') {
            const params = VerificarPermisoSchema.parse({
                usuarioId: searchParams.get('usuarioId') || undefined,
                rol: searchParams.get('rol') || 'super_admin',
                recurso: searchParams.get('recurso'),
                accion: searchParams.get('accion')
            });

            if (!params.recurso || !params.accion) {
                return NextResponse.json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'Se requiere recurso y accion' }
                }, { status: 400 });
            }

            const tiene = tienePermiso(params.rol, params.recurso, params.accion);

            logAudit('VERIFY', { rol: params.rol, recurso: params.recurso, accion: params.accion, resultado: tiene, userId });

            return NextResponse.json({
                success: true,
                data: {
                    tienePermiso: tiene,
                    rol: params.rol,
                    recurso: params.recurso,
                    accion: params.accion
                }
            });
        }

        // Default: listar roles disponibles
        const rolesDisponibles = Object.keys(PERMISOS_MATRIX).map(rol => ({
            id: rol,
            nombre: rol.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            permisosCount: Object.values(PERMISOS_MATRIX[rol] || {}).flat().length
        }));

        return NextResponse.json({
            success: true,
            data: {
                roles: rolesDisponibles,
                recursos: RECURSOS.length,
                acciones: ACCIONES.length,
                matrixAvailable: true
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al obtener permisos' } }, { status: 500 });
    }
}

// ═══════════════════════════════════════════════════════════════════
// POST /api/permisos
// ═══════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-silexar-user-id') || 'demo-user';
        const body = await req.json();

        // Verificar si es verificación rápida
        if (body.verificar) {
            const params = VerificarPermisoSchema.parse(body);
            const tiene = tienePermiso(params.rol, params.recurso, params.accion);

            logAudit('VERIFY', { rol: params.rol, recurso: params.recurso, accion: params.accion, resultado: tiene });

            return NextResponse.json({
                success: true,
                data: { tienePermiso: tiene, recurso: params.recurso, accion: params.accion, rol: params.rol }
            });
        }

        // Asignar permiso a rol (solo admins)
        const data = AsignarPermisoSchema.parse(body);

        // En producción, aquí se persistiría en BD
        const nuevoPermiso = {
            id: generatePermisoId(),
            rol: data.rol,
            recurso: data.recurso,
            acciones: data.acciones,
            creadoPor: userId,
            fechaCreacion: new Date().toISOString()
        };

        logAudit('ASSIGN', { rol: data.rol, recurso: data.recurso, acciones: data.acciones, userId });

        return NextResponse.json({ success: true, data: nuevoPermiso }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten().fieldErrors } }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: { code: 'ERROR', message: 'Error al asignar permiso' } }, { status: 500 });
    }
}