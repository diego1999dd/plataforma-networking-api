// api/src/convites/convites.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConvitesController } from './convites.controller';
import { ConvitesService } from './convites.service';
import { Membro } from '../entidades/membro.entidade';
import { Convite } from '../entidades/convite.entidade';
import { CompletarCadastroDto } from '../candidaturas/dto/completar-cadastro.dto';

// Mock do UUID
jest.mock('uuid', () => ({
  v4: () => 'some-mock-uuid',
}));

// Mock do serviço ConvitesService
const mockConvitesService = {
  validarConvite: jest.fn(),
  completarCadastro: jest.fn(),
};

describe('ConvitesController', () => {
  let controller: ConvitesController;
  let service: typeof mockConvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvitesController],
      providers: [
        {
          provide: ConvitesService,
          useValue: mockConvitesService,
        },
      ],
    }).compile();

    controller = module.get<ConvitesController>(ConvitesController);
    service = module.get(ConvitesService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // --------------------------------------------------------
  // --- Testes de Rotas Públicas (Convites) ---
  // --------------------------------------------------------
  describe('Rotas de Convite', () => {
    const token = 'token-valido-mockado';
    const mockConvite: Convite = { token } as Convite;
    const mockMembro: Membro = { id: 1, nome: 'Membro Teste' } as Membro;
    const mockDto: CompletarCadastroDto = {
      funcao: 'Dev',
      telefone: '119',
    } as CompletarCadastroDto;

    it('GET /:token deve chamar validarConvite e retornar o Convite', async () => {
      service.validarConvite.mockResolvedValue(mockConvite);

      const result = await controller.validarToken(token);

      expect(service.validarConvite).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockConvite);
    });

    it('POST /:token/completar deve chamar completarCadastro e retornar o Membro', async () => {
      service.completarCadastro.mockResolvedValue(mockMembro);

      const result = await controller.completarCadastro(token, mockDto);

      expect(service.completarCadastro).toHaveBeenCalledWith(token, mockDto);
      expect(result).toEqual(mockMembro);
      // O status 201 Created é validado pelo @HttpCode no Controller
    });
  });
});
