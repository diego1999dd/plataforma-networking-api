// api/src/candidaturas/candidaturas.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidatura, StatusCandidatura } from '../entidades/candidatura.entidade'; // Import corrigido!
import { CriarCandidaturaDto } from './dto/criar-candidatura.dto';

@Injectable()
export class CandidaturasService {
  private readonly logger = new Logger(CandidaturasService.name);

  constructor(
    @InjectRepository(Candidatura) // Injeta o repositório
    private repositorioCandidatura: Repository<Candidatura>, // Nome de variável em português
  ) {}

  async criarCandidatura(dados: CriarCandidaturaDto): Promise<Candidatura> {
    
    // 1. Cria a instância (status 'PENDENTE' por padrão)
    const novaCandidatura = this.repositorioCandidatura.create(dados);

    // 2. Salva no banco de dados
    const candidaturaSalva = await this.repositorioCandidatura.save(novaCandidatura);

    // 3. Simula notificação para o Admin
    this.logger.log(`[EVENTO] Nova candidatura submetida por: ${candidaturaSalva.nome}. ID: ${candidaturaSalva.id}`);

    return candidaturaSalva;
  }

  // NOVO MÉTODO: Listagem para o Admin
  async listarTodas(): Promise<Candidatura[]> {
    // Busca todas as candidaturas ordenadas por data de criação (mais novas primeiro)
    return this.repositorioCandidatura.find({
      order: {
        dataCriacao: 'DESC',
      },
    });
  }

  // TODO: Criar método 'aprovar' e 'recusar' (próximas etapas)
}