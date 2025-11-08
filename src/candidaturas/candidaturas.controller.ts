// api/src/candidaturas/candidaturas.controller.ts

import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { CandidaturasService } from './candidaturas.service';
import { CriarCandidaturaDto } from './dto/criar-candidatura.dto'; // Importa DTO
import { Candidatura } from '../entidades/candidatura.entidade'; // Importa Entidade

@Controller() // Deixamos o prefixo de rota opcional para usar rotas mais complexas
@UsePipes(new ValidationPipe()) // Garante que o DTO seja validado aqui
export class CandidaturasController {
  constructor(private readonly candidaturasService: CandidaturasService) {}

  // 1. Rota Pública: POST /candidaturas (Submissão)
  @Post('candidaturas')
  @HttpCode(HttpStatus.CREATED) 
  async criar(
    @Body() criarCandidaturaDto: CriarCandidaturaDto, // Usando o DTO
  ): Promise<Candidatura> {
    
    return this.candidaturasService.criarCandidatura(
      criarCandidaturaDto,
    );
  }

  // 2. Rota Protegida (Admin): GET /admin/candidaturas (Listagem)
  // Nota: A proteção (Authentication Guard) será adicionada na próxima etapa.
  @Get('admin/candidaturas')
  async listarTodas(): Promise<Candidatura[]> {
    return this.candidaturasService.listarTodas();
  }

  // TODO: Adicionar rotas POST /admin/candidaturas/:id/aprovar e /recusar
}