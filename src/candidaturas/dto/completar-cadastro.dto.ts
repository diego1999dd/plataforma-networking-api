import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CompletarCadastroDto {
  @IsNotEmpty({ message: 'O campo função é obrigatório.' })
  @IsString({ message: 'A função deve ser um texto.' })
  @MaxLength(100)
  funcao: string; // Ex: Desenvolvedor Fullstack

  @IsNotEmpty({ message: 'O campo telefone é obrigatório.' })
  @IsString({ message: 'O telefone deve ser um texto.' })
  @MaxLength(50)
  telefone: string;

  @IsOptional()
  @IsString({ message: 'A biografia deve ser um texto.' })
  bio: string;
}
