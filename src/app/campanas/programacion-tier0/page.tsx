'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import { NeoPageHeader, NeoCard, N } from '../_lib/neumorphic';
import { PestanaProgramacionTier0 } from '@/modules/campanas/presentation/components/PestanaProgramacionTier0';

export default function ProgramacionTier0Page() {
  const router = useRouter();
  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-[1900px] mx-auto space-y-5">
        <NeoPageHeader
          title="Programación Visual TIER 0"
          subtitle="Drag & drop inteligente con validación en tiempo real"
          icon={CalendarDays}
          backHref="/campanas"
        />
        <NeoCard>
          <PestanaProgramacionTier0 />
        </NeoCard>
      </div>
    </div>
  );
}
