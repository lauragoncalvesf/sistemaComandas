<div>
  <img align="right" width="110" height="170" src="https://assecom.ufersa.edu.br/wp-content/uploads/sites/24/2014/09/PNG-bras%C3%A3o-Ufersa.png" alt="UFERSA" />
</div>

# Sistema de Comandas

Sistema web para gerenciamento de comandas de restaurante/bar. O projeto organiza o atendimento por perfis, permitindo que garcom, cozinha, caixa e gerente tenham telas e ações próprias dentro do fluxo do estabelecimento.

## Funcionalidades

- Login por perfil de funcionario.
- Abertura e acompanhamento de comandas por mesa.
- Adição de produtos na comanda.
- Envio de pedidos para a cozinha.
- Controle de status dos pedidos.
- Registro de pagamentos.
- Fechamento de comandas.
- Gerenciamento de produtos e funcionarios pelo perfil gerente.

## Tecnologias

- Next.js
- React
- Tailwind CSS
- Express
- Prisma
- PostgreSQL
- pnpm

## Como rodar

Entre na pasta da aplicação:

```bash
cd sistema-comandas
```

Instale as dependencias:

```bash
pnpm install
```

Crie o arquivo `.env` com base no exemplo:

```bash
cp .env.example .env
```

Configure a conexão com o PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sistema_comandas?schema=public"
```

Prepare o banco de dados:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Inicie a API:

```bash
pnpm dev:api
```

Em outro terminal, inicie o frontend:

```bash
pnpm dev
```

Acesse no navegador:

```txt
http://localhost:3000
```

## Acessos de teste

| Perfil | Usuario | Senha |
| --- | --- | --- |
| Gerente | `gerente` | `123` |
| Garcom | `garcom` | `123` |
| Caixa | `caixa` | `123` |
| Cozinha | `cozinha` | `123` |

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
