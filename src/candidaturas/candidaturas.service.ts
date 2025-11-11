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
} from '../entidades/candidatura.entidade';
import { CriarCandidaturaDto } from './dto/criar-candidatura.dto';
import { ConvitesService } from '../convites/convites.service';
import { Convite } from '../entidades/convite.entidade';
// 2. Importações necessárias para exceções e logging
@Injectable()
export class CandidaturasService {
  private readonly logger = new Logger(CandidaturasService.name);

  constructor(
    @InjectRepository(Candidatura)
    private repositorioCandidatura: Repository<Candidatura>,
    private convitesService: ConvitesService,
  ) {}

  async criarCandidatura(dados: CriarCandidaturaDto): Promise<Candidatura> {
    const novaCandidatura = this.repositorioCandidatura.create(dados);

    const candidaturaSalva =
      await this.repositorioCandidatura.save(novaCandidatura);

    this.logger.log(
      `[EVENTO] Nova candidatura submetida por: ${candidaturaSalva.nome}. ID: ${candidaturaSalva.id}`,
    );

    return candidaturaSalva;
  }

  async listarTodas(): Promise<Candidatura[]> {
    return this.repositorioCandidatura.find({
      order: {
        dataCriacao: 'DESC',
      },
    });
  }

  async aprovarCandidatura(
    id: number,
  ): Promise<{ candidatura: Candidatura; convite: Convite }> {
    const candidatura = await this.repositorioCandidatura.findOneBy({ id });

    if (!candidatura) {
      throw new NotFoundException(`Candidatura com ID ${id} não encontrada.`);
    }

    if (candidatura.status !== StatusCandidatura.PENDING) {
      throw new BadRequestException(
        'A candidatura não está no status PENDENTE.',
      );
    }

    candidatura.status = StatusCandidatura.APPROVED;
    await this.repositorioCandidatura.save(candidatura);

    const novoConvite = await this.convitesService.gerarConvite(candidatura.id);

    return { candidatura, convite: novoConvite };
  }

  async recusarCandidatura(id: number): Promise<Candidatura> {
    const candidatura = await this.repositorioCandidatura.findOneBy({ id });

    if (!candidatura) {
      throw new NotFoundException(`Candidatura com ID ${id} não encontrada.`);
    }

    if (candidatura.status !== StatusCandidatura.PENDING) {
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
