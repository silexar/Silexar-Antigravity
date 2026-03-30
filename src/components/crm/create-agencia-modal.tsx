'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export const CreateAgenciaModal: React.FC<{ open: boolean; onClose: () => void; onSubmit?: (d: { nombre: string; tipo: string }) => void }> = ({ open, onClose, onSubmit }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('CREATIVA');
    const handleSubmit = () => { onSubmit?.({ nombre, tipo }); onClose(); };
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Nueva Agencia</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div><Label>Nombre</Label><Input value={nombre} onChange={e => setNombre(e.target.value)} /></div>
                    <div><Label>Tipo</Label><Input value={tipo} onChange={e => setTipo(e.target.value)} /></div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={handleSubmit}>Crear</Button></div>
            </DialogContent>
        </Dialog>
    );
};
export default CreateAgenciaModal;