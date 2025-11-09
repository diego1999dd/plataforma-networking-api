import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturasService } from './candidaturas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Candidatura,
  StatusCandidatura,
} from '../entidades/candidatura.entidade';
import { ConvitesService } from '../convites/convites.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Convite } from '../entidades/convite.entidade';
import { CriarCandidaturaDto } from './dto/criar-candidatura.dto'; // Importa o DTO

// Mock do UUID
jest.mock('uuid', () => ({
  v4: () => 'some-mock-uuid',
}));

// --- MOCKS ---
// 1. Mock do Repositório (Simula o TypeORM)
const mockRepositorioCandidatura = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
};

// 2. Mock do Serviço Injetado (Simula o ConvitesService)
const mockConvitesService = {
  gerarConvite: jest.fn(),
};

describe('CandidaturasService', () => {
  let service: CandidaturasService;
  let repositorio: typeof mockRepositorioCandidatura;
  let convitesService: typeof mockConvitesService;

  beforeEach(async () => {
    // Configura o módulo de testes, injetando os mocks no lugar das dependências reais
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidaturasService,
        {
          provide: getRepositoryToken(Candidatura),
          useValue: mockRepositorioCandidatura,
        },
        {
          provide: ConvitesService,
          useValue: mockConvitesService,
        },
      ],
    }).compile();

    service = module.get<CandidaturasService>(CandidaturasService);
    // Obtém as referências dos mocks
    repositorio = module.get(getRepositoryToken(Candidatura));
    convitesService = module.get(ConvitesService);

    // Limpa o histórico de chamadas antes de cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // --------------------------------------------------------
  // --- 1. Testes de Criação (POST /candidaturas) ---
  // --------------------------------------------------------
  describe('criarCandidatura', () => {
    const createDto: CriarCandidaturaDto = {
      nome: 'Teste Novo',
      email: 'novo@teste.com',
      empresa: 'Empresa Teste',
      motivoParticipacao: 'Motivo',
    };
    const candidaturaCriada: Candidatura = {
      ...createDto,
      id: 1,
      status: StatusCandidatura.PENDING,
      dataCriacao: new Date(),
    } as Candidatura;

    it('deve criar e retornar uma nova candidatura com status PENDENTE', async () => {
      repositorio.create.mockReturnValue(candidaturaCriada);
      repositorio.save.mockResolvedValue(candidaturaCriada);

      const result = await service.criarCandidatura(createDto);

      expect(repositorio.create).toHaveBeenCalledWith(createDto);
      expect(repositorio.save).toHaveBeenCalledWith(candidaturaCriada);
      expect(result.status).toEqual(StatusCandidatura.PENDING);
      expect(result).toEqual(candidaturaCriada);
    });
  });

  // --------------------------------------------------------
  // --- 2. Testes de Listagem (GET /admin/candidaturas) ---
  // --------------------------------------------------------
  describe('listarTodas', () => {
    it('deve listar todas as candidaturas ordenadas por data de criação', async () => {
      const listaMock = [{ id: 1, nome: 'Candidato A' }] as Candidatura[];
      repositorio.find.mockResolvedValue(listaMock);

      const result = await service.listarTodas();

      expect(repositorio.find).toHaveBeenCalledWith({
        order: {
          dataCriacao: 'DESC',
        },
      });
      expect(result).toEqual(listaMock);
    });
  });

  // --------------------------------------------------------
  // --- 3. Testes de Aprovação (POST /admin/:id/aprovar) ---
  // --------------------------------------------------------
  describe('aprovarCandidatura', () => {
    const id = 1;
    const conviteMock = { token: 'uuid-mock', candidaturaId: id } as Convite;

    const candidaturaPendente = {
      id,
      status: StatusCandidatura.PENDING,
      nome: 'Candidato',
      email: 'a@a.com',
    } as Candidatura;

    it('deve aprovar e gerar um convite se o status for PENDENTE', async () => {
      repositorio.findOneBy.mockResolvedValue(candidaturaPendente);
      convitesService.gerarConvite.mockResolvedValue(conviteMock);

      const candidaturaAposAprovacao = {
        ...candidaturaPendente,
        status: StatusCandidatura.APPROVED,
      } as Candidatura;
      repositorio.save.mockResolvedValue(candidaturaAposAprovacao);

      const result = await service.aprovarCandidatura(id);

      // 1. Verifica se o status foi alterado e salvo
      expect(repositorio.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusCandidatura.APPROVED }),
      );

      // 2. Verifica se o serviço de convites foi chamado
      expect(convitesService.gerarConvite).toHaveBeenCalledWith(id);

      // 3. Verifica o retorno
      expect(result.candidatura.status).toEqual(StatusCandidatura.APPROVED);
      expect(result.convite).toEqual(conviteMock);
    });

    it('deve lançar NotFoundException se a candidatura não for encontrada', async () => {
      repositorio.findOneBy.mockResolvedValue(null);

      await expect(service.aprovarCandidatura(id)).rejects.toThrow(
        NotFoundException,
      );
      expect(convitesService.gerarConvite).not.toHaveBeenCalled();
      expect(repositorio.save).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se o status não for PENDENTE', async () => {
      const candidaturaAprovada = {
        ...candidaturaPendente,
        status: StatusCandidatura.APPROVED,
      } as Candidatura;

      repositorio.findOneBy.mockResolvedValue(candidaturaAprovada); // Simula status já APROVADO

      await expect(service.aprovarCandidatura(id)).rejects.toThrow(
        BadRequestException,
      );
      expect(convitesService.gerarConvite).not.toHaveBeenCalled();
      expect(repositorio.save).not.toHaveBeenCalled();
    });
  });

  // --- 4. Testes de Recusa (POST /admin/:id/recusar) ---
  // --------------------------------------------------------
  describe('recusarCandidatura', () => {
    const id = 2;
    const candidaturaPendente = {
      id,
      status: StatusCandidatura.PENDING,
      nome: 'Candidato',
      email: 'b@b.com',
    } as Candidatura;

    it('deve recusar e salvar o status REJECTED se for PENDENTE', async () => {
      repositorio.findOneBy.mockResolvedValue(candidaturaPendente);
      const candidaturaRecusada = {
        ...candidaturaPendente,
        status: StatusCandidatura.REJECTED,
      } as Candidatura;
      repositorio.save.mockResolvedValue(candidaturaRecusada);

      const result = await service.recusarCandidatura(id);

      // Verifica se o status foi alterado e salvo
      expect(repositorio.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusCandidatura.REJECTED }),
      );
      expect(result.status).toEqual(StatusCandidatura.REJECTED);
      // Verifica que o serviço de convites NÃO foi chamado (correto para recusa)
      expect(convitesService.gerarConvite).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se a candidatura não for encontrada', async () => {
      repositorio.findOneBy.mockResolvedValue(null);

      await expect(service.recusarCandidatura(id)).rejects.toThrow(
        NotFoundException,
      );
      expect(repositorio.save).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se o status não for PENDENTE', async () => {
      const candidaturaAprovada = {
        ...candidaturaPendente,
        status: StatusCandidatura.APPROVED,
      } as Candidatura;

      repositorio.findOneBy.mockResolvedValue(candidaturaAprovada); // Simula status APROVADA

      await expect(service.recusarCandidatura(id)).rejects.toThrow(
        BadRequestException,
      );
      expect(repositorio.save).not.toHaveBeenCalled();
    });
  });
});
