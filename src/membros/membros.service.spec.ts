import { Test, TestingModule } from '@nestjs/testing';
import { MembrosService } from './membros.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Membro } from '../entidades/membro.entidade';
import { CriarMembroData } from '../membros/membros.service';

const mockRepositorioMembro = {
  create: jest.fn(),
  save: jest.fn(),
};

describe('MembrosService (Unitário)', () => {
  let service: MembrosService;
  let repositorio: typeof mockRepositorioMembro;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembrosService,
        {
          provide: getRepositoryToken(Membro),
          useValue: mockRepositorioMembro,
        },
      ],
    }).compile();

    service = module.get<MembrosService>(MembrosService);
    repositorio = module.get(getRepositoryToken(Membro));
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('criarMembro', () => {
    const dadosMembro: CriarMembroData = {
      nome: 'Membro Teste',
      email: 'membro@ativo.com',
      empresa: 'Nova Empresa',
      telefone: '11900001111',
      funcao: 'Diretor',
      bio: 'Bio de teste',
    };
    const membroCriado: Membro = {
      ...dadosMembro,
      id: 100,
      ativo: true,
      dataAdesao: new Date(),
    } as Membro;

    it('deve chamar create e save no repositório com os dados corretos', async () => {
      repositorio.create.mockReturnValue(membroCriado);
      repositorio.save.mockResolvedValue(membroCriado);

      const result = await service.criarMembro(dadosMembro);

      expect(repositorio.create).toHaveBeenCalledWith(dadosMembro);

      expect(repositorio.save).toHaveBeenCalledWith(membroCriado);

      expect(result).toEqual(membroCriado);
      expect(result.ativo).toBe(true);
    });
  });
});
