# 🛡️ Plataforma de Networking - Backend (API NestJS)

Este repositório contém o projeto de API RESTful para a Plataforma de Gestão de Networking, desenvolvido em **NestJS** e **TypeORM** com foco em **código limpo, arquitetura modular e testes de alta cobertura**.

O projeto implementa o Módulo de Gestão de Candidaturas, incluindo o fluxo completo de submissão, aprovação protegida e cadastro final do membro.

## 🌟 Destaques Arquiteturais

A API foi construída seguindo as melhores práticas de microserviços/monolito distribuído e Clean Architecture, conforme detalhado no [ARQUITETURA.md].

- **Framework:** NestJS (Node.js/TypeScript).
- **Banco de Dados:** **PostgreSQL**, escolhido pela necessidade de integridade transacional (ACID) para dados críticos.
- **Segurança:** Rotas de administração protegidas por um **API Key Guard** (`ApiKeyGuard`), garantindo que apenas o Frontend Admin possa gerenciar candidaturas.
- **Testabilidade:** Cobertura robusta com testes unitários (Services) e testes E2E (Fluxo Completo da API).

## 🛠️ Instalação e Execução

### 1\. Pré-requisitos

- Node.js (LTS)
- pnpm (gerenciador de pacotes)
- Docker e Docker Compose (para rodar o PostgreSQL)

### 2\. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (`/backend/.env`) com as seguintes variáveis.

| Variável           | Descrição                                                                            | Exemplo                                           |
| :----------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------ |
| `DATABASE_URL`     | String de conexão completa com o PostgreSQL.                                         | `postgres://user:password@localhost:5432/db_name` |
| `ADMIN_SECRET`     | Chave de segurança para acesso às rotas `/admin/*`. **Necessária para o Front-end.** | `super_secret_admin_key_123`                      |
| `EMAIL_SIMULATION` | Variável para logar tokens de convite no console (em vez de enviar e-mail real).     | `TRUE`                                            |

### 3\. Setup do Banco de Dados (Docker Compose)

Use o `docker-compose.yaml` para iniciar o container do PostgreSQL:

```bash
docker-compose up -d
```

### 4\. Instalação de Dependências e Migrações

```bash
# Instala dependências
pnpm install

# Executa as migrações (cria as tabelas Candidatura, Convite, Membro)
pnpm run typeorm migration:run -- -d src/data-source.ts
```

### 5\. Inicialização da API

```bash
# Inicia a API em modo de desenvolvimento (Geralmente em http://localhost:3001)
pnpm run start:dev
```

---

## 🚀 Fluxo de Uso e Rotas Chave

O Front-end utiliza as seguintes rotas da API para implementar o fluxo de Admissão de Membros:

| Etapa             | Rota                              | Método | Descrição da API                                                                          |
| :---------------- | :-------------------------------- | :----- | :---------------------------------------------------------------------------------------- |
| 1. Candidatura    | `/candidaturas`                   | `POST` | Cria o registro de `Candidatura` com status **PENDENTE**.                                 |
| 2. Painel Admin   | `/admin/candidaturas`             | `GET`  | **PROTEGIDA POR API KEY.** Lista todas as candidaturas.                                   |
| 3. Aprovação      | `/admin/candidaturas/:id/aprovar` | `POST` | **PROTEGIDA POR API KEY.** Altera o status para `APROVADA` e gera o **Token de Convite**. |
| 4. Cadastro Final | `/convites/:token/completar`      | `POST` | Verifica a validade do token, o marca como `usado` e cria o registro de `Membro` final.   |
| 5. Verificação    | `/convites/:token`                | `GET`  | Verifica o status do token (válido, usado, expirado).                                     |

### Detalhe Crucial: Geração do Token de Convite

Ao aprovar uma candidatura (Etapa 3), o serviço de convites simula o envio de e-mail e **LOGA O TOKEN NO TERMINAL DO BACKEND**.

> **Para usar o Front-end, você deve copiar este token do log do terminal do NestJS.**

---

## 🧪 Comandos de Teste

A cobertura de testes é um ponto forte da aplicação, garantindo a lógica de negócio e a integração das camadas.

| Comando             | Tipo de Teste        | Objetivo                                                                                                                                                                   |
| :------------------ | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run test`     | **Unitário**         | Executa testes rápidos focados na lógica individual (Services), como `CandidaturasService` e `ConvitesService`.                                                            |
| `pnpm run test:e2e` | **End-to-End (E2E)** | Executa testes que simulam o fluxo completo do usuário (POST, GET protegido, Aprovação, Cadastro Final), provando a integração entre Controller, Service e Banco de Dados. |

> **Nota:** Os testes E2E utilizam um mock do `ADMIN_SECRET` para autenticação, garantindo que a rotina de segurança seja validada.
