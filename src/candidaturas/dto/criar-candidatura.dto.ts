import { IsNotEmpty, IsEmail, IsString, MaxLength } from 'class-validator';

export class CriarCandidaturaDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @MaxLength(100)
  nome: string;

  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'O e-mail deve ser válido.' })
  email: string;

  @IsNotEmpty({ message: 'O nome da empresa é obrigatório.' })
  @IsString({ message: 'O nome da empresa deve ser um texto.' })
  @MaxLength(150)
  empresa: string;

  @IsNotEmpty({ message: 'O motivo de participação é obrigatório.' })
  @IsString({ message: 'O motivo deve ser um texto.' })
  motivoParticipacao: string;
}
