// api/src/candidaturas/dto/criar-candidatura.dto.ts

import { IsNotEmpty, IsEmail, IsString, MaxLength } from 'class-validator';

export class CriarCandidaturaDto { // Nome da classe em português

  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(100)
  nome: string;

  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'O e-mail deve ser válido.' })
  email: string;

  @IsNotEmpty({ message: 'O nome da empresa é obrigatório.' })
  @IsString({ message: 'O nome da empresa deve ser uma string.' })
  @MaxLength(150)
  empresa: string;

  @IsNotEmpty({ message: 'O motivo de participação é obrigatório.' })
  @IsString({ message: 'O motivo deve ser uma string.' })
  motivoParticipacao: string;
}