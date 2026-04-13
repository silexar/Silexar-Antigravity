declare module '@nestjs/common' { const anyExport: unknown; export = anyExport }
declare module '@nestjs/cqrs' { export class CommandBus {} export class QueryBus {} export class EventBus {} export class ICommand {} export class IQuery {} }
declare module '@nestjs/swagger' { const anyExport: unknown; export = anyExport }
declare module 'class-validator' { export const IsString: (...args: unknown[]) => unknown; export const IsNumber: (...args: unknown[]) => unknown; export const IsBoolean: (...args: unknown[]) => unknown; export const IsOptional: (...args: unknown[]) => unknown; export const ValidateNested: (...args: unknown[]) => unknown; export const IsArray: (...args: unknown[]) => unknown; export const IsEnum: (...args: unknown[]) => unknown; export const IsDateString: (...args: unknown[]) => unknown; }
declare module 'class-transformer' { export const Type: (...args: unknown[]) => unknown }
declare module 'inversify' { export const injectable: (...args: unknown[]) => unknown; export const inject: (...args: unknown[]) => unknown }
declare module '@/shared/domain/Command' { export interface Command {} }

// Shared error/logging fallbacks
declare module '../../../../shared/infrastructure/logging/Logger' { export interface Logger { debug: Function; info: Function; warn: Function; error: Function } }
declare module '../../../../shared/domain/errors/ValidationError' { export class ValidationError extends Error {} }
declare module '../../../../shared/domain/errors/UnauthorizedError' { export class UnauthorizedError extends Error {} }
declare module '../../../../shared/domain/errors/ForbiddenError' { export class ForbiddenError extends Error {} }

// auditLogger is typed as ExtendedAuditLogger directly in @/lib/security/audit-logger — no augmentation needed.
