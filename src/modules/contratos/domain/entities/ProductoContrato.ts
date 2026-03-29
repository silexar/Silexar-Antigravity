export interface ProductoContrato { id: string; nombre: string; cantidad: number; precio: number; }
export const createProductoContrato = (data: Partial<ProductoContrato>): ProductoContrato => ({ id: `prod_${Date.now()}`, nombre: data.nombre || '', cantidad: data.cantidad || 0, precio: data.precio || 0 });
export default { createProductoContrato };