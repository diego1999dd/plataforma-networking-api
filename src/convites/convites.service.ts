import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuid from 'uuid'; // Importa a função de geração de UUID
import { Convite } from '../entidades/convite.entidade';
import {
  Candidatura,
  StatusCandidatura,
} from '../entidades/candidatura.entidade';
import { MembrosService } from '../membros/membros.service';
import { Membro } from '../entidades/membro.entidade';
import { CompletarCadastroDto } from '../candidaturas/dto/completar-cadastro.dto';

@Injectable()
export class ConvitesService {
  private readonly logger = new Logger(ConvitesService.name);

  constructor(
    @InjectRepository(Convite)
    private repositorioConvite: Repository<Convite>,
    @InjectRepository(Candidatura)
    private repositorioCandidatura: Repository<Candidatura>,
    private membrosService: MembrosService,
  ) {}

  async gerarConvite(candidaturaId: number): Promise<Convite> {
    const tokenUnico = uuid.v4();

    const novoConvite = this.repositorioConvite.create({
      token: tokenUnico,
      candidaturaId: candidaturaId,
      isUsado: false,
    });

    const conviteSalvo = await this.repositorioConvite.save(novoConvite);

    this.logger.log(
      `[E-MAIL] Link de Cadastro Gerado para o ID ${candidaturaId}: http://localhost:3000/cadastro/${tokenUnico}`,
    );

    return conviteSalvo;
  }
  async validarConvite(token: string): Promise<Convite> {
    const convite = await this.repositorioConvite.findOne({
      where: { token },
      relations: ['candidatura'],
    });

    if (!convite) {
      throw new NotFoundException('Token de convite inválido.');
    }
    if (convite.isUsado) {
      throw new BadRequestException('Este convite já foi utilizado.');
    }
    if (convite.candidatura.status !== StatusCandidatura.APPROVED) {
      throw new BadRequestException(
        'A candidatura associada não foi aprovada.',
      );
    }

    return convite;
  }

  async completarCadastro(
    token: string,
    dadosFinais: CompletarCadastroDto,
  ): Promise<Membro> {
    const convite = await this.validarConvite(token);
    const candidatura = convite.candidatura;

    const dadosMembro = {
      nome: candidatura.nome,
      email: candidatura.email,
      empresa: candidatura.empresa,
      telefone: dadosFinais.telefone,
      funcao: dadosFinais.funcao,
      bio: dadosFinais.bio,
    };

    const novoMembro = await this.membrosService.criarMembro(dadosMembro);

    convite.isUsado = true;
    await this.repositorioConvite.save(convite);

    this.logger.log(`[SUCESSO] Novo Membro cadastrado: ${novoMembro.nome}.`);

    return novoMembro;
  }
}
