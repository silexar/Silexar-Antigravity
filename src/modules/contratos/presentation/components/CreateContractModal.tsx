'use client';
import React, { useState } from 'react';
import { NeuromorphicWindow } from '@/components/ui/NeuromorphicWindow';
import { NeuromorphicButton, NeuromorphicInput } from '@/components/ui/neuromorphic';
import { FileText, Plus } from 'lucide-react';

interface CreateContractModalProps { 
  open: boolean; 
  onClose: () => void; 
  onSubmit?: (data: { nombre: string; valor: number }) => void; 
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({ open, onClose, onSubmit }) => {
    const [nombre, setNombre] = useState('');
    const [valor, setValor] = useState(0);

    const handleSubmit = () => { 
      onSubmit?.({ nombre, valor }); 
      onClose(); 
    };

    return (
        <NeuromorphicWindow 
            title="Nuevo Contrato Mestro" 
            isOpen={open} 
            onClose={onClose}
            icon={<FileText size={18} />}
            width={500}
        >
            <div className="space-y-6">
                <NeuromorphicInput 
                  label="Nombre de la Campaña / Producto" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  placeholder="Ej: Promo Verano 2025"
                />
                <NeuromorphicInput 
                  label="Inversión Estimada (Neto)" 
                  type="number" 
                  value={valor || ''} 
                  onChange={e => setValor(Number(e.target.value))} 
                  placeholder="$ 0.00"
                />
                
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-4 border-t border-white/20">
                  <NeuromorphicButton variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                    Cancelar
                  </NeuromorphicButton>
                  <NeuromorphicButton variant="success" onClick={handleSubmit} className="w-full sm:w-auto flex items-center justify-center">
                    <Plus className="mr-2" size={16} />
                    Crear Contrato
                  </NeuromorphicButton>
                </div>
            </div>
        </NeuromorphicWindow>
    );
};
export default CreateContractModal;
