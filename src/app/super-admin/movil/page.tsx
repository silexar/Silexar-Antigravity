/**
 * 👑 SILEXAR PULSE - Super Admin Mobile Root
 * 
 * @description Punto de entrada para el Centro de Control Móvil. Aisla el 
 * framework neuromórfico de la vista desktop.
 * 
 * @version 2026.3.0
 * @tier TIER_0_FORTUNE_10
 * @platform MOBILE
 */

'use client';

import React from 'react';
import { MobileSuperAdminApp } from './_components/MobileSuperAdminApp';

export default function SuperAdminMovilPage() {
  return (
    <div className="bg-[#F0EDE8] w-full overflow-hidden">
      {/* 
        El MobileSuperAdminApp encapsula todo el layout, bottom navigation,
        botón de pánico y state management.
      */}
      <MobileSuperAdminApp />
    </div>
  );
}
