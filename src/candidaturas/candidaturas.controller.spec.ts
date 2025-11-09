import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturasController } from './candidaturas.controller';
import { CandidaturasService } from './candidaturas.service';
import { ConfigModule } from '@nestjs/config';

// Mock do UUID
jest.mock('uuid', () => ({
  v4: () => 'some-mock-uuid',
}));

describe('CandidaturasController', () => {
  let controller: CandidaturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule], // Adiciona o ConfigModule
      controllers: [CandidaturasController],
      providers: [
        {
          provide: CandidaturasService,
          useValue: {
            // Adicione mocks para as funções do serviço que você usa no controller
            // Ex: criarCandidatura: jest.fn(), listarTodas: jest.fn(), aprovarCandidatura: jest.fn()
          },
        },
      ],
    }).compile();

    controller = module.get<CandidaturasController>(CandidaturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
