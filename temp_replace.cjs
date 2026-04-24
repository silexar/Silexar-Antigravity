const fs = require('fs');

const newBody = `
// ═══════════════════════════════════════════════════════════════
// MOCKS DE MÓDULOS CONECTADOS
// ═══════════════════════════════════════════════════════════════

const mockEjecutivos = [
  { id: 'ej-001', nombre: 'Ana García', email: 'ana.garcia@silexar.com', cargo: 'Ejecutiva Senior' },
  { id: 'ej-002', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@silexar.com', cargo: 'Ejecutivo Comercial' },
  { id: 'ej-003', nombre: 'Roberto Silva', email: 'roberto.silva@silexar.com', cargo: 'Ejecutivo de Cuentas' },
];

const mockAgenciasMedios = [
  { id: 'am-001', nombre: 'MediaGroup Chile', rut: '76.123.456-7' },
  { id: 'am-002', nombre: 'Zenith Media', rut: '76.987.654-3' },
  { id: 'am-003', nombre: 'OMD Chile', rut: '76.555.444-2' },
];

const mockAgenciasCreativas = [
  { id: 'ac-001', nombre: 'DDB Chile', rut: '76.111.222-3' },
  { id: 'ac-002', nombre: 'McCann Santiago', rut: '76.333.444-5' },
  { id: 'ac-003', nombre: 'Wunderman Thompson', rut: '76.777.888-9' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL PASO
// ═══════════════════════════════════════════════════════════════

interface StepInfoFundamentalProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
  setAnunciante: (anunciante: AnuncianteSeleccionado | null) => void;
}

export const StepInfoFundamental: React.FC<StepInfoFundamentalProps> = ({
  state,
  dispatch,
  setAnunciante,
}) => {
  const valorBruto = state.valorBruto || 0;
  const comisionPct = state.tieneComisionAgencia ? (state.comisionAgencia || 0) : 0;
  const valorNetoCalculado = Math.round(valorBruto * (1 - comisionPct / 100));

  return (
    <div className="space-y-3">
      {/* Medio */}
      <div>
        <h3 className="text-[11px] font-semibold text-[#69738c] mb-1 flex items-center gap-1 uppercase tracking-wide">
          <Radio className="w-3.5 h-3.5 text-[#6888ff]" />
          Medio del Contrato
        </h3>
        <MedioSelector
          selected={state.medio}
          onSelect={(medio) => dispatch({ type: "SET_MEDIO", payload: medio })}
        />
      </div>

      {/* Selector de anunciante */}
      <SelectorAnunciante
        selected={state.anunciante}
        onSelect={setAnunciante}
      />

      {/* Ejecutivo + Agencias */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Ejecutivo *</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
            <select
              value={state.ejecutivoAsignado?.id || ''}
              onChange={(e) => {
                const v = mockEjecutivos.find(x => x.id === e.target.value);
                dispatch({ type: 'SET_EJECUTIVO', payload: v ? { id: v.id, nombre: v.nombre } : null });
              }}
              className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
            >
              <option value="">Seleccionar ejecutivo...</option>
              {mockEjecutivos.map(ej => (
                <option key={ej.id} value={ej.id}>{ej.nombre} — {ej.cargo}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-0.5">
          <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Agencia de Medios</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
            <select
              value={state.agenciaMediosId || ''}
              onChange={(e) => dispatch({ type: 'SET_AGENCIA_MEDIOS', payload: e.target.value })}
              className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
            >
              <option value="">Seleccionar...</option>
              {mockAgenciasMedios.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-0.5">
          <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Agencia Creativa</label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
            <select
              value={state.agenciaCreativaId || ''}
              onChange={(e) => dispatch({ type: 'SET_AGENCIA_CREATIVA', payload: e.target.value })}
              className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
            >
              <option value="">Seleccionar...</option>
              {mockAgenciasCreativas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Campaña + Fechas */}
      <div className="grid md:grid-cols-2 gap-3">
        <NeuromorphicInput
          label="Nombre de Campaña [Producto]"
          value={state.campana}
          onChange={(value) => dispatch({ type: "SET_CAMPANA", payload: value })}
          placeholder="Ej: Campaña Navidad 2025"
          icon={Sparkles}
          required
          error={state.errors["step1_error0"]}
        />

        <div className="grid grid-cols-2 gap-2">
          <NeuromorphicInput
            label="Fecha Inicio"
            type="date"
            value={state.fechaInicio ? state.fechaInicio.toISOString().split("T")[0] : ""}
            onChange={(value) => dispatch({ type: "SET_FECHAS", payload: { inicio: value ? new Date(value) : null, fin: state.fechaFin } })}
            icon={Calendar}
            required
          />
          <NeuromorphicInput
            label="Fecha Fin"
            type="date"
            value={state.fechaFin ? state.fechaFin.toISOString().split("T")[0] : ""}
            onChange={(value) => dispatch({ type: "SET_FECHAS", payload: { inicio: state.fechaInicio, fin: value ? new Date(value) : null } })}
            icon={Calendar}
            required
          />
        </div>
      </div>

      {/* Valores */}
      <div className="grid md:grid-cols-4 gap-3 items-end">
        <NeuromorphicInput
          label="Valor Bruto"
          type="number"
          value={String(state.valorBruto || 0)}
          onChange={(value) => {
            const bruto = Number(value) || 0;
            dispatch({ type: 'SET_VALORES', payload: { bruto, descuento: state.descuentoPorcentaje } });
          }}
          placeholder="0"
          icon={DollarSign}
        />

        <div className="space-y-0.5">
          <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Comisión Agencia</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_TIENE_COMISION', payload: !state.tieneComisionAgencia })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={state.tieneComisionAgencia
                ? { background: '#6888ff', color: '#fff', boxShadow: '2px 2px 4px #bec8de, -2px -2px 4px #ffffff' }
                : { background: '#dfeaff', color: '#9aa3b8', boxShadow: 'inset 2px 2px 4px #bec8de, inset -2px -2px 4px #ffffff' }}
            >
              {state.tieneComisionAgencia ? 'Sí' : 'No'}
            </button>
            {state.tieneComisionAgencia && (
              <div className="relative flex-1">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
                <input
                  type="number"
                  value={state.comisionAgencia || 0}
                  onChange={(e) => {
                    const pct = Number(e.target.value) || 0;
                    dispatch({ type: 'SET_COMISION_AGENCIA', payload: { comision: pct, facturar: state.facturarComisionAgencia } });
                  }}
                  className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
                />
              </div>
            )}
          </div>
        </div>

        <NeuromorphicInput
          label="Valor Neto"
          type="number"
          value={String(valorNetoCalculado)}
          onChange={() => {}}
          placeholder="0"
          icon={DollarSign}
        />
      </div>

      <NeuromorphicTextarea
        label="Descripción del Contrato"
        value={state.descripcion}
        onChange={(value) => dispatch({ type: "SET_DESCRIPCION", payload: value })}
        placeholder="Describa el objetivo principal de esta campaña publicitaria..."
        rows={2}
      />

      {/* Clasificación + Productos en 2 columnas */}
      <div className="grid md:grid-cols-2 gap-3">
        <SelectorPropiedades
          selected={state.propiedadesSeleccionadas || []}
          onUpdate={(props) => dispatch({ type: "SET_PROPIEDADES", payload: props })}
          error={Object.keys(state.errors).some((k) => state.errors[k].includes("propiedad maestra"))
            ? "Debe clasificar el contrato con al menos una propiedad maestra."
            : undefined}
        />
        <SelectorProductos
          selected={state.productosPrincipales}
          onAdd={(producto) => dispatch({ type: "ADD_PRODUCTO", payload: producto })}
          onRemove={(id) => dispatch({ type: "REMOVE_PRODUCTO", payload: id })}
        />
      </div>
    </div>
  );
};

export default StepInfoFundamental;
`;

let content = fs.readFileSync('src/app/contratos/nuevo/components/WizardContrato/steps/StepInfoFundamental.tsx', 'utf8');
const lastStart = content.lastIndexOf('// ═══════════════════════════════════════════════════════════════');
const endIdx = content.indexOf('export const StepInfoFundamental', lastStart);
if (endIdx === -1) {
  console.log('Could not find StepInfoFundamental');
  process.exit(1);
}
content = content.slice(0, endIdx) + newBody;
fs.writeFileSync('src/app/contratos/nuevo/components/WizardContrato/steps/StepInfoFundamental.tsx', content, 'utf8');
console.log('Replaced StepInfoFundamental body');
