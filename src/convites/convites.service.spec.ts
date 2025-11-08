import { Test, TestingModule } from '@nestjs/testing';
import { ConvitesService } from './convites.service';

describe('ConvitesService', () => {
  let service: ConvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvitesService],
    }).compile();

    service = module.get<ConvitesService>(ConvitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
