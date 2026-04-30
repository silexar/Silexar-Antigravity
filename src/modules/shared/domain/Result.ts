/**
 * Result Pattern - Shared Kernel
 * 
 * Implementación del patrón Result para manejo de errores de dominio
 * sin excepciones. Este patrón permite tratar los errores de negocio
 * como valores, siguiendo los principios de DDD.
 * 
 * @example
 * ```typescript
 * // En una entidad o value object:
 * static create(props: Props): Result<Entity, string> {
 *   if (!props.name) {
 *     return Result.fail("El nombre es requerido");
 *   }
 *   return Result.ok(new Entity(props));
 * }
 * 
 * // En un command handler:
 * const result = Entity.create(props);
 * if (!result.success) {
 *   return Result.fail(result.error);
 * }
 * await repository.save(result.data);
 * return Result.ok(result.data);
 * ```
 */

/**
 * Tipo Result que representa el resultado de una operación que puede
 * tener éxito (con un valor de tipo T) o fallar (con un error de tipo E)
 */
export type Result<T, E = string> =
  | { success: true; data: T; error?: never }
  | { success: false; error: E; data?: never };

/**
 * Namespace Result con utilidades para crear resultados
 */
export const Result = {
  /**
   * Crea un resultado exitoso
   * @param data - El valor a encapsular
   * @returns Result con success: true
   */
  ok: <T>(data: T): Result<T, never> => ({ success: true, data }),

  /**
   * Crea un resultado fallido
   * @param error - El error a encapsular
   * @returns Result con success: false
   */
  fail: <E>(error: E): Result<never, E> => ({ success: false, error }),

  /**
   * Combina múltiples resultados en uno solo
   * Si todos son exitosos, retorna un array con los datos
   * Si alguno falla, retorna el primer error encontrado
   */
  combine: <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const data: T[] = [];
    for (const result of results) {
      if (!result.success) {
        return Result.fail(result.error);
      }
      data.push(result.data);
    }
    return Result.ok(data);
  },

  /**
   * Transforma el valor de un resultado exitoso
   * Similar a map en monads
   */
  map: <T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> => {
    if (!result.success) {
      return Result.fail(result.error);
    }
    return Result.ok(fn(result.data));
  },

  /**
   * Encadena operaciones que retornan Result
   * Similar a flatMap en monads
   */
  flatMap: <T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E> => {
    if (!result.success) {
      return Result.fail(result.error);
    }
    return fn(result.data);
  },

  /**
   * Recupera de un error aplicando una función de fallback
   */
  recover: <T, E>(result: Result<T, E>, fn: (error: E) => T): Result<T, never> => {
    if (result.success) {
      return Result.ok(result.data);
    }
    return Result.ok(fn(result.error));
  },

  /**
   * Obtiene el valor o un default si hay error
   */
  getOrElse: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    if (result.success) {
      return result.data;
    }
    return defaultValue;
  },

  /**
   * Obtiene el valor o lanza una excepción (para casos donde el error es inesperado)
   * Solo usar para errores de infraestructura o invariantes que no deberían fallar
   */
  getOrThrow: <T, E>(result: Result<T, E>, message?: string): T => {
    if (result.success) {
      return result.data;
    }
    throw new Error(message ?? String(result.error));
  },

  /**
   * Verifica si el resultado es exitoso
   */
  isOk: <T, E>(result: Result<T, E>): result is { success: true; data: T } => {
    return result.success;
  },

  /**
   * Verifica si el resultado es un fallo
   */
  isFail: <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
    return !result.success;
  },
} as const;

/**
 * Tipo helper para resultados asíncronos
 */
export type AsyncResult<T, E = string> = Promise<Result<T, E>>;

/**
 * Helper para envolver funciones que pueden lanzar excepciones
 * Convierte excepciones en Result.fail
 */
export const ResultTry = {
  sync: <T, E = string>(fn: () => T, errorMapper?: (error: unknown) => E): Result<T, E> => {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.fail(errorMapper ? errorMapper(error) : (error as E));
    }
  },

  async: async <T, E = string>(
    fn: () => Promise<T>,
    errorMapper?: (error: unknown) => E
  ): AsyncResult<T, E> => {
    try {
      return Result.ok(await fn());
    } catch (error) {
      return Result.fail(errorMapper ? errorMapper(error) : (error as E));
    }
  },
};
