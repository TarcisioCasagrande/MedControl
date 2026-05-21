# 🏥 ControlMed - Sistema de Gestão Médica

## 🚀 Sobre o Projeto

O **ControlMed** é um sistema web de gestão médica desenvolvido para clínicas e consultórios, permitindo o gerenciamento completo de:

* Pacientes
* Médicos
* Consultas
* Prontuários
* Pagamentos
* Usuários com controle de acesso

O sistema centraliza todas as informações em uma única plataforma, reduzindo erros operacionais, melhorando a organização e otimizando o fluxo de atendimento.

---

## ⚙️ Funcionalidades

### 🔐 Autenticação e Segurança

* Login com JWT
* Controle de acesso por perfil (Admin, Recepcionista, Médico, Paciente)
* Proteção de rotas no frontend e backend
* Controle de permissões por usuário

### 👥 Gestão de Usuários

* Cadastro de usuários (Admin)
* Edição de usuários
* Ativação e inativação
* Controle de perfil de acesso

### 🏥 Gestão Clínica

* Cadastro de médicos
* Cadastro de pacientes
* Agendamento de consultas
* Controle de status das consultas
* Agenda médica
* Validação de conflitos de horário

### 📋 Prontuários

* Registro de atendimentos
* Histórico médico por paciente

### 💰 Financeiro

* Registro de pagamentos
* Controle financeiro por consulta

### 📊 Dashboard

* Indicadores gerais do sistema
* Visão consolidada de dados

### 🤖 Assistente IA

* Integração com IA para apoio clínico e análise de dados

---

## 🛠️ Tecnologias Utilizadas

### Backend

* .NET 8
* ASP.NET Core
* Entity Framework Core
* PostgreSQL
* JWT Authentication
* Swagger

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Lucide React

---

## 📦 Pré-requisitos

Instale as ferramentas abaixo:

* [.NET 8](https://dotnet.microsoft.com/download)
* [Node.js](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/download/)

Instalar Entity Framework CLI:

```bash
dotnet tool install --global dotnet-ef
```

---

## 🗄️ Configuração do Banco de Dados

Arquivo: `backend/appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=controlmed;Username=postgres;Password=123"
}
```

---

## ▶️ Como Rodar o Projeto

### 🔧 Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

* API: http://localhost:5179
* Swagger: http://localhost:5179/swagger

---

### 💻 Frontend

```bash
cd frontend
npm install
npm run dev
```

* Frontend: http://localhost:5173

---

## 🔗 Endpoints da API

### 🔑 Autenticação

* POST `/api/auth/login`
* POST `/api/auth/criar-admin-inicial`

### 👤 Usuários

* GET `/api/usuarios`
* POST `/api/usuarios`
* PUT `/api/usuarios/{id}`
* PATCH `/api/usuarios/{id}/status`
* DELETE `/api/usuarios/{id}`

### 👨‍⚕️ Médicos

* GET `/api/medicos`
* GET `/api/medicos/{id}`
* POST `/api/medicos`
* PUT `/api/medicos/{id}`
* DELETE `/api/medicos/{id}`

### 🧑‍🤝‍🧑 Pacientes

* GET `/api/pacientes`
* GET `/api/pacientes/{id}`
* POST `/api/pacientes`
* PUT `/api/pacientes/{id}`
* DELETE `/api/pacientes/{id}`

### 📅 Consultas

* GET `/api/consultas`
* GET `/api/consultas/{id}`
* POST `/api/consultas`
* PUT `/api/consultas/{id}`
* DELETE `/api/consultas/{id}`

### 📋 Prontuários

* GET `/api/prontuarios`
* GET `/api/prontuarios/{id}`
* POST `/api/prontuarios`
* PUT `/api/prontuarios/{id}`
* DELETE `/api/prontuarios/{id}`

### 💰 Pagamentos

* GET `/api/pagamentos`
* GET `/api/pagamentos/{id}`
* POST `/api/pagamentos`
* PUT `/api/pagamentos/{id}`
* DELETE `/api/pagamentos/{id}`

### 📊 Dashboard

* GET `/api/dashboard`

### 🤖 Assistente IA

* POST `/api/assistenteia`

---

## 🧠 Diagrama de Entidades

* MÉDICO 1:N CONSULTA
* PACIENTE 1:N CONSULTA
* CONSULTA 1:1 PRONTUÁRIO
* CONSULTA 1:1 PAGAMENTO
* USUÁRIO 1:N CONSULTA

### Entidades

* **MÉDICO** (Id, Nome, CRM, Especialidade)
* **PACIENTE** (Id, Nome, CPF, Telefone)
* **CONSULTA** (Id, DataConsulta, Status, MotivoConsulta, TipoAtendimento, ValorCobrado, MedicoId, PacienteId)
* **PRONTUÁRIO** (Id, Diagnóstico, Receita, Observações, ConsultaId)
* **PAGAMENTO** (Id, Valor, Status, DataPagamento, ConsultaId)
* **USUÁRIO** (Id, Nome, Email, SenhaHash, Perfil, Ativo, DataCriacao)

---

## 🔐 Controle de Acesso

O sistema utiliza autenticação baseada em JWT.

### Perfis disponíveis:

* **Admin**: acesso total ao sistema
* **Recepcionista**: gestão de pacientes e consultas
* **Médico**: acesso a consultas e prontuários

### Camadas de segurança:

* Frontend: controle de visibilidade de rotas e menus
* Backend: validação de autorização por perfil

---

## 👥 Equipe

Integrante 1
Integrante 2

Ambos os integrantes participaram de todas as etapas do desenvolvimento, incluindo backend, frontend, modelagem do banco de dados, testes e documentação, colaborando de forma conjunta na construção do sistema.

---

## 📌 Considerações Finais

O ControlMed foi desenvolvido como um projeto acadêmico com foco na aplicação prática de conceitos de desenvolvimento full stack, integrando backend, frontend e banco de dados em uma solução coesa e funcional.

Ao longo do desenvolvimento, o sistema evoluiu significativamente, incorporando recursos essenciais como autenticação segura, controle de acesso por perfil e gestão completa de usuários, aproximando-se de aplicações utilizadas em ambientes reais.

A arquitetura adotada prioriza organização, escalabilidade e manutenção, permitindo a evolução contínua do sistema. Entre as possíveis melhorias futuras, destacam-se:

Suporte a múltiplas clínicas (multi-tenant)
Integração com sistemas de pagamento
Implementação de notificações e lembretes de consultas
Aprimoramento da experiência do usuário (UX/UI)

O projeto demonstra não apenas a implementação de funcionalidades, mas também a preocupação com boas práticas de desenvolvimento, organização de código e preparação para crescimento futuro. 

---
