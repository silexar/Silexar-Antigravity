/**
 * ENTITY: GRUPO DE DISTRIBUCIÓN — TIER 0
 *
 * Gestiona listas de destinatarios para envío de cuñas a operadores,
 * ejecutivos comerciales y equipos de programación.
 */

export type TipoGrupo = 'sistema' | 'personalizado';

export type RolDestinatario =
  | 'operador_emision'
  | 'coordinador_trafico'
  | 'ejecutivo_comercial'
  | 'supervisor_comercial'
  | 'jefe_programacion'
  | 'gerente_comercial'
  | 'externo';

export interface MiembroGrupo {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: RolDestinatario;
  emisoraId?: string | null;
  turno?: 'manana' | 'tarde' | 'noche' | null;
  activo: boolean;
}

export interface GrupoDistribucionProps {
  id: string;
  tenantId: string;
  nombre: string;
  descripcion?: string | null;
  tipo: TipoGrupo;
  miembros: MiembroGrupo[];
  autoAgregar: boolean;
  emisoraId?: string | null;
  activo: boolean;
  creadoPorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GrupoDistribucion {
  private constructor(private props: GrupoDistribucionProps) {}

  static create(
    props: Omit<GrupoDistribucionProps, 'id' | 'createdAt' | 'updatedAt'>
    & { id?: string }
  ): GrupoDistribucion {
    const now = new Date();
    return new GrupoDistribucion({ ...props, id: props.id ?? crypto.randomUUID(), createdAt: now, updatedAt: now });
  }

  static reconstitute(props: GrupoDistribucionProps): GrupoDistribucion {
    return new GrupoDistribucion(props);
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get nombre(): string { return this.props.nombre; }
  get descripcion(): string | null { return this.props.descripcion ?? null; }
  get tipo(): TipoGrupo { return this.props.tipo; }
  get miembros(): MiembroGrupo[] { return [...this.props.miembros]; }
  get autoAgregar(): boolean { return this.props.autoAgregar; }
  get emisoraId(): string | null { return this.props.emisoraId ?? null; }
  get activo(): boolean { return this.props.activo; }
  get creadoPorId(): string { return this.props.creadoPorId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  get miembrosActivos(): MiembroGrupo[] {
    return this.props.miembros.filter(m => m.activo);
  }

  agregarMiembro(miembro: MiembroGrupo): void {
    if (this.props.miembros.some(m => m.email === miembro.email)) {
      throw new Error(`El miembro ${miembro.email} ya pertenece al grupo`);
    }
    this.props.miembros.push(miembro);
    this.props.updatedAt = new Date();
  }

  eliminarMiembro(email: string): void {
    const index = this.props.miembros.findIndex(m => m.email === email);
    if (index === -1) throw new Error(`El miembro ${email} no pertenece al grupo`);
    this.props.miembros.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  desactivarMiembro(email: string): void {
    const miembro = this.props.miembros.find(m => m.email === email);
    if (!miembro) throw new Error(`El miembro ${email} no pertenece al grupo`);
    miembro.activo = false;
    this.props.updatedAt = new Date();
  }

  actualizar(campos: { nombre?: string; descripcion?: string | null }): void {
    if (campos.nombre !== undefined) this.props.nombre = campos.nombre;
    if (campos.descripcion !== undefined) this.props.descripcion = campos.descripcion;
    this.props.updatedAt = new Date();
  }

  cambiarEstado(activo: boolean): void {
    this.props.activo = activo;
    this.props.updatedAt = new Date();
  }

  obtenerEmailsDestinatarios(): string[] {
    return this.miembrosActivos.map(m => m.email);
  }

  tieneDestinatarios(): boolean {
    return this.miembrosActivos.length > 0;
  }

  toJSON(): GrupoDistribucionProps {
    return { ...this.props, miembros: this.props.miembros.map(m => ({ ...m })) };
  }
}
