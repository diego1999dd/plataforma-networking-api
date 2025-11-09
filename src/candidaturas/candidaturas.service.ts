// api/src/candidaturas/candidaturas.service.ts

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Candidatura,
  StatusCandidatura,
} from '../entidades/candidatura.entidade'; // Import corrigido!
import { CriarCandidaturaDto } from './dto/criar-candidatura.dto';
import { ConvitesService } from '../convites/convites.service';
import { Convite } from '../entidades/convite.entidade';

@Injectable()
export class CandidaturasService {
  private readonly logger = new Logger(CandidaturasService.name);

  constructor(
    @InjectRepository(Candidatura) // Injeta o repositório
    private repositorioCandidatura: Repository<Candidatura>,
    private convitesService: ConvitesService, // Injeta o ConvitesService
  ) {}

  async criarCandidatura(dados: CriarCandidaturaDto): Promise<Candidatura> {
    // 1. Cria a instância (status 'PENDENTE' por padrão)
    const novaCandidatura = this.repositorioCandidatura.create(dados);

    // 2. Salva no banco de dados
    const candidaturaSalva =
      await this.repositorioCandidatura.save(novaCandidatura);

    // 3. Simula notificação para o Admin
    this.logger.log(
      `[EVENTO] Nova candidatura submetida por: ${candidaturaSalva.nome}. ID: ${candidaturaSalva.id}`,
    );

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

  // NOVO MÉTODO: Aprovação
  async aprovarCandidatura(
    id: number,
  ): Promise<{ candidatura: Candidatura; convite: Convite }> {
    const candidatura = await this.repositorioCandidatura.findOneBy({ id });

    if (!candidatura) {
      throw new NotFoundException(`Candidatura com ID ${id} não encontrada.`);
    }

    if (candidatura.status !== StatusCandidatura.PENDING) {
      // Lógica para evitar reaprovar ou aprovar uma recusada
      throw new BadRequestException(
        'A candidatura não está no status PENDENTE.',
      );
    }

    // 1. Atualiza o status
    candidatura.status = StatusCandidatura.APPROVED;
    await this.repositorioCandidatura.save(candidatura);

    // 2. Gera o token e o convite
    const novoConvite = await this.convitesService.gerarConvite(candidatura.id);

    return { candidatura, convite: novoConvite };
  }

  // NOVO MÉTODO: Recusa de Candidatura
  async recusarCandidatura(id: number): Promise<Candidatura> {
    const candidatura = await this.repositorioCandidatura.findOneBy({ id });

    if (!candidatura) {
      throw new NotFoundException(`Candidatura com ID ${id} não encontrada.`);
    }

    if (candidatura.status !== StatusCandidatura.PENDING) {
      // Impede que se recuse uma candidatura já aprovada ou recusada
      throw new BadRequestException(
        `A candidatura já foi processada com status ${candidatura.status}.`,
      );
    }

    // 1. Atualiza o status
    candidatura.status = StatusCandidatura.REJECTED;
    await this.repositorioCandidatura.save(candidatura);

    this.logger.log(`[EVENTO] Candidatura com ID ${id} recusada.`);

    return candidatura;
  }
}
