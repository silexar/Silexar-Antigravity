// @ts-expect-error — class-validator ships its type declarations under /types/ but
// does not set the "types" field in package.json, so some tsconfig resolutions
// cannot locate them automatically. Add "typeRoots" or install a stub if this
// becomes a CI blocker. The decorators function correctly at runtime.
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ValidarDisponibilidadDto {
  @IsString()
  @IsNotEmpty()
  declare programaId: string;

  @IsString()
  @IsNotEmpty()
  declare franjaHoraria: string;
}

export class ConfigurarTarifarioDto {
  @IsString()
  @IsNotEmpty()
  declare emisoraId: string;

  @IsString()
  @IsNotEmpty()
  declare franjaHoraria: string;

  @IsNumber()
  @Min(0.1)
  declare factorRecargo: number;
}
