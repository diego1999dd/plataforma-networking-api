import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Candidatura } from '../src/entidades/candidatura.entidade';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// 1. Definição da Chave de Administrador Mockada
// Isso garante que o ApiKeyGuard (proteção de rotas admin) funcione no ambiente de teste.
const MOCK_ADMIN_KEY = 'TEST_ADMIN_SECRET';

describe('Fluxo de Admissão de Membros (e2e)', () => {
  let app: INestApplication;
  let candidaturaId: number;
  let conviteToken: string;

  // Cargas úteis baseadas nos seus DTOs (CriarCandidaturaDto e CompletarCadastroDto)
  const candidaturaPayload = {
    nome: 'Candidato E2E',
    email: 'e2e.test@example.com',
    empresa: 'TestCorp E2E',
    motivoParticipacao: 'Quero testar o sistema.',
  };

  const cadastroCompletoPayload = {
    funcao: 'QA Engineer',
    telefone: '11988887777',
    bio: 'Biografia de teste.',
  };

  beforeAll(async () => {
    // 2. Configuração do Módulo de Teste com Sobrescrita da Chave Admin
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Garante que o ConfigService retorne a chave mockada para o ApiKeyGuard
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'ADMIN_SECRET') {
            return MOCK_ADMIN_KEY;
          }
          // Para outras variáveis de ambiente, usa o valor real (e.g., DB configs)
          return process.env[key];
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Limpa o banco de dados antes de executar os testes
    const dataSource = app.get(DataSource);
    await dataSource.query(
      'TRUNCATE TABLE "applications", "members", "invitations" RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  // Teste Básico de Conectividade
  it('/ (GET) - Deve retornar "Hello World!"', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Hello World!');
  });

  // =================================================================
  // FLUXO 1: Submeter Intenção (Público)
  // =================================================================
  it('POST /candidaturas - Deve criar uma nova candidatura PENDENTE', () => {
    return request(app.getHttpServer())
      .post('/candidaturas')
      .send(candidaturaPayload)
      .expect(HttpStatus.CREATED) // 201
      .then((response) => {
        const candidatura: Candidatura = response.body;
        expect(candidatura).toHaveProperty('id');
        expect(candidatura.email).toEqual(candidaturaPayload.email);
        expect(candidatura.status).toEqual('PENDENTE');

        candidaturaId = candidatura.id; // Armazena o ID para próximos testes
      });
  });

  // =================================================================
  // FLUXO 2: Acesso Admin e Aprovação (Protegido)
  // =================================================================
  it('GET /admin/candidaturas - Deve falhar sem a API Key (403 Forbidden)', () => {
    return request(app.getHttpServer())
      .get('/admin/candidaturas')
      .expect(HttpStatus.FORBIDDEN);
  });

  it('GET /admin/candidaturas - Deve listar candidaturas com a API Key', () => {
    return request(app.getHttpServer())
      .get('/admin/candidaturas')
      .set('x-api-key', MOCK_ADMIN_KEY)
      .expect(HttpStatus.OK)
      .then((response) => {
        const nossaCandidatura = response.body.find(
          (c) => c.id === candidaturaId,
        );
        expect(nossaCandidatura).toBeDefined();
        expect(nossaCandidatura.status).toEqual('PENDENTE');
      });
  });

  it('POST /admin/candidaturas/:id/aprovar - Deve aprovar a candidatura e retornar o token', () => {
    return request(app.getHttpServer())
      .post(`/admin/candidaturas/${candidaturaId}/aprovar`)
      .set('x-api-key', MOCK_ADMIN_KEY)
      .expect(HttpStatus.CREATED) // 201
      .then((response) => {
        expect(response.body.candidatura.status).toEqual('APROVADA');
        expect(response.body.convite).toHaveProperty('token');

        conviteToken = response.body.convite.token; // Armazena o token
      });
  });

  // =================================================================
  // FLUXO 3: Finalizar Cadastro (Público, Protegido por Token)
  // =================================================================
  it('GET /convites/:token - Deve validar o token de convite antes de ser usado', () => {
    return request(app.getHttpServer())
      .get(`/convites/${conviteToken}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body.isUsado).toBe(false);
      });
  });

  it('POST /convites/:token/completar - Deve finalizar o cadastro e criar o Membro', () => {
    return request(app.getHttpServer())
      .post(`/convites/${conviteToken}/completar`)
      .send(cadastroCompletoPayload)
      .expect(HttpStatus.CREATED) // 201
      .then((response) => {
        const membroCriado = response.body;
        // Verifica se os dados combinados foram usados para criar o Membro
        expect(membroCriado.email).toEqual(candidaturaPayload.email);
        expect(membroCriado.funcao).toEqual(cadastroCompletoPayload.funcao);
        expect(membroCriado.ativo).toBe(true);
      });
  });

  it('GET /convites/:token - Deve falhar após o uso (Token já utilizado)', () => {
    return request(app.getHttpServer())
      .get(`/convites/${conviteToken}`)
      .expect(HttpStatus.BAD_REQUEST) // 400
      .then((response) => {
        expect(response.body.message).toEqual('Este convite já foi utilizado.');
      });
  });
});
