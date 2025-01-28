import { IsNotEmpty, IsString } from 'class-validator';

export class GrammarCorrectionDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}
