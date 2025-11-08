import { Test, TestingModule } from '@nestjs/testing';
import { ConvitesController } from './convites.controller';

describe('ConvitesController', () => {
  let controller: ConvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvitesController],
    }).compile();

    controller = module.get<ConvitesController>(ConvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
