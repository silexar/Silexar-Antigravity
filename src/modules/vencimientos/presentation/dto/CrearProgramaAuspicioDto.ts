// @ts-expect-error — class-validator ships its type declarations under /types/ but
// does not set the "types" field in package.json, so some tsconfig resolutions
// cannot locate them automatically. Add "typeRoots" or install a stub if this
// becomes a CI blocker. The decorators function correctly at runtime.
import { IsString, IsNotEmpty, IsNumber, IsArray, Min } from 'class-validator';

export class CrearProgramaAuspicioDto {
  @IsString()
  @IsNotEmpty()
  declare emisoraId: string;

  @IsString()
  @IsNotEmpty()
  declare nombre: string;

  @IsString()
  @IsNotEmpty()
  declare horaInicio: string;

  @IsString()
  @IsNotEmpty()
  declare horaFin: string;

  @IsArray()
  declare diasEmision: number[];

  @IsNumber()
  @Min(1)
  declare cupoDisponible: number;
}
