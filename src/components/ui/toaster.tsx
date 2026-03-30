'use client';
import React from 'react';
import { useToast } from '@/hooks/use-toast';

export const Toaster: React.FC = () => {
    const { toasts } = useToast();
    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {toasts.map(t => (
                <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg ${t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                    {t.message}
                </div>
            ))}
        </div>
    );
};
export default Toaster;