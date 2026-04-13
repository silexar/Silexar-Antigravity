'use client';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const WilChatInterface = dynamic(
  () => import('@/components/wil/wil-chat-interface').then(m => ({ default: m.WilChatInterface })),
  { loading: () => <div className="h-[600px] animate-pulse bg-[#E8E5E0] rounded-2xl" />, ssr: false }
);

export default function WilPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">WIL Assistant</h1>
      <Suspense fallback={<div className="h-[600px] animate-pulse bg-[#E8E5E0] rounded-2xl" />}>
        <WilChatInterface />
      </Suspense>
    </div>
  );
}
