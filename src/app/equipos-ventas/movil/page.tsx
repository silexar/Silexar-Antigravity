/**
 * 📱 SILEXAR PULSE - Equipos de Ventas Mobile App TIER 0
 * 
 * @description Punto de entrada móvil para el ecosistema de Equipos de Ventas.
 * Actúa como contenedor del poderoso `MobileSalesCommand` y aísla la vista 
 * neuromórfica de la experiencia Desktop.
 * 
 * @version 2026.3.0
 * @tier TIER_0_FORTUNE_10
 * @platform MOBILE
 */

'use client';

import React from 'react';
import { MobileSalesCommand } from '../components/MobileSalesCommand';

export default function EquiposVentasMovilPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] w-full overflow-hidden safe-area-top">
      {/* 
        El MobileSalesCommand encapsula su propia navegación, layouts, 
        temas oscuros y componentes complejos como MobileKAMDashboard, 
        MobileDealRoom, etc.
      */}
      <MobileSalesCommand />
    </div>
  );
}
