export interface CrearContratoDto { numero: string; anunciante: string; valor: number; fechaInicio: string; fechaFin: string; }
export const validateCrearContratoDto = (dto: Partial<CrearContratoDto>): boolean => !!(dto.numero && dto.anunciante && dto.valor);
export default { validateCrearContratoDto };