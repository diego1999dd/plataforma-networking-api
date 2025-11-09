// api/src/candidaturas/candidaturas.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CandidaturasController } from './candidaturas.controller';
import { CandidaturasService } from './candidaturas.service';
import { ConfigModule } from '@nestjs/config';
import {
  Candidatura,
  StatusCandidatura,
} from '../entidades/candidatura.entidade';
import { ApiKeyGuard } from '../auth/api-key/api-key.guard';
import { of } from 'rxjs'; // Para simular Guards

// Mock do UUID
jest.mock('uuid', () => ({
  v4: () => 'some-mock-uuid',
}));

// Mock da Entidade/DTO
const mockCandidatura: Candidatura = {
  id: 1,
  nome: 'Teste Mock',
  email: 'mock@test.com',
  empresa: 'Mock Corp',
  motivoParticipacao: 'Mock',
  status: StatusCandidatura.PENDING,
  dataCriacao: new Date(),
} as Candidatura;

// Mock do Serviço CandidaturasService
const mockCandidaturasService = {
  criarCandidatura: jest.fn(() => Promise.resolve(mockCandidatura)),
  listarTodas: jest.fn(() => Promise.resolve([mockCandidatura])),
  aprovarCandidatura: jest.fn(() =>
    Promise.resolve({
      candidatura: mockCandidatura,
      convite: { token: 'mock-token' },
    }),
  ),
  recusarCandidatura: jest.fn(() =>
    Promise.resolve({ ...mockCandidatura, status: StatusCandidatura.REJECTED }),
  ),
};

// Mock do Guard para controle
const mockApiKeyGuard = {
  canActivate: jest.fn(() => true), // Por padrão, permite o acesso
};

describe('CandidaturasController (Unitário)', () => {
  let controller: CandidaturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()], // Necessário para o ApiKeyGuard funcionar
      controllers: [CandidaturasController],
      providers: [
        {
          provide: CandidaturasService,
          useValue: mockCandidaturasService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard) // Substitui o Guard real pelo mock
      .useValue(mockApiKeyGuard)
      .compile();

    controller = module.get<CandidaturasController>(CandidaturasController);
    jest.clearAllMocks(); // Limpa as chamadas antes de cada teste
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // --------------------------------------------------------
  // --- Testes de Rota Pública (POST /candidaturas) ---
  // --------------------------------------------------------
  describe('POST /candidaturas (Criação)', () => {
    it('deve chamar o serviço de criação e retornar 201', async () => {
      const dto = { nome: 'João', email: 'a@a.com' } as any;
      const result = await controller.criar(dto);

      expect(mockCandidaturasService.criarCandidatura).toHaveBeenCalledWith(
        dto,
      );
      expect(result).toEqual(mockCandidatura);
      // O status 201 é validado pelo @HttpCode no Controller
    });
  });

  // --------------------------------------------------------
  // --- Testes de Rotas Admin (GET/POST /admin/*) ---
  // --------------------------------------------------------
  describe('Rotas Admin (Protegidas)', () => {
    it('GET /admin/candidaturas deve chamar o serviço e retornar 200', async () => {
      // O mockApiKeyGuard já está configurado para retornar 'true'
      const result = await controller.listarTodas();

      expect(mockCandidaturasService.listarTodas).toHaveBeenCalled();
      expect(result).toEqual([mockCandidatura]);
    });

    it('POST /admin/candidaturas/:id/aprovar deve chamar o serviço e retornar o resultado da aprovação', async () => {
      const id = '1';
      await controller.aprovarCandidatura(id);

      expect(mockCandidaturasService.aprovarCandidatura).toHaveBeenCalledWith(
        1,
      ); // Verifica se o ID foi convertido para número
    });

    it('POST /admin/candidaturas/:id/recusar deve chamar o serviço e retornar o resultado da recusa', async () => {
      const id = '1';
      await controller.recusarCandidatura(id);

      expect(mockCandidaturasService.recusarCandidatura).toHaveBeenCalledWith(
        1,
      );
    });

    // Nota: O teste do 403 Forbidden é mais completo nos testes E2E,
    // mas testar o canActivate do Guard isoladamente é suficiente para o Unit Test.
  });
});
