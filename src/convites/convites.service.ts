import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // Importa a função de geração de UUID
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
    private repositorioCandidatura: Repository<Candidatura>, // Necessário para aprovação/recusa
    private membrosService: MembrosService, // Injeção do MembrosService
  ) {}

  async gerarConvite(candidaturaId: number): Promise<Convite> {
    // 1. Gera o token único
    const tokenUnico = uuidv4();

    // 2. Cria o objeto Convite
    const novoConvite = this.repositorioConvite.create({
      token: tokenUnico,
      candidaturaId: candidaturaId,
      isUsado: false,
    });

    // 3. Salva no banco de dados
    const conviteSalvo = await this.repositorioConvite.save(novoConvite);

    // 4. Simula o envio do link por e-mail (console.log é suficiente para o teste)
    this.logger.log(
      `[E-MAIL] Link de Cadastro Gerado para o ID ${candidaturaId}: http://localhost:3000/cadastro/${tokenUnico}`,
    );

    return conviteSalvo;
  }
  async validarConvite(token: string): Promise<Convite> {
    const convite = await this.repositorioConvite.findOne({
      where: { token },
      relations: ['candidatura'], // Carrega os dados da Candidatura para uso posterior
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

  // 2. Conclusão do Cadastro
  async completarCadastro(
    token: string,
    dadosFinais: CompletarCadastroDto,
  ): Promise<Membro> {
    // Valida e recupera os dados
    const convite = await this.validarConvite(token);
    const candidatura = convite.candidatura;

    // Combina dados da Candidatura original + dados do formulário final
    const dadosMembro = {
      nome: candidatura.nome,
      email: candidatura.email,
      empresa: candidatura.empresa,
      telefone: dadosFinais.telefone,
      funcao: dadosFinais.funcao,
      bio: dadosFinais.bio,
    };

    // Cria o Membro no banco de dados
    const novoMembro = await this.membrosService.criarMembro(dadosMembro);

    // Marca o convite como usado para evitar reuso
    convite.isUsado = true;
    await this.repositorioConvite.save(convite);

    this.logger.log(`[SUCESSO] Novo Membro cadastrado: ${novoMembro.nome}.`);

    return novoMembro;
  }
}
