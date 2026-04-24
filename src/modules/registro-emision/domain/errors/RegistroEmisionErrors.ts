/**
 * Errores de dominio del módulo Registro de Emisión
 */

export class RegistroEmisionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistroEmisionError';
  }
}

export class EstadoInvalidoError extends RegistroEmisionError {
  constructor(estado: string) {
    super(`Estado inválido: ${estado}`);
    this.name = 'EstadoInvalidoError';
  }
}

export class HashInvalidoError extends RegistroEmisionError {
  constructor(hash: string) {
    super(`Hash SHA-256 inválido: ${hash}`);
    this.name = 'HashInvalidoError';
  }
}

export class RangoHorarioInvalidoError extends RegistroEmisionError {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'RangoHorarioInvalidoError';
  }
}

export class CodigoAccesoInvalidoError extends RegistroEmisionError {
  constructor(codigo: string) {
    super(`Código de acceso inválido: ${codigo}`);
    this.name = 'CodigoAccesoInvalidoError';
  }
}

export class VerificacionNoEnProcesoError extends RegistroEmisionError {
  constructor(estadoActual: string) {
    super(`No se puede realizar la operación en estado ${estadoActual}`);
    this.name = 'VerificacionNoEnProcesoError';
  }
}

export class ClipYaAprobadoError extends RegistroEmisionError {
  constructor() {
    super('El clip de evidencia ya fue aprobado');
    this.name = 'ClipYaAprobadoError';
  }
}

export class AccesoExpiradoError extends RegistroEmisionError {
  constructor() {
    super('El acceso seguro ha expirado');
    this.name = 'AccesoExpiradoError';
  }
}

export class LimiteDeUsosAlcanzadoError extends RegistroEmisionError {
  constructor() {
    super('Se ha alcanzado el límite de usos permitidos para este acceso');
    this.name = 'LimiteDeUsosAlcanzadoError';
  }
}
