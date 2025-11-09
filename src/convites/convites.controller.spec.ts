import { Test, TestingModule } from '@nestjs/testing';
import { ConvitesController } from './convites.controller';
import { ConvitesService } from './convites.service';

// Mock do UUID
jest.mock('uuid', () => ({
  v4: () => 'some-mock-uuid',
}));

describe('ConvitesController', () => {
  let controller: ConvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvitesController],
      providers: [
        {
          provide: ConvitesService,
          useValue: {
            // Adicione mocks para as funções do serviço que você usa no controller
            // Ex: validarConvite: jest.fn(), completarCadastro: jest.fn()
          },
        },
      ],
    }).compile();

    controller = module.get<ConvitesController>(ConvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
