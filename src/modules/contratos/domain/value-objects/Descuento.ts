export interface DescuentoVO { tipo: 'PORCENTAJE' | 'MONTO'; valor: number; }
export const createDescuento = (tipo: DescuentoVO['tipo'], valor: number): DescuentoVO => ({ tipo, valor });
export const applyDescuento = (monto: number, descuento: DescuentoVO): number => descuento.tipo === 'PORCENTAJE' ? monto * (1 - descuento.valor / 100) : monto - descuento.valor;
export default { createDescuento, applyDescuento };