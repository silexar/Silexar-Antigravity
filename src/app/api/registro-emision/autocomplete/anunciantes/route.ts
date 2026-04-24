/**
 * GET /api/registro-emision/autocomplete/anunciantes
 * API simplificada para autocomplete de anunciantes en el popup de búsqueda.
 * No requiere autenticación - usa datos mock para demo.
 */

import { NextRequest, NextResponse } from 'next/server';

// Datos mock coherentes con la estructura del sistema
const mockAnunciantes = [
    { id: 'anc-001', nombre: 'Banco de Chile', nombreRazonSocial: 'Banco de Chile S.A.', rut: '97.004.000-5', contratosActivos: 3, cunasActivas: 45 },
    { id: 'anc-002', nombre: 'Coca-Cola Chile', nombreRazonSocial: 'Embotelladora Andina S.A.', rut: '91.144.000-8', contratosActivos: 2, cunasActivas: 38 },
    { id: 'anc-003', nombre: 'LATAM Airlines', nombreRazonSocial: 'LATAM Airlines Group S.A.', rut: '89.862.200-2', contratosActivos: 1, cunasActivas: 22 },
    { id: 'anc-004', nombre: 'Falabella', nombreRazonSocial: 'S.A.C.I. Falabella', rut: '90.749.000-9', contratosActivos: 4, cunasActivas: 67 },
    { id: 'anc-005', nombre: 'Entel', nombreRazonSocial: 'Entel Chile S.A.', rut: '92.580.000-7', contratosActivos: 2, cunasActivas: 31 },
    { id: 'anc-006', nombre: 'Lollapalooza Chile', nombreRazonSocial: 'Lotus Producciones SpA', rut: '76.543.210-K', contratosActivos: 1, cunasActivas: 8 },
    { id: 'anc-007', nombre: 'Ripley', nombreRazonSocial: 'Ripley Corp S.A.', rut: '96.509.660-4', contratosActivos: 2, cunasActivas: 29 },
    { id: 'anc-008', nombre: 'Paris', nombreRazonSocial: 'Cencosud Retail S.A.', rut: '81.201.000-K', contratosActivos: 3, cunasActivas: 52 },
    { id: 'anc-009', nombre: 'Samsung Electronics', nombreRazonSocial: 'Samsung Electronics Chile', rut: '96.810.000-1', contratosActivos: 2, cunasActivas: 19 },
    { id: 'anc-010', nombre: 'Movistar', nombreRazonSocial: 'Telefónica Chile S.A.', rut: '90.635.000-9', contratosActivos: 2, cunasActivas: 41 },
    { id: 'anc-011', nombre: 'Bci', nombreRazonSocial: 'Banco BCI S.A.', rut: '97.018.000-1', contratosActivos: 2, cunasActivas: 33 },
    { id: 'anc-012', nombre: ' Jumbo', nombreRazonSocial: 'Jumbo Supermercados', rut: '96.571.410-9', contratosActivos: 1, cunasActivas: 15 },
    { id: 'anc-013', nombre: 'Copec', nombreRazonSocial: 'Copec S.A.', rut: '90.430.000-6', contratosActivos: 2, cunasActivas: 27 },
    { id: 'anc-014', nombre: 'CCU', nombreRazonSocial: 'CCU S.A.', rut: '91.041.000-8', contratosActivos: 3, cunasActivas: 48 },
    { id: 'anc-015', nombre: 'VTR', nombreRazonSocial: 'VTR Global Com', rut: '96.810.410-7', contratosActivos: 1, cunasActivas: 12 },
];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = (searchParams.get('search') || searchParams.get('q') || '').toLowerCase();
        const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 30);

        let results = mockAnunciantes;

        if (query) {
            results = results.filter(a =>
                a.nombre.toLowerCase().includes(query) ||
                a.nombreRazonSocial.toLowerCase().includes(query) ||
                a.rut.includes(query)
            );
        }

        results = results.slice(0, limit);

        return NextResponse.json({
            success: true,
            data: results,
            meta: { total: results.length, query }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al buscar anunciantes' },
            { status: 500 }
        );
    }
}