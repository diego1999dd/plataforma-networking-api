import { Test, TestingModule } from '@nestjs/testing';
import { ConvitesService } from './convites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Convite } from '../entidades/convite.entidade';
import {
  Candidatura,
  StatusCandidatura,
} from '../entidades/candidatura.entidade';
import { MembrosService } from '../membros/membros.service';
import { Membro } from '../entidades/membro.entidade';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CompletarCadastroDto } from '../candidaturas/dto/completar-cadastro.dto';

jest.mock('uuid', () => ({
  v4: () => 'token-uuid-mock-123456',
}));

const mockRepositorioConvite = {
  create: jest.fn((data) => data),
  save: jest.fn((data) => Promise.resolve(data)),
  findOne: jest.fn(),
};

const mockRepositorioCandidatura = {};

const mockMembrosService = {
  criarMembro: jest.fn(),
};

describe('ConvitesService', () => {
  let service: ConvitesService;
  let repositorioConvite: typeof mockRepositorioConvite;
  let membrosService: typeof mockMembrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConvitesService,
        {
          provide: getRepositoryToken(Convite),
          useValue: mockRepositorioConvite,
        },
        {
          provide: getRepositoryToken(Candidatura),
          useValue: mockRepositorioCandidatura,
        },
        {
          provide: MembrosService,
          useValue: mockMembrosService,
        },
      ],
    }).compile();

    service = module.get<ConvitesService>(ConvitesService);
    repositorioConvite = module.get(getRepositoryToken(Convite));
    membrosService = module.get(MembrosService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('gerarConvite', () => {
    it('deve gerar um UUID e salvar um novo convite', async () => {
      const candidaturaId = 1;
      const result = await service.gerarConvite(candidaturaId);

      expect(repositorioConvite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'token-uuid-mock-123456',
          candidaturaId: candidaturaId,
          isUsado: false,
        }),
      );
      expect(repositorioConvite.save).toHaveBeenCalled();
      expect(result.token).toEqual('token-uuid-mock-123456');
    });
  });

  describe('validarConvite', () => {
    const tokenValido = 'token-valido';
    const conviteAprovado: Convite = {
      id: 1,
      token: tokenValido,
      isUsado: false,
      candidaturaId: 1,
      dataCriacao: new Date(),
      candidatura: { status: StatusCandidatura.APPROVED } as Candidatura,
    } as Convite;

    it('deve retornar o convite se for válido, não usado e a candidatura estiver APROVADA', async () => {
      repositorioConvite.findOne.mockResolvedValue(conviteAprovado);

      const result = await service.validarConvite(tokenValido);

      expect(repositorioConvite.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['candidatura'] }),
      );
      expect(result).toEqual(conviteAprovado);
    });

    it('deve lançar NotFoundException se o token não for encontrado', async () => {
      repositorioConvite.findOne.mockResolvedValue(null);

      await expect(service.validarConvite(tokenValido)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se o convite já foi usado', async () => {
      const conviteUsado = { ...conviteAprovado, isUsado: true } as Convite;
      repositorioConvite.findOne.mockResolvedValue(conviteUsado);

      await expect(service.validarConvite(tokenValido)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validarConvite(tokenValido)).rejects.toThrow(
        'Este convite já foi utilizado.',
      );
    });

    it('deve lançar BadRequestException se a candidatura não estiver APROVADA', async () => {
      const convitePendente = {
        ...conviteAprovado,
        candidatura: { status: StatusCandidatura.PENDING } as Candidatura,
      } as Convite;
      repositorioConvite.findOne.mockResolvedValue(convitePendente);

      await expect(service.validarConvite(tokenValido)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validarConvite(tokenValido)).rejects.toThrow(
        'A candidatura associada não foi aprovada.',
      );
    });
  });

  describe('completarCadastro', () => {
    const token = 'token-valido';
    const dto: CompletarCadastroDto = {
      funcao: 'Dev Fullstack',
      telefone: '11987654321',
      bio: 'Minha biografia',
    };
    const conviteValido: Convite = {
      id: 1,
      token,
      isUsado: false,
      candidaturaId: 1,
      dataCriacao: new Date(),
      candidatura: {
        nome: 'Candidato Teste',
        email: 'candidato@mail.com',
        empresa: 'Tech Corp',
        status: StatusCandidatura.APPROVED,
      } as Candidatura,
    } as Convite;

    const membroCriado: Membro = {
      id: 10,
      nome: 'Candidato Teste',
      email: 'candidato@mail.com',
      empresa: 'Tech Corp',
      funcao: dto.funcao,
      telefone: dto.telefone,
      bio: dto.bio,
      ativo: true,
      dataAdesao: new Date(),
    };

    it('deve criar o membro, marcar o convite como usado e retornar o Membro', async () => {
      repositorioConvite.findOne.mockResolvedValue(conviteValido);
      membrosService.criarMembro.mockResolvedValue(membroCriado);

      const result = await service.completarCadastro(token, dto);

      expect(membrosService.criarMembro).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Candidato Teste',
          email: 'candidato@mail.com',
          telefone: dto.telefone,
          funcao: dto.funcao,
        }),
      );

      const conviteSalvo = repositorioConvite.save.mock.calls[0][0];
      expect(conviteSalvo.isUsado).toBe(true);

      expect(result).toEqual(membroCriado);
    });
  });
});
