// Tipos base para entidades
export interface WithId<T = any> {
  id: string
}

export interface WithTimestamps<T = any> {
  createdAt: Date
  updatedAt: Date
}

export interface WithTenant {
  tenantId: string
}

// Tipos combinados comunes
export type BaseEntity = WithId & WithTimestamps & WithTenant