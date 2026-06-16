<div>
  <img align="right" width="110" height="170" src="https://assecom.ufersa.edu.br/wp-content/uploads/sites/24/2014/09/PNG-bras%C3%A3o-Ufersa.png" alt="UFERSA" />
</div>

# Sistema de Comandas para Restaurante/Bar

## Descrição do Projeto

O *Sistema de Comandas* é uma aplicação web desenvolvida para auxiliar no gerenciamento de pedidos em restaurantes, bares e estabelecimentos similares. O sistema permite controlar comandas, produtos, funcionários, pedidos enviados para a cozinha, pagamentos e fechamento de contas.

A solução foi desenvolvida como um *MVP (Minimum Viable Product)* para a disciplina de Engenharia de Software, com o objetivo de transformar os requisitos levantados durante o desenvolvimento do projeto em uma aplicação funcional, navegável e organizada.

O sistema possui diferentes perfis de acesso, permitindo que cada tipo de usuário visualize e utilize apenas as funcionalidades relacionadas ao seu papel dentro do restaurante.

---

## Problema

Em muitos restaurantes e bares, o controle de pedidos ainda é feito manualmente, por meio de anotações em papel ou comunicação verbal entre garçom, cozinha e caixa. Esse processo pode gerar problemas como:

* perda de comandas;
* erros no registro de pedidos;
* dificuldade em acompanhar o status dos itens;
* demora na comunicação com a cozinha;
* falhas no fechamento da conta;
* falta de organização no cadastro de produtos e funcionários.

Diante disso, o sistema propõe uma solução digital para centralizar o fluxo de atendimento, melhorar a organização dos pedidos e facilitar o trabalho dos diferentes setores do estabelecimento.

---

## Objetivo do Sistema

O objetivo do sistema é oferecer uma plataforma simples e funcional para gerenciamento de comandas em restaurantes e bares, permitindo que garçons, cozinha, caixa e gerente realizem suas atividades de forma integrada.

O sistema busca organizar o fluxo de atendimento desde a abertura da comanda até o fechamento da conta, passando pelo envio dos pedidos à cozinha, controle do preparo dos itens e registro do pagamento.

---

## Perfis de Acesso

O sistema possui quatro perfis principais:

### Garçom

Responsável por abrir comandas, adicionar itens, remover itens e enviar pedidos para a cozinha.

### Cozinha

Responsável por visualizar os pedidos enviados, atualizar o status dos itens e indicar quando um pedido está pronto.

### Caixa

Responsável por visualizar comandas, registrar pagamentos e fechar comandas.

### Gerente

Responsável pelo gerenciamento de produtos e funcionários do sistema.

---

## Principais Funcionalidades

### Autenticação

* Login com usuário, senha e perfil;
* Redirecionamento para o painel correspondente ao perfil do funcionário;
* Separação das funcionalidades conforme o tipo de usuário.

### Comandas

* Abrir comanda;
* Adicionar itens à comanda;
* Remover itens da comanda;
* Enviar pedidos para a cozinha;
* Visualizar itens da comanda;
* Atualizar status dos itens;
* Registrar pagamentos;
* Fechar comanda.

### Status dos Itens

Os itens de uma comanda podem possuir os seguintes status:

* pendente;
* em_preparo;
* pronto;
* entregue.

Esses status permitem acompanhar o andamento dos pedidos entre o garçom, a cozinha e o caixa.

### Produtos

* Cadastro de produtos;
* Edição de produtos;
* Exclusão de produtos;
* Controle de disponibilidade;
* Configuração se o produto deve ou não ser enviado para a cozinha.

### Funcionários

* Cadastro de funcionários;
* Edição de funcionários;
* Exclusão de funcionários;
* Ativação e desativação de funcionários;
* Controle de perfil de acesso.

### Pagamentos

* Registro de pagamento de comanda;
* Cálculo do valor total;
* Cálculo do valor pago;
* Verificação de saldo restante;
* Fechamento da comanda após pagamento.

---

## Tecnologias Utilizadas

### Frontend

* *Next.js* - framework React utilizado para construção da interface web;
* *React* - biblioteca utilizada para criação dos componentes da aplicação;
* *Context API* - utilizada para gerenciamento de estado global;
* *JavaScript* - linguagem principal do frontend;
* *Tailwind CSS* - utilizado para estilização das telas.

### Backend

* *Node.js* - ambiente de execução JavaScript no servidor;
* *Express.js* - framework utilizado para criação da API REST;
* *CORS* - utilizado para permitir a comunicação entre frontend e backend;
* *Prisma ORM* - utilizado para comunicação com o banco de dados;
* *PostgreSQL* - banco de dados relacional utilizado para persistência das informações.

### Ferramentas de Desenvolvimento

* *Git* - controle de versão;
* *GitHub* - hospedagem do repositório;
* *VS Code* - ambiente de desenvolvimento;
* *pnpm* - gerenciador de pacotes.

---

## Arquitetura Mínima

A aplicação foi organizada em duas partes principais:

1. *Frontend*, responsável pela interface com o usuário;
2. *Backend*, responsável pelas regras de negócio, rotas da API e comunicação com o banco de dados.

O frontend se comunica com o backend por meio de requisições HTTP para uma API REST. O backend processa essas requisições, executa as regras de negócio e utiliza o Prisma ORM para acessar o banco de dados PostgreSQL.

---

## Fluxo Básico de Funcionamento

O fluxo principal do sistema ocorre da seguinte forma:

1. O funcionário acessa a tela de login;
2. O sistema identifica o perfil informado no login;
3. O usuário é direcionado para o painel correspondente ao seu perfil;
4. O garçom pode abrir uma comanda e adicionar produtos;
5. Os itens que precisam de preparo são enviados para a cozinha;
6. A cozinha acompanha os pedidos e atualiza seus status;
7. O caixa registra o pagamento da comanda;
8. Após o pagamento, a comanda pode ser fechada;
9. O gerente pode gerenciar produtos e funcionários.

---

## Estrutura do Projeto

A estrutura principal do projeto está organizada da seguinte forma:

```txt
sistema-comandas/
├── app/
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   ├── login-screen.jsx
│   ├── waiter-panel.jsx
│   ├── kitchen-panel.jsx
│   ├── cashier-panel.jsx
│   ├── manager-panel.jsx
│   └── ...
├── lib/
│   └── store.jsx
├── server/
│   ├── index.js
│   ├── db.js
│   └── data.js
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── public/
├── package.json
├── README.md
└── .env.example
```

---

## Responsabilidades dos Principais Componentes

### app/page.jsx

Arquivo principal da aplicação no frontend. Ele controla a exibição da tela de login e dos painéis de acordo com o perfil do usuário autenticado.

### components/login-screen.jsx

Componente responsável pela tela de login do sistema.

### components/waiter-panel.jsx

Componente responsável pelas funcionalidades do garçom, como abertura de comandas, adição de itens e envio de pedidos para a cozinha.

### components/kitchen-panel.jsx

Componente responsável pela visualização dos pedidos enviados para a cozinha e pela atualização do status dos itens.

### components/cashier-panel.jsx

Componente responsável pelo registro de pagamentos e fechamento das comandas.

### components/manager-panel.jsx

Componente responsável pelo gerenciamento de produtos e funcionários.

### lib/store.jsx

Arquivo responsável pelo gerenciamento de estado global da aplicação, armazenamento dos dados utilizados pelo frontend e comunicação com a API.

### server/index.js

Arquivo principal do backend. Contém as rotas da API, regras de negócio e endpoints utilizados pelo frontend.

### server/db.js

Arquivo responsável pela configuração da conexão com o banco de dados utilizando Prisma.

### prisma/schema.prisma

Arquivo que define o modelo do banco de dados, incluindo as entidades do sistema, seus campos e relacionamentos.

### prisma/seed.js

Arquivo utilizado para inserir dados iniciais no banco de dados, como produtos e funcionários de exemplo.

---

## Modelagem de Dados

O sistema utiliza as seguintes entidades principais:

### Funcionário

Representa os usuários do sistema. Cada funcionário possui nome, usuário, senha, perfil e status de atividade.

Perfis disponíveis:

* garçom;
* cozinha;
* caixa;
* gerente.

### Produto

Representa os itens vendidos pelo restaurante/bar. Cada produto possui nome, preço, categoria, disponibilidade e uma configuração indicando se deve ou não ser enviado para a cozinha.

### Comanda

Representa uma conta aberta para uma mesa ou cliente. A comanda possui itens, pagamentos, status e informações relacionadas ao garçom responsável.

### Item da Comanda

Representa um produto adicionado a uma comanda. Cada item possui quantidade, preço, status e indicação se foi enviado para a cozinha.

### Pagamento

Representa os pagamentos realizados em uma comanda, contendo valor, forma de pagamento e data do registro.

---

## Endpoints Principais da API

### Health Check

```http
GET /api/health
```

Verifica se a API está funcionando.

### Autenticação

```http
POST /api/auth/login
```

Realiza o login do funcionário.

### Produtos

```http
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

Rotas responsáveis por listar, cadastrar, editar e excluir produtos.

### Funcionários

```http
GET /api/employees
POST /api/employees
PUT /api/employees/:id
DELETE /api/employees/:id
```

Rotas responsáveis por listar, cadastrar, editar e excluir funcionários.

### Comandas

```http
GET /api/comandas
POST /api/comandas
POST /api/comandas/:id/items
DELETE /api/comandas/:id/items/:itemId
POST /api/comandas/:id/send-to-kitchen
PATCH /api/comandas/:id/items/:itemId/status
POST /api/comandas/:id/payments
POST /api/comandas/:id/close
```

Rotas responsáveis pelo controle das comandas, itens, envio para cozinha, atualização de status, pagamentos e fechamento.

---

## Requisitos Funcionais

| Código | Requisito                                                          | Status           |
| ------ | ------------------------------------------------------------------ | ---------------- |
| RF01   | O sistema deve permitir login de funcionários por perfil.          | Implementado     |
| RF02   | O sistema deve permitir abertura de comandas.                      | Implementado     |
| RF03   | O sistema deve permitir adicionar itens à comanda.                 | Implementado     |
| RF04   | O sistema deve permitir remover itens da comanda.                  | Implementado     |
| RF05   | O sistema deve permitir enviar pedidos para a cozinha.             | Implementado     |
| RF06   | O sistema deve permitir que a cozinha atualize o status dos itens. | Implementado     |
| RF07   | O sistema deve permitir registrar pagamentos.                      | Implementado     |
| RF08   | O sistema deve permitir fechar comandas pagas.                     | Implementado     |
| RF09   | O sistema deve permitir cadastrar produtos.                        | Implementado     |
| RF10   | O sistema deve permitir editar produtos.                           | Implementado     |
| RF11   | O sistema deve permitir excluir produtos.                          | Implementado     |
| RF12   | O sistema deve permitir controlar disponibilidade dos produtos.    | Implementado     |
| RF13   | O sistema deve permitir cadastrar funcionários.                    | Implementado     |
| RF14   | O sistema deve permitir editar funcionários.                       | Implementado     |
| RF15   | O sistema deve permitir excluir funcionários.                      | Implementado     |
| RF16   | O sistema deve permitir ativar ou desativar funcionários.          | Implementado     |
| RF17   | O sistema deve permitir gerar relatórios gerenciais.               | Não implementado |
| RF18   | O sistema deve permitir histórico detalhado de vendas.             | Não implementado |

---

## Backlog do Projeto

| História de Usuário                                                                              | Prioridade | Status           |
| ------------------------------------------------------------------------------------------------ | ---------- | ---------------- |
| Como garçom, quero abrir uma comanda para registrar pedidos de uma mesa.                         | Alta       | Implementado     |
| Como garçom, quero adicionar produtos à comanda para registrar os pedidos do cliente.            | Alta       | Implementado     |
| Como garçom, quero remover itens da comanda caso tenha ocorrido algum erro.                      | Alta       | Implementado     |
| Como garçom, quero enviar pedidos para a cozinha para que sejam preparados.                      | Alta       | Implementado     |
| Como funcionário da cozinha, quero visualizar os pedidos pendentes para iniciar o preparo.       | Alta       | Implementado     |
| Como funcionário da cozinha, quero alterar o status do pedido para indicar seu andamento.        | Alta       | Implementado     |
| Como caixa, quero visualizar comandas abertas para registrar o pagamento.                        | Alta       | Implementado     |
| Como caixa, quero registrar pagamentos para controlar o fechamento da conta.                     | Alta       | Implementado     |
| Como caixa, quero fechar comandas após o pagamento completo.                                     | Alta       | Implementado     |
| Como gerente, quero cadastrar produtos para manter o cardápio atualizado.                        | Média      | Implementado     |
| Como gerente, quero editar produtos para atualizar preços, categorias e disponibilidade.         | Média      | Implementado     |
| Como gerente, quero excluir produtos que não fazem mais parte do cardápio.                       | Média      | Implementado     |
| Como gerente, quero cadastrar funcionários para controlar o acesso ao sistema.                   | Média      | Implementado     |
| Como gerente, quero editar funcionários para atualizar dados e perfis.                           | Média      | Implementado     |
| Como gerente, quero ativar ou desativar funcionários para controlar quem pode acessar o sistema. | Média      | Implementado     |
| Como gerente, quero visualizar relatórios de vendas para acompanhar o desempenho do restaurante. | Baixa      | Não implementado |
| Como gerente, quero consultar histórico detalhado de comandas fechadas.                          | Baixa      | Não implementado |
| Como gerente, quero visualizar indicadores financeiros em dashboard.                             | Baixa      | Não implementado |

---

## Protótipo Navegável

Caso a apresentação seja realizada diretamente pelo sistema em execução, o protótipo funcional será demonstrado por meio das telas implementadas no frontend.

---

## Como Executar o Projeto

### Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* Node.js;
* pnpm;
* PostgreSQL;
* Git.

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
```

