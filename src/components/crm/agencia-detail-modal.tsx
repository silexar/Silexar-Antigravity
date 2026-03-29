/**
 * SILEXAR PULSE - TIER0+ AGENCIA DETAIL MODAL
 * Modal de Detalle de Agencia
 */

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Agencia {
    readonly id: string;
    readonly nombre: string;
    readonly tipo: string;
    readonly contacto: string;
}

interface AgenciaDetailModalProps {
    readonly agencia?: Agencia;
    readonly open: boolean;
    readonly onClose: () => void;
}

export const AgenciaDetailModal: React.FC<AgenciaDetailModalProps> = ({
    agencia,
    open,
    onClose,
}) => {
    if (!agencia) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{agencia.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="font-medium">{agencia.tipo}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Contacto</p>
                        <p className="font-medium">{agencia.contacto}</p>
                    </div>
                </div>
                <Button onClick={onClose} className="w-full">
                    Cerrar
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default AgenciaDetailModal;