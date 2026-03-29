'use client';
import React from 'react';
export const ResponsiveFramework: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`container mx-auto px-4 ${className}`}>{children}</div>
);
export default ResponsiveFramework;