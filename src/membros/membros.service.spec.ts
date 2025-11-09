import { Test, TestingModule } from '@nestjs/testing';
import { MembrosService } from './membros.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Membro } from '../entidades/membro.entidade';

describe('MembrosService', () => {
  let service: MembrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembrosService,
        {
          provide: getRepositoryToken(Membro),
          useValue: {
            // Adicione mocks para as funções do repositório que você usa
            // Ex: findOne: jest.fn(), create: jest.fn(), save: jest.fn()
          },
        },
      ],
    }).compile();

    service = module.get<MembrosService>(MembrosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
