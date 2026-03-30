/**
 * Result<T> — DDD Result Pattern
 *
 * Use in application layer handlers instead of throwing errors.
 * Callers check `result.ok` before accessing `result.data`.
 *
 * @example
 *   async crearContrato(dto): Promise<Result<Contrato>> {
 *     if (existente) return Result.fail('Contrato ya existe')
 *     await repo.save(entidad)
 *     return Result.ok(entidad)
 *   }
 *
 *   // In API route:
 *   const result = await handler.crearContrato(dto)
 *   if (!result.ok) return apiError('CONFLICT', result.error.message, 409)
 *   return apiSuccess(result.data)
 */

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: Error }

export const Result = {
  ok<T>(data: T): Result<T> {
    return { ok: true, data }
  },
  fail<T>(message: string | Error): Result<T> {
    const error = message instanceof Error ? message : new Error(message)
    return { ok: false, error }
  },
}