Acesse a pasta da aplicação:

```bash
cd sistema-comandas
```

### 2. Instalar as Dependências

```bash
pnpm install
```

### 3. Configurar as Variáveis de Ambiente

Crie o arquivo `.env` com base no arquivo de exemplo:

```bash
cp .env.example .env
```

Configure as variáveis de ambiente:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sistema_comandas"
PORT=3333
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Também é recomendado manter o arquivo `.env.example` no repositório, sem dados sensíveis.

### 4. Configurar o Banco de Dados

Gere o cliente Prisma e execute as migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Caso queira inserir os dados iniciais:

```bash
pnpm db:seed
```

### 5. Executar o Backend

Em um terminal, execute:

```bash
pnpm dev:api
```

A API será executada em:

```txt
http://localhost:3333
```

Para testar se a API está funcionando, acesse:

```txt
http://localhost:3333/api/health
```

Retorno esperado:

```json
{
  "ok": true,
  "service": "sistema-comandas-api"
}
```

### 6. Executar o Frontend

Em outro terminal, execute:

```bash
pnpm dev
```

A aplicação será executada em:

```txt
http://localhost:3000
```

---

## Dados de Acesso

Caso o banco seja populado com dados iniciais, utilize os usuários definidos no arquivo `prisma/seed.js`.

| Perfil  | Usuário   | Senha |
| ------- | --------- | ----- |
| Gerente | `gerente` | `123` |
| Garçom  | `garcom`  | `123` |
| Caixa   | `caixa`   | `123` |
| Cozinha | `cozinha` | `123` |

> Observação: os usuários e senhas podem variar conforme os dados cadastrados no banco ou definidos no arquivo `prisma/seed.js`.

---

## Status Atual do Desenvolvimento

O projeto encontra-se em fase de *MVP funcional*.

Funcionalidades já implementadas:

