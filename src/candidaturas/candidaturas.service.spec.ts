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
import { CriarCandidaturaDto } from './dto/criar-candidatura.dto';

jest.mock('uuid', () => ({
  v4: () => 'some-mock-uuid',
}));

const mockRepositorioCandidatura = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
};

const mockConvitesService = {
  gerarConvite: jest.fn(),
};

describe('CandidaturasService', () => {
  let service: CandidaturasService;
  let repositorio: typeof mockRepositorioCandidatura;
  let convitesService: typeof mockConvitesService;

  beforeEach(async () => {
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

    repositorio = module.get(getRepositoryToken(Candidatura));
    convitesService = module.get(ConvitesService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

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

      expect(repositorio.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusCandidatura.APPROVED }),
      );

      expect(convitesService.gerarConvite).toHaveBeenCalledWith(id);

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

      repositorio.findOneBy.mockResolvedValue(candidaturaAprovada);

      await expect(service.aprovarCandidatura(id)).rejects.toThrow(
        BadRequestException,
      );
      expect(convitesService.gerarConvite).not.toHaveBeenCalled();
      expect(repositorio.save).not.toHaveBeenCalled();
    });
  });

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

      expect(repositorio.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusCandidatura.REJECTED }),
      );
      expect(result.status).toEqual(StatusCandidatura.REJECTED);

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

      repositorio.findOneBy.mockResolvedValue(candidaturaAprovada);

      await expect(service.recusarCandidatura(id)).rejects.toThrow(
        BadRequestException,
      );
      expect(repositorio.save).not.toHaveBeenCalled();
    });
  });
});
