import React from 'react';
import { Braces, Calendar, Clock, DollarSign, User, Hash } from 'lucide-react';
import { DynamicVariablesEngine, type VariableDefinition } from '../services/DynamicVariablesEngine';

interface VariablePickerProps {
  onInsert: (variable: string) => void;
}

export const VariablePicker: React.FC<VariablePickerProps> = ({ onInsert }) => {
  const variables = DynamicVariablesEngine.getAvailableVariables();

  const getIcon = (dataType: VariableDefinition['dataType']) => {
    switch (dataType) {
      case 'date': return <Calendar className="w-3 h-3" />;
      case 'time': return <Clock className="w-3 h-3" />;
      case 'currency': return <DollarSign className="w-3 h-3" />;
      case 'number': return <Hash className="w-3 h-3" />;
      case 'text': return <User className="w-3 h-3" />;
      default: return <Braces className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Braces className="w-3 h-3" /> Variables Dinámicas
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {variables.map((v) => (
          <button
            key={v.name}
            onClick={() => onInsert(v.name)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-violet-50 border border-transparent hover:border-violet-100 transition-all text-left group"
            title={v.description}
          >
            <div className="p-1.5 bg-slate-100 rounded md:group-hover:bg-white text-slate-500 group-hover:text-violet-600 transition-colors">
              {getIcon(v.dataType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono font-bold text-slate-700 group-hover:text-violet-700 truncate">
                {v.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate group-hover:text-violet-500">
                Ej: {v.example}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