* login por perfil;
* abertura de comandas;
* adição e remoção de itens;
* envio de pedidos para cozinha;
* atualização de status dos itens;
* cadastro, edição e exclusão de produtos;
* cadastro, edição e exclusão de funcionários;
* ativação e desativação de funcionários;
* registro de pagamentos;
* fechamento de comandas;
* integração entre frontend e backend;
* persistência de dados com PostgreSQL e Prisma.

Funcionalidades previstas para versões futuras:

* autenticação mais robusta com tokens;
* criptografia de senhas;
* relatórios gerenciais;
* dashboard financeiro;
* histórico avançado de vendas;
* controle de cancelamentos e estornos;
* atualização em tempo real entre os painéis;
* emissão ou impressão de comprovantes;
* melhorias de responsividade;
* deploy da aplicação.

---

## Decisões Técnicas

Durante o desenvolvimento do projeto, algumas decisões foram tomadas para atender ao objetivo de criar um MVP funcional:

* Utilização do *Next.js* para construção rápida e organizada da interface;
* Utilização do *Express.js* para criação de uma API REST simples e objetiva;
* Utilização do *Prisma ORM* para facilitar a modelagem e manipulação dos dados;
* Utilização do *PostgreSQL* por ser um banco relacional adequado ao domínio do sistema;
* Separação dos usuários por perfis para representar o funcionamento real de um restaurante/bar;
* Organização da aplicação em painéis separados para facilitar a navegação;
* Desenvolvimento baseado em funcionalidades essenciais para o fluxo principal de uma comanda.

---

## Relação com Práticas de Mercado

O projeto utiliza conceitos presentes em ambientes reais de desenvolvimento de software, como:

* desenvolvimento de um MVP;
* organização de requisitos por histórias de usuário;
* versionamento com Git;
* separação entre frontend e backend;
* uso de API REST;
* persistência em banco de dados relacional;
* organização de componentes;
* uso de ORM;
* divisão do sistema por perfis de acesso;
* documentação mínima do projeto.

Esses elementos aproximam o projeto de práticas utilizadas em desafios técnicos, bootcamps, processos seletivos e projetos iniciais de sistemas no mercado.

---

## Possíveis Melhorias Futuras

Embora o MVP já contemple o fluxo principal de gerenciamento de comandas, algumas melhorias podem ser implementadas em versões futuras:

* autenticação com JWT;
* criptografia de senhas com bcrypt;
* controle de permissões no backend;
* atualização em tempo real com WebSocket ou Socket.IO;
* relatórios de vendas por período;
* dashboard gerencial;
* controle de estoque;
* integração com impressora de cozinha;
* cadastro de mesas;
* emissão de comprovantes;
* cancelamento de itens com justificativa;
* estorno de pagamentos;
* deploy em ambiente web.

---

## Conclusão

O Sistema de Comandas foi desenvolvido com o objetivo de representar uma solução prática para o gerenciamento de pedidos em restaurantes e bares. A aplicação contempla o fluxo principal de funcionamento de uma comanda, desde a abertura pelo garçom até o fechamento pelo caixa, passando pelo acompanhamento dos pedidos pela cozinha e pelo gerenciamento de produtos e funcionários pelo gerente.

Como MVP acadêmico, o sistema demonstra a transformação dos requisitos levantados em telas funcionais, estrutura de código organizada, modelagem de dados e integração entre frontend, backend e banco de dados.

---

## Contribuidores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/anavitoriaq">
        <img src="https://github.com/anavitoriaq.png" width="100" alt="Ana Vitoria" />
        <br />
        <sub><b>Ana Vitoria</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/lauragoncalvesf">
        <img src="https://github.com/lauragoncalvesf.png" width="100" alt="Laura Goncalves" />
        <br />
        <sub><b>Laura Goncalves</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/mateuskaynan">
        <img src="https://github.com/mateuskaynan.png" width="100" alt="Mateus Kaynan" />
        <br />
        <sub><b>Mateus Kaynan</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/saraVitoria0">
        <img src="https://github.com/saraVitoria0.png" width="100" alt="Sara Vitoria" />
        <br />
        <sub><b>Sara Vitoria</b></sub>
      </a>
    </td>
  </tr>
</table>
