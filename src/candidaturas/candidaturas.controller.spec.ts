import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturasController } from './candidaturas.controller';

describe('CandidaturasController', () => {
  let controller: CandidaturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidaturasController],
    }).compile();

    controller = module.get<CandidaturasController>(CandidaturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
