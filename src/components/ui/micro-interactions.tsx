'use client';
import React from 'react';
export const MicroInteractions: React.FC<{ children: React.ReactNode; effect?: 'hover' | 'click' }> = ({ children, effect = 'hover' }) => (
    <div className={`transition-all duration-200 ${effect === 'hover' ? 'hover:scale-105' : 'active:scale-95'}`}>{children}</div>
);
export default MicroInteractions;