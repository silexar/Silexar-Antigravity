import React, { useState, useEffect } from 'react';
import { Layout, Check, Info } from 'lucide-react';
import { TemplateService, TemplateDefinition, CunaFormData } from '../services/TemplateService';

interface TemplateSelectorProps {
  currentData: Partial<CunaFormData>;
  onApplyTemplate: (newData: Partial<CunaFormData>) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ currentData, onApplyTemplate }) => {
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(TemplateService.getAvailableTemplates());
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const newData = TemplateService.applyTemplate(currentData, id);
    onApplyTemplate(newData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Layout className="w-5 h-5 text-violet-600" />
        <h3 className="font-semibold text-slate-800">Plantillas de Industria (Opcional)</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = selectedId === template.id;
          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
                ${isSelected 
                  ? 'border-violet-500 bg-violet-50' 
                  : 'border-slate-200 bg-white hover:border-violet-200'}
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-violet-500 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              
              <h4 className="font-bold text-slate-800 mb-1">{template.name}</h4>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{template.description}</p>
              
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                  {template.defaultDuration}s
                </span>
                {template.commonElements.slice(0, 2).map((el, i) => (
                  <span key={`${el}-${i}`} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                    {el.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedId && (
        <div className="bg-violet-50 border border-violet-100 p-3 rounded-lg flex gap-3 text-sm text-violet-800">
           <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
           <p>
             Se ha aplicado la estructura sugerida y la duración predeterminada de <strong>{templates.find(t=>t.id===selectedId)?.name}</strong>.
             Puedes editar estos valores libremente.
           </p>
        </div>
      )}
    </div>
  );
};
