cat << EOF > ARQUITETURA.md
# ARQUITETURA.md: Plataforma de Gestão de Networking

Este documento detalha o planejamento arquitetural da Plataforma de Gestão para Grupos de Networking, conforme solicitado na Tarefa 1 do teste técnico.

## Stack Técnica Escolhida

* **Frontend:** Next.js (React)
* **Backend:** NestJS (Node.js/TypeScript)
* **Banco de Dados:** PostgreSQL (SQL)
* **ORM:** TypeORM
* **Estilização:** Tailwind CSS (Conforme preferência do Desenvolvedor)

---

## 1. Diagrama da Arquitetura

O projeto adota uma arquitetura de **Microsserviços Leves / Monolito Distribuído**, onde o NestJS opera como um serviço de API robusto, desacoplado do Front-end (Next.js), garantindo escalabilidade e separação de responsabilidades.

### Componentes Principais:

* **Cliente (Next.js Frontend):** Lida com roteamento, estado, validações e interações do usuário. Utiliza o **Tailwind CSS** para estilização.
* **API Backend (NestJS):** Implementa a lógica de negócio, validação de domínio e controle de acesso. Organizado em **Módulos** (ex: \`MemberModule\`, \`ApplicationModule\`).
* **Banco de Dados (PostgreSQL):** Armazenamento persistente de todos os dados do sistema, escolhido pela garantia de **integridade transacional** (ACID).

\`\`\`mermaid
graph TD
    A[Usuário/Admin] -->|1. Requisição HTTP| B(Client/Next.js Frontend)
    B -->|2. Chamada API (REST)| C(NestJS Backend API)
    C -->|3. Consulta SQL (TypeORM)| D(PostgreSQL DB)
    D -->|4. Retorna Dados| C
    C -->|5. Retorna JSON| B
    B -->|6. Renderiza UI| A
    C -->|7. E-mail Assíncrono (Simulado)| E(Serviço de E-mail/Notificações)

    subgraph Plataforma Web
        B
        C
    end
\`\`\`

---

## 2. Modelo de Dados (Esquema PostgreSQL)

### Justificativa da Escolha: PostgreSQL (SQL)

A escolha do PostgreSQL é ideal por ser um banco de dados relacional (SQL) robusto, garantindo a **integridade transacional** e a consistência dos dados (ACID). Isso é fundamental para um sistema de gestão de membros e finanças, onde os relacionamentos de dados são críticos.

### Entidades Principais e Relacionamentos (Simplificado)

| Entidade | Propósito | Campos Chave (Exemplos) | Relacionamentos |
| :--- | :--- | :--- | :--- |
| **User** | Credenciais de acesso de administradores. | \`id\`, \`email\`, \`password\` (hash), \`role\` | 1:1 com \`Member\` (Opcional) |
| **Application** | Registro inicial da intenção de participação. | \`id\`, \`name\`, \`email\`, \`company\`, \`reason\`, \`status\` (\`PENDING\`, \`APPROVED\`, \`REJECTED\`), \`created_at\` | 1:1 com \`Invitation\` (se aprovada) |
| **Invitation** | Token único para cadastro completo. | \`id\`, \`token\` (UUID único), \`application_id\` (FK), \`is_used\` (boolean) | 1:1 com \`Application\`, 1:1 com \`Member\` |
| **Member** | Perfil completo do membro ativo. | \`id\`, \`user_id\` (FK p/ User), \`phone\`, \`role\`, \`is_active\` (boolean), \`joined_date\` | 1:N com \`Referral\` (Indicador), 1:N com \`Payment\` |
| **Referral** | Indicação de negócio entre membros. | \`id\`, \`indicator_id\` (FK p/ Member), \`recipient_id\` (FK p/ Member), \`contact_name\`, \`opportunity_desc\`, \`status\` | N:1 com \`Member\` (Indicador/Recebedor) |
| **ThankYou** | Registro de agradecimento por negócio fechado. | \`id\`, \`sender_id\` (FK p/ Member), \`receiver_id\` (FK p/ Member), \`amount\` | N:1 com \`Member\` (Remetente/Recebedor) |
| **Payment** | Controle de mensalidades. | \`id\`, \`member_id\` (FK), \`month\`, \`year\`, \`status\`, \`amount\` | N:1 com \`Member\` |

---

## 3. Estrutura de Componentes (Frontend - Next.js/React)

A estrutura de pastas do Next.js (utilizando o App Router) visa a máxima reutilização e modularidade, aproveitando as classes do **Tailwind CSS** para os componentes visuais.

\`\`\`
/src
├── api/             # Funções de service/fetchers para comunicação com a API (Axios/Fetch)
├── app/             # Rotas do Next.js (App Router)
│   ├── (public)/    # Rotas acessíveis publicamente (ex: /candidatar, /)
│   ├── (admin)/     # Grupo de rotas protegidas (Admin Dashboard)
│   │   ├── layout.tsx # Layout e Middleware de autenticação de admin
│   │   ├── intencoes/
│   │   └── dashboard/
│   └── cadastro/[token]/ # Rota dinâmica para cadastro completo
├── components/
│   ├── ui/          # Componentes de UI básicos, reutilizáveis e *puramente visuais* (Button, Input, Card)
│   ├── features/    # Componentes que encapsulam lógica de negócio (Feature Components)
│   │   ├── Admissao/
│   │   │   ├── ApplicationForm.tsx
│   │   │   └── AdminIntentionList.tsx
│   │   └── Auth/
│   │       └── AdminGate.tsx (Lógica de proteção de rota)
├── lib/             # Utilitários e funções de apoio (ex: date-fns, validation schemas)
└── types/           # Definições de tipos globais (interfaces e tipos)
\`\`\`

---

## 4. Definição da API (RESTful - NestJS)

A API será desenvolvida em **NestJS** seguindo o padrão RESTful.

### Módulo: Applications (Intenções)

| Endpoint | Método | Descrição | Proteção |
| :--- | :--- | :--- | :--- |
| \`/applications\` | **POST** | Submete uma nova intenção de participação (Status: PENDING). | Pública |
| \`/admin/applications\` | **GET** | Lista todas as intenções submetidas. | Admin |
| \`/admin/applications/:id/approve\` | **POST** | Aprova uma intenção, gera um \`Invitation\` (token único) e simula o envio de e-mail. | Admin |

**Exemplo: POST /applications (Submeter Intenção)**

**Request Body (JSON):**
\`\`\`json
{
  "name": "Nome do Candidato",
  "email": "candidato@email.com",
  "company": "Empresa S.A.",
  "reason": "Por que deseja participar do grupo."
}
\`\`\`

### Módulo: Invitations (Convites e Cadastro Completo)

| Endpoint | Método | Descrição | Proteção |
| :--- | :--- | :--- | :--- |
| \`/invitations/:token/validate\` | **GET** | Valida a existência e se o token não foi usado. | Pública (token) |
| \`/invitations/:token/complete\` | **POST** | Completa o cadastro, cria o registro \`Member\` e marca o token como usado. | Pública (token) |

**Exemplo: POST /invitations/:token/complete (Cadastro Final)**

**Request Body (JSON):**
\`\`\`json
{
  "phone": "11999999999",
  "role": "Desenvolvedor Front-end",
  "bio": "Breve biografia."
}
\`\`\`

EOF